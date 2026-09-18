import os
from pathlib import Path

def parse_text(case_path: Path):
    results = []
    
    # Process FIR Reports
    fir_dir = case_path / "fir_reports"
    if fir_dir.exists():
        for txt_file in fir_dir.glob("*.txt"):
            try:
                with open(txt_file, "r", encoding="utf-8") as f:
                    text = f.read().strip()
                if text:
                    results.append({
                        "file": txt_file.name,
                        "text": text,
                        "source_type": "FIR"
                    })
            except Exception as e:
                print(f"Error parsing {txt_file.name}: {e}")

    # Process Surveillance Reports
    surv_dir = case_path / "surveillance_reports"
    if surv_dir.exists():
        for txt_file in surv_dir.glob("*.txt"):
            try:
                with open(txt_file, "r", encoding="utf-8") as f:
                    text = f.read().strip()
                if text:
                    results.append({
                        "file": txt_file.name,
                        "text": text,
                        "source_type": "SURVEILLANCE"
                    })
            except Exception as e:
                print(f"Error parsing {txt_file.name}: {e}")
                
    return results
