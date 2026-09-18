import time
from app.config import case_path
from app.parsers.ocr_parser import parse_ocr
from app.parsers.audio_parser import parse_audio
from app.parsers.csv_parser import parse_csv
from app.parsers.text_parser import parse_text
from app.nlp.entity_extractor import extract
from app.nlp.resolver import resolve_entities
from app.graph.builder import build_graph
from app.graph.analytics import analyze
from app.alerts.rules import generate_alerts
from app.validation.ground_truth import validate_against_ground_truth

from sqlalchemy.orm import Session
from app.database.models import Entity, Relationship, Alert

def run_pipeline(case_id: str, db: Session, mongo_db):
    print(f"Starting pipeline for {case_id}")
    path = case_path(case_id)
    if not path.exists():
        raise ValueError(f"Case path {path} does not exist")
        
    # 1. Parse Data
    print("Step 1: Parsing data...")
    parsed_data = []
    parsed_data.extend(parse_ocr(path))
    parsed_data.extend(parse_audio(path))
    parsed_data.extend(parse_csv(path))
    parsed_data.extend(parse_text(path))
    
    print(f"Extracted {len(parsed_data)} documents.")
    
    # Save parsed data to MongoDB
    if mongo_db is not None:
        case_col = mongo_db[f"{case_id}_parsed_data"]
        case_col.drop()
        if parsed_data:
            case_col.insert_many(parsed_data)

    # 2. Extract Entities
    print("Step 2: Extracting entities...")
    raw_entities = []
    for doc in parsed_data:
        ents = extract(doc["text"], doc["source_type"], doc["file"])
        raw_entities.extend(ents)
        
    print(f"Extracted {len(raw_entities)} raw entities.")

    # 3. Resolve Entities
    print("Step 3: Resolving entities...")
    resolution = resolve_entities(raw_entities)
    canonical = resolution["canonical_entities"]
    print(f"Resolved to {len(canonical)} canonical entities.")

    # 4. Build Graph
    print("Step 4: Building graph...")
    G = build_graph(canonical, resolution["text_to_id"])
    print(f"Graph created with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges.")

    # 5. Graph Analytics
    print("Step 5: Running graph analytics...")
    analytics_res = analyze(G)

    # 6. Alerts
    print("Step 6: Generating alerts...")
    alerts = generate_alerts(case_id, G, analytics_res)
    print(f"Generated {len(alerts)} alerts.")

    # 7. Ground Truth Validation
    print("Step 7: Validating against ground truth...")
    gt_stats = validate_against_ground_truth(path, canonical)
    print(f"Validation Match: {gt_stats['match_percentage']}%")

    # 8. Save to Supabase (Postgres)
    print("Step 8: Saving to Postgres...")
    # Clear old data for case
    db.query(Alert).filter(Alert.case_id == case_id).delete()
    db.query(Relationship).filter(Relationship.case_id == case_id).delete()
    db.query(Entity).filter(Entity.case_id == case_id).delete()
    db.commit()

    # Insert Entities
    for e_id, e_data in canonical.items():
        db.add(Entity(
            id=e_id, 
            name=e_data["name"], 
            type=e_data["type"], 
            case_id=case_id
        ))
    
    # Insert Relationships (Edges)
    for u, v, data in G.edges(data=True):
        db.add(Relationship(
            source_id=u,
            target_id=v,
            type=data.get("type", "ASSOCIATED_WITH"),
            weight=data.get("weight", 1.0),
            case_id=case_id
        ))
        
    # Insert Alerts
    for alert in alerts:
        db.add(Alert(
            case_id=alert["case_id"],
            severity=alert["severity"],
            title=alert["title"],
            description=alert["description"],
            entity_id=alert["entity_id"]
        ))
        
    db.commit()
    print("Pipeline completed successfully.")
    
    return {
        "status": "success",
        "nodes": G.number_of_nodes(),
        "edges": G.number_of_edges(),
        "alerts_count": len(alerts),
        "gt_match": gt_stats["match_percentage"]
    }
