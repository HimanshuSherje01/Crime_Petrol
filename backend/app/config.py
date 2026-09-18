import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(override=True)

DATA_ROOT = Path(__file__).resolve().parents[3] / "crime-petrol-synthetic-data"

def list_cases():
    if not DATA_ROOT.exists():
        return []
    return sorted([p.name for p in DATA_ROOT.iterdir() if p.is_dir()])

def case_path(case_id):
    return DATA_ROOT / case_id

# Database Configurations
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "crimepatrol")

SUPABASE_URL = os.getenv("SUPABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")
