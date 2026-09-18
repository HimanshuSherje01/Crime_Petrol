from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_, text
from typing import List
import os
import re
import shutil
import uuid
from datetime import datetime

from app.config import list_cases
from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_db as get_mongo_db
from app.database.supabase import Base, engine, get_db as get_postgres_db, SessionLocal
from app.database.models import Entity, Relationship, Alert, Case, UploadedFile, AnalysisRun, ParsedDocument
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

    # Lightweight migration: add analytics columns to an existing entities table
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE entities ADD COLUMN IF NOT EXISTS pagerank FLOAT"))
            conn.execute(text("ALTER TABLE entities ADD COLUMN IF NOT EXISTS betweenness FLOAT"))
            conn.execute(text("ALTER TABLE entities ADD COLUMN IF NOT EXISTS community INTEGER"))
            conn.execute(text("ALTER TABLE entities ADD COLUMN IF NOT EXISTS risk_score FLOAT"))
    except Exception as e:
        print(f"Migration (entities analytics columns) skipped: {e}")

    # Ensure upload dir exists
    os.makedirs("uploads", exist_ok=True)

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/api/cases", response_model=List[str])
async def get_cases(db: Session = Depends(get_postgres_db)):
    # Authoritative source: case folders available on disk (synthetic dataset).
    folder_cases = list_cases()
    if folder_cases:
        return folder_cases
    # Fallback: previously-registered cases in Postgres.
    cases = db.query(Case).all()
    return [c.id for c in cases] if cases else []

@app.post("/api/analyze/{case_id}")
async def analyze_case(case_id: str, db: Session = Depends(get_postgres_db)):
    from app.database.mongodb import db as mongo_client

    # Log analysis run
    run_id = f"RUN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4]}"
    new_run = AnalysisRun(id=run_id, case_id=case_id, status="Running", files_processed=0)
    db.add(new_run)
    db.commit()

    try:
        res = run_pipeline(case_id, db, mongo_client.db)
    except Exception as e:
        print(f"Pipeline failed for {case_id}: {e}")
        db.rollback()  # session may be in a failed state after the pipeline error
        new_run = db.query(AnalysisRun).filter(AnalysisRun.id == run_id).first()
        if new_run is None:
            new_run = AnalysisRun(id=run_id, case_id=case_id, status="Failed")
            db.add(new_run)
        new_run.status = "Failed"
        new_run.findings = str(e)[:200]
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

    files_processed = len(res.get("files_processed", []))
    nodes = res["metadata"]["nodes"]
    edges = res["metadata"]["edges"]
    alerts_count = res["metadata"]["alerts_count"]

    # Update analysis run
    new_run.status = "Completed"
    new_run.files_processed = files_processed
    new_run.findings = f"{nodes} entities, {edges} edges, {alerts_count} alerts"
    new_run.duration = "Pipeline complete"
    db.commit()

    res["run"] = {
        "id": run_id,
        "date": new_run.created_at.strftime('%d %b %Y, %H:%M'),
        "status": new_run.status,
        "files": files_processed,
        "findings": new_run.findings,
        "duration": new_run.duration,
    }

    return res

@app.get("/api/graph")
async def get_graph(case_id: str, db: Session = Depends(get_postgres_db)):
    entities = db.query(Entity).filter(Entity.case_id == case_id).all()
    relationships = db.query(Relationship).filter(Relationship.case_id == case_id).all()
    
    nodes = [{"data": {"id": e.id, "label": e.name, "type": e.type}} for e in entities]
    edges = [{"data": {"source": r.source_id, "target": r.target_id, "label": r.type, "weight": r.weight}} for r in relationships]
    
    return {"nodes": nodes, "edges": edges}

@app.get("/api/players")
async def get_players(case_id: str, db: Session = Depends(get_postgres_db)):
    persons = db.query(Entity).filter(Entity.case_id == case_id, Entity.type == "PERSON").all()
    players = []
    for p in persons:
        connections = (
            db.query(Relationship)
            .filter(Relationship.case_id == case_id)
            .filter(or_(Relationship.source_id == p.id, Relationship.target_id == p.id))
            .count()
        )
        if p.risk_score is not None and p.community is not None:
            risk_score = round(p.risk_score, 1)
        else:
            risk_score = round(min(100.0, max(10.0, connections * 10.0)), 1)
        players.append({
            "id": p.id,
            "name": p.name,
            "type": p.type,
            "connections": connections,
            "pagerank": round(p.pagerank or 0, 4),
            "betweenness": round(p.betweenness or 0, 4),
            "community": p.community or 0,
            "risk_score": risk_score,
            "threat_level": (
                "Critical" if risk_score >= 80 else
                "High" if risk_score >= 60 else
                "Medium" if risk_score >= 40 else
                "Low"
            )
        })
    players.sort(key=lambda p: p["risk_score"], reverse=True)
    return players

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
    
    from app.database.supabase import SessionLocal
    db = SessionLocal()
    entities = db.query(Entity).filter(Entity.case_id == case_id).all()
    db.close()
    
    canonical_mock = {e.id: {"name": e.name, "type": e.type} for e in entities}
    stats = validate_against_ground_truth(case_path(case_id), canonical_mock)

    return {
        "match_percent": stats.get("match_percentage", 0),
        "expected": stats.get("total_gt_entities", 0),
        "detected": stats.get("found_gt_entities", 0),
    }

@app.post("/api/upload/{case_id}")
async def upload_file(case_id: str, files: List[UploadFile] = File(...), db: Session = Depends(get_postgres_db)):
    from app.config import case_path
    
    target_dir = case_path(case_id)
    uploaded_names = []
    
    for file in files:
        if not file.filename: continue
            
        file_location = target_dir / file.filename
        file_location.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        
        size_mb = os.path.getsize(file_location) / (1024 * 1024)
        
        existing = db.query(UploadedFile).filter(UploadedFile.case_id == case_id, UploadedFile.name == file.filename).first()
        if not existing:
            file_record = UploadedFile(
                case_id=case_id, 
                name=file.filename, 
                size_mb=round(size_mb, 2), 
                type=file.filename.split('.')[-1].upper(),
                path=str(file_location)
            )
            db.add(file_record)
        uploaded_names.append(file.filename)
        
    db.commit()
    return {"status": "success", "uploaded": len(uploaded_names)}

@app.delete("/api/clear/{case_id}")
async def clear_case(case_id: str, db: Session = Depends(get_postgres_db)):
    try:
        # Postgres Cleanup
        db.query(Alert).filter(Alert.case_id == case_id).delete()
        db.query(Relationship).filter(Relationship.case_id == case_id).delete()
        db.query(Entity).filter(Entity.case_id == case_id).delete()
        db.query(AnalysisRun).filter(AnalysisRun.case_id == case_id).delete()
        db.query(UploadedFile).filter(UploadedFile.case_id == case_id).delete()
        db.query(ParsedDocument).filter(ParsedDocument.case_id == case_id).delete()
        db.commit()
        
        # Disk Cleanup
        from app.config import case_path
        path = case_path(case_id)
        if path.exists():
            shutil.rmtree(path)
            
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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


_MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}

def _parse_dates(text_content: str):
    """Return a list of unique (date_object, time_string_or_None) tuples found in text."""
    found = []
    for m in re.finditer(r"\b(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?\b", text_content):
        try:
            d = datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
            t = f"{int(m.group(4)):02d}:{m.group(5)}" if m.group(4) else None
            found.append((d, t))
        except ValueError:
            pass
    for m in re.finditer(r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b", text_content):
        try:
            d = datetime(int(m.group(3)), int(m.group(2)), int(m.group(1)))
            found.append((d, None))
        except ValueError:
            pass
    for m in re.finditer(r"\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})\b", text_content, re.IGNORECASE):
        try:
            d = datetime(int(m.group(3)), _MONTHS[m.group(2).lower()], int(m.group(1)))
            found.append((d, None))
        except ValueError:
            pass
    # De-duplicate while preserving order
    seen = set()
    unique = []
    for item in found:
        key = (item[0].date().isoformat(), item[1])
        if key not in seen:
            seen.add(key)
            unique.append(item)
    return unique


@app.get("/api/timeline/{case_id}")
async def get_timeline(case_id: str, db: Session = Depends(get_postgres_db)):
    from app.config import case_path

    stored = db.query(ParsedDocument).filter(ParsedDocument.case_id == case_id).all()
    docs = [
        {"file": d.file, "text": d.text, "source_type": d.source_type}
        for d in stored
    ]

    if not docs:
        # Fallback: re-parse lightweight text/CSV files only (pre-existing cases)
        from app.parsers.text_parser import parse_text
        from app.parsers.csv_parser import parse_csv
        path = case_path(case_id)
        docs = parse_text(path) + parse_csv(path)

    entities = db.query(Entity).filter(Entity.case_id == case_id).all()
    ent_by_name = {e.name.lower(): e for e in entities}

    events = []
    for doc in docs:
        text = doc.get("text", "") or ""
        name = doc.get("file", "")
        mentions = []
        for name_lower, e in ent_by_name.items():
            if name_lower in text.lower():
                mentions.append({"id": e.id, "name": e.name, "type": e.type})

        dates = _parse_dates(text)
        if not dates:
            events.append({
                "date": None,
                "display": "Date unknown",
                "source_type": doc.get("source_type", "DOCUMENT"),
                "file": name,
                "entities": mentions,
            })
            continue
        for d, t in dates:
            base = d.strftime("%a, %d %b %Y")
            display = f"{base}" if t is None else f"{base} · {t}"
            events.append({
                "date": d.date().isoformat() + (f"T{t}" if t else ""),
                "display": display,
                "source_type": doc.get("source_type", "DOCUMENT"),
                "file": name,
                "entities": mentions,
            })

    events.sort(key=lambda ev: ev["date"] or "9999")
    return events
