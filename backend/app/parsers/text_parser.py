import os
from pathlib import Path

def parse_text(case_path: Path):
    results = []
    
    if not case_path.exists():
        return results

    for txt_file in case_path.rglob("*.txt"):
        if txt_file.name.endswith("_transcript.txt"):
            continue
        try:
            with open(txt_file, "r", encoding="utf-8") as f:
                text = f.read().strip()
            if text:
                source_type = "SURVEILLANCE" if "surveillance" in txt_file.parent.name else "FIR"
                results.append({
                    "file": txt_file.name,
                    "text": text,
                    "source_type": source_type
                })
        except Exception as e:
            print(f"Error parsing {txt_file.name}: {e}")

    return results
