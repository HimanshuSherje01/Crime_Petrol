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
    alerts = generate_alerts(case_id, G, analytics_res, entity_ids=set(canonical.keys()))
    # Safety net: an alert must reference a real entity (file nodes are not entities)
    for alert in alerts:
        if alert.get("entity_id") not in canonical:
            alert["entity_id"] = None
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
    db.flush()  # Ensure entities are written before FK-referencing rows

    # Insert Relationships (Edges) — only where both endpoints are real entities
    for u, v, data in G.edges(data=True):
        if u not in canonical or v not in canonical:
            continue
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

    # Serialize the graph in the format consumed by the frontend (Cytoscape-style)
    nodes = [
        {"data": {"id": e_id, "label": e_data["name"], "type": e_data["type"]}}
        for e_id, e_data in canonical.items()
    ]
    edges = [
        {"data": {
            "source": u,
            "target": v,
            "label": data.get("type", "ASSOCIATED_WITH"),
            "weight": data.get("weight", 1.0),
        }}
        for u, v, data in G.edges(data=True)
    ]

    players = _build_players(canonical, analytics_res)

    # Files the pipeline actually parsed (for the Uploaded Files panel)
    seen, files_processed = set(), []
    for doc in parsed_data:
        name = doc["file"]
        if name not in seen:
            seen.add(name)
            files_processed.append({
                "name": name,
                "type": doc["source_type"],
                "status": "Parsed",
            })

    return {
        "case_id": case_id,
        "graph": {"nodes": nodes, "edges": edges},
        "players": players,
        "alerts": alerts,
        "entities": [
            {"id": e_id, "name": e_data["name"], "type": e_data["type"]}
            for e_id, e_data in canonical.items()
        ],
        "ground_truth": {
            "match_percent": gt_stats.get("match_percentage", 0),
            "expected": gt_stats.get("total_gt_entities", 0),
            "detected": gt_stats.get("found_gt_entities", 0),
        },
        "files_processed": files_processed,
        "metadata": {
            "nodes": G.number_of_nodes(),
            "edges": G.number_of_edges(),
            "alerts_count": len(alerts),
        },
    }


def _build_players(canonical_entities: dict, analytics_results: dict) -> list:
    """Build player objects from PERSON entities, ranked by a blended risk score."""
    players = []
    for e_id, e_data in canonical_entities.items():
        if e_data.get("type") != "PERSON":
            continue
        m = analytics_results.get(e_id) or {}
        players.append({
            "id": e_id,
            "name": e_data["name"],
            "type": e_data["type"],
            "connections": m.get("degree", 0),
            "pagerank": round(m.get("pagerank", 0), 4),
            "betweenness": round(m.get("betweenness", 0), 4),
            "community": m.get("community", 0),
        })

    if not players:
        return players

    max_pr = max((p["pagerank"] for p in players), default=0) or 1
    max_bet = max((p["betweenness"] for p in players), default=0) or 1
    max_conn = max((p["connections"] for p in players), default=0) or 1

    for p in players:
        pr_n = p["pagerank"] / max_pr
        bet_n = p["betweenness"] / max_bet
        conn_n = p["connections"] / max_conn
        score = round(min(100.0, 100 * (0.5 * pr_n + 0.3 * bet_n + 0.2 * conn_n)), 1)
        p["risk_score"] = score
        p["threat_level"] = (
            "Critical" if score >= 80 else
            "High" if score >= 60 else
            "Medium" if score >= 40 else
            "Low"
        )

    players.sort(key=lambda p: p["risk_score"], reverse=True)
    return players
