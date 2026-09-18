from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
import os
import shutil
import uuid
from datetime import datetime

from app.config import list_cases
from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_db as get_mongo_db
from app.database.supabase import Base, engine, get_db as get_postgres_db, SessionLocal
from app.database.models import Entity, Relationship, Alert, Case, UploadedFile, AnalysisRun
from app.pipeline import run_pipeline

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CRIMEPATROL API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    
    # Seed mock case if it doesn't exist
    db = SessionLocal()
    if not db.query(Case).first():
        db.add(Case(id="mock_case_id", name="Flagship Jewelry Heist", priority="High"))
        db.commit()
    db.close()
    
    # Ensure upload dir exists
    os.makedirs("uploads", exist_ok=True)

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/api/cases", response_model=List[str])
async def get_cases(db: Session = Depends(get_postgres_db)):
    cases = db.query(Case).all()
    if cases:
        return [c.id for c in cases]
    return list_cases()

@app.post("/api/analyze/{case_id}")
async def analyze_case(case_id: str, db: Session = Depends(get_postgres_db)):
    try:
        from app.database.mongodb import db as mongo_client
        
        # Log analysis run
        run_id = f"RUN-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        new_run = AnalysisRun(id=run_id, case_id=case_id, status="Running", files_processed=0)
        db.add(new_run)
        db.commit()
        
        res = run_pipeline(case_id, db, mongo_client.db)
        
        # Update analysis run
        new_run.status = "Completed"
        new_run.duration = "0m 10s" # mock duration
        new_run.findings = f"Found connections"
        db.commit()
        
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/graph")
async def get_graph(case_id: str, db: Session = Depends(get_postgres_db)):
    entities = db.query(Entity).filter(Entity.case_id == case_id).all()
    relationships = db.query(Relationship).filter(Relationship.case_id == case_id).all()
    
    nodes = [{"data": {"id": e.id, "label": e.name, "type": e.type}} for e in entities]
    edges = [{"data": {"source": r.source_id, "target": r.target_id, "label": r.type, "weight": r.weight}} for r in relationships]
    
    return {"nodes": nodes, "edges": edges}

@app.get("/api/players")
async def get_players(case_id: str, db: Session = Depends(get_postgres_db)):
    # Simple players logic: return PERSONs, ordered by number of connections (rudimentary)
    # Ideally we'd store PageRank in DB, but for now just returning entities.
    persons = db.query(Entity).filter(Entity.case_id == case_id, Entity.type == "PERSON").limit(50).all()
    return [{"id": p.id, "name": p.name, "type": p.type} for p in persons]

@app.get("/api/alerts")
async def get_alerts(case_id: str, db: Session = Depends(get_postgres_db)):
    alerts = db.query(Alert).filter(Alert.case_id == case_id).order_by(Alert.created_at.desc()).all()
    return [{"id": a.id, "severity": a.severity, "title": a.title, "description": a.description, "entity_id": a.entity_id} for a in alerts]

@app.get("/api/entity/{id}")
async def get_entity(id: str, db: Session = Depends(get_postgres_db)):
    entity = db.query(Entity).filter(Entity.id == id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    # Get connections
    as_source = db.query(Relationship).filter(Relationship.source_id == id).all()
    as_target = db.query(Relationship).filter(Relationship.target_id == id).all()
    
    return {
        "id": entity.id,
        "name": entity.name,
        "type": entity.type,
        "connections": len(as_source) + len(as_target)
    }

@app.get("/api/search")
async def search(q: str, case_id: str = None, db: Session = Depends(get_postgres_db)):
    query = db.query(Entity).filter(Entity.name.ilike(f"%{q}%"))
    if case_id:
        query = query.filter(Entity.case_id == case_id)
    results = query.limit(20).all()
    return [{"id": r.id, "name": r.name, "type": r.type, "case_id": r.case_id} for r in results]

@app.get("/api/ground-truth/{case_id}")
async def get_ground_truth(case_id: str):
    # This implies we re-evaluate GT on the fly or pull it from DB. 
    # For now, let's just return a mock or call the function directly if needed.
    # Since run_pipeline prints it, we might want to store gt_match in DB or recalculate.
    # Recalculating is easy enough:
    from app.config import case_path
    from app.validation.ground_truth import validate_against_ground_truth
    from app.database.mongodb import db as mongo_client
    
    # We can reconstruct canonical roughly to check GT, but we don't have it structured.
    # Let's return a dummy or pull from a Stats table. For now, returning dummy.
    # Or actually, we can query Entities from DB for the case.
    from app.database.supabase import SessionLocal
    db = SessionLocal()
    entities = db.query(Entity).filter(Entity.case_id == case_id).all()
    db.close()
    
    canonical_mock = {e.id: {"name": e.name, "type": e.type} for e in entities}
    stats = validate_against_ground_truth(case_path(case_id), canonical_mock)
    
    return {"match_percentage": stats["match_percentage"]}

@app.post("/api/upload/{case_id}")
async def upload_file(case_id: str, file: UploadFile = File(...), db: Session = Depends(get_postgres_db)):
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    size_mb = os.path.getsize(file_location) / (1024 * 1024)
    file_record = UploadedFile(
        case_id=case_id, 
        name=file.filename, 
        size_mb=round(size_mb, 2), 
        type=file.filename.split('.')[-1].upper(),
        path=file_location
    )
    db.add(file_record)
    db.commit()
    return {"status": "success", "filename": file.filename}

@app.get("/api/files/{case_id}")
async def get_files(case_id: str, db: Session = Depends(get_postgres_db)):
    files = db.query(UploadedFile).filter(UploadedFile.case_id == case_id).all()
    return [{"id": f.id, "name": f.name, "size": f"{f.size_mb} MB", "status": f.status, "type": f.type} for f in files]

@app.get("/api/analyses/{case_id}")
async def get_analyses(case_id: str, db: Session = Depends(get_postgres_db)):
    runs = db.query(AnalysisRun).filter(AnalysisRun.case_id == case_id).order_by(AnalysisRun.created_at.desc()).all()
    return [{"id": r.id, "date": r.created_at.strftime('%d %b %Y, %H:%M'), "status": r.status, "findings": r.findings, "duration": r.duration} for r in runs]

@app.get("/api/entities/type/{entity_type}")
async def get_entities_by_type(entity_type: str, db: Session = Depends(get_postgres_db)):
    # Used for Locations, Vehicles, CCTV, etc.
    results = db.query(Entity).filter(Entity.type == entity_type.upper()).all()
    return [{"id": e.id, "name": e.name, "type": e.type, "case_id": e.case_id} for e in results]
