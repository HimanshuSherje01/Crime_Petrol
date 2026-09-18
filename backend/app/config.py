import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(override=True)

# Root folder containing one sub-folder per case.
# Defaults to the synthetic dataset that ships with the repo; override with CASE_DATA_ROOT.
DEFAULT_DATA_ROOT = Path(__file__).resolve().parents[1] / ".." / "crime-petrol-synthetic-data"
DATA_ROOT = Path(os.getenv("CASE_DATA_ROOT", str(DEFAULT_DATA_ROOT))).resolve()

def list_cases():
    if not DATA_ROOT.exists():
        return []
    cases = []
    for p in sorted(DATA_ROOT.iterdir()):
        if not p.is_dir():
            continue
        if p.name == "mock_case_id":
            continue  # legacy/empty artifact, not a real case
        # Only surface cases that actually contain evidence data
        if any(f.is_file() for f in p.rglob("*")):
            cases.append(p.name)
    return cases

def case_path(case_id):
    path = DATA_ROOT / case_id
    path.mkdir(parents=True, exist_ok=True)
    return path

# Database Configurations
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "crimepatrol")

SUPABASE_URL = os.getenv("SUPABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")
