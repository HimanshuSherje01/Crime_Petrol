import os
import pandas as pd
from pathlib import Path

def parse_csv(case_path: Path):
    results = []
    
    # Process CDR Logs
    cdr_dir = case_path / "cdr_logs"
    if cdr_dir.exists():
        for csv_file in cdr_dir.glob("*.csv"):
            try:
                df = pd.read_csv(csv_file)
                # Convert DataFrame to a string representation for NLP
                text = df.to_csv(index=False)
                results.append({
                    "file": csv_file.name,
                    "text": text,
                    "source_type": "CDR"
                })
            except Exception as e:
                print(f"Error parsing {csv_file.name}: {e}")

    # Process Financial Transactions
    fin_dir = case_path / "financial_transactions"
    if fin_dir.exists():
        for csv_file in fin_dir.glob("*.csv"):
            try:
                df = pd.read_csv(csv_file)
                text = df.to_csv(index=False)
                results.append({
                    "file": csv_file.name,
                    "text": text,
                    "source_type": "FINANCIAL"
                })
            except Exception as e:
                print(f"Error parsing {csv_file.name}: {e}")
                
    return results
