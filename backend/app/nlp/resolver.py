from rapidfuzz import fuzz
from typing import List, Dict
import uuid

def resolve_entities(raw_entities: List[Dict]) -> Dict:
    """
    Takes a list of raw entity dictionaries: {"text": "...", "type": "...", "source": "...", "file": "..."}
    Returns canonical entities and a mapping from raw text to canonical ID.
    Also flags potential merges (70-90 similarity).
    """
    canonical_entities = {} # id -> {id, name, type, sources}
    text_to_id = {} # lowercase text -> id
    flags = []

    # Group by type to avoid comparing PERSON with LOCATION
    by_type = {}
    for ent in raw_entities:
        t = ent["type"]
        if t not in by_type:
            by_type[t] = []
        by_type[t].append(ent)

    for ent_type, ents in by_type.items():
        canonical_for_type = [] # list of canonical entities for this type

        for ent in ents:
            text = ent["text"]
            text_lower = text.lower()
            source = ent["source"]
            file_name = ent.get("file", "")

            # If already resolved exactly
            if text_lower in text_to_id:
                c_id = text_to_id[text_lower]
                canonical_entities[c_id]["sources"].add(source)
                canonical_entities[c_id]["files"].add(file_name)
                continue

            matched = False
            # Compare with existing canonical entities of the same type
            for c_ent in canonical_for_type:
                score = fuzz.ratio(text_lower, c_ent["name"].lower())
                
                if score > 90:
                    # Merge
                    c_id = c_ent["id"]
                    text_to_id[text_lower] = c_id
                    canonical_entities[c_id]["sources"].add(source)
                    canonical_entities[c_id]["files"].add(file_name)
                    matched = True
                    break
                elif score > 70:
                    # Flag for review, but create new entity for now
                    flags.append({
                        "entity1": text,
                        "entity2": c_ent["name"],
                        "score": score,
                        "type": ent_type
                    })

            if not matched:
                # Create new canonical entity
                new_id = f"{ent_type}_{uuid.uuid4().hex[:8]}"
                new_canonical = {
                    "id": new_id,
                    "name": text,
                    "type": ent_type,
                    "sources": {source},
                    "files": {file_name}
                }
                canonical_entities[new_id] = new_canonical
                canonical_for_type.append(new_canonical)
                text_to_id[text_lower] = new_id

    # Convert sets to lists for JSON serialization later
    for c_id, c_data in canonical_entities.items():
        c_data["sources"] = list(c_data["sources"])
        c_data["files"] = list(c_data["files"])

    return {
        "canonical_entities": canonical_entities,
        "text_to_id": text_to_id,
        "flags": flags
    }
