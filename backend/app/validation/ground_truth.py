import json
from pathlib import Path
from rapidfuzz import fuzz

def validate_against_ground_truth(case_path: Path, canonical_entities: dict):
    gt_file = case_path / "ground_truth.json"
    if not gt_file.exists():
        return {"match_percentage": 0, "details": "No ground truth file found."}

    try:
        with open(gt_file, "r", encoding="utf-8") as f:
            gt_data = json.load(f)
    except Exception as e:
        return {"match_percentage": 0, "details": f"Error parsing GT: {str(e)}"}

    gt_entities = gt_data.get("entities", [])
    if not gt_entities:
        return {"match_percentage": 100, "details": "No entities in ground truth to match."}

    found_count = 0
    extracted_names = [e["name"].lower() for e in canonical_entities.values()]

    matched_roles = {}
    
    for gt_ent in gt_entities:
        gt_value = gt_ent.get("value", "").lower()
        role = gt_ent.get("role", "unknown")
        
        # Check if any extracted entity matches
        matched = False
        for ext_name in extracted_names:
            if fuzz.ratio(gt_value, ext_name) > 85:
                matched = True
                break
                
        if matched:
            found_count += 1
            matched_roles[role] = matched_roles.get(role, 0) + 1

    match_percentage = (found_count / len(gt_entities)) * 100 if gt_entities else 0
    
    return {
        "match_percentage": round(match_percentage, 2),
        "total_gt_entities": len(gt_entities),
        "found_gt_entities": found_count,
        "matched_roles": matched_roles
    }
