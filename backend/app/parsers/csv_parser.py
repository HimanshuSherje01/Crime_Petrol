import pandas as pd
from pathlib import Path

def parse_csv(case_path: Path):
    results = []
    
    if not case_path.exists():
        return results

    for csv_file in case_path.rglob("*.csv"):
        try:
            df = pd.read_csv(csv_file)
            text = df.to_csv(index=False)
            results.append({
                "file": csv_file.name,
                "text": text,
                "source_type": "DATASET"
            })
        except Exception as e:
            print(f"Error parsing {csv_file.name}: {e}")
            
    return results
