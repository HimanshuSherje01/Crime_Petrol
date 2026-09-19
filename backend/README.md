# Crime Patrol — Intelligence Processing Backend

The core AI engine powering the **Crime Patrol** intelligence platform. Built with **FastAPI**, **NetworkX**, **Groq LLaMA-3.3-70B**, **Faster-Whisper**, **RapidOCR**, **MongoDB**, and **Supabase (PostgreSQL)**.

---

## ⚡ Architecture Highlights

- **Multimodal Evidence Ingestion:**
  - Scanned & Handwritten Documents: `rapidocr-onnxruntime` + `pdfplumber`
  - Interrogations & Wiretaps: `faster-whisper` (Local speech-to-text)
  - Call Logs (CDRs) & Banking: `pandas`
  - Textual FIRs & Intelligence Notes: Native Regex + Text Extractors
- **Hybrid Neuro-Symbolic NLP:**
  - High-precision deterministic regex & spaCy for phones, vehicle plates, and currency amounts.
  - Groq Cloud **LLaMA-3.3-70B-Versatile** for deep semantic understanding of Indian crime contexts, aliases, and syndicate hierarchies.
- **Entity Resolution & Alias Merging:**
  - `rapidfuzz` string similarity & phonetic matching to merge nicknames (_"Vicky"_ $\rightarrow$ _"Vikram Malhotra"_).
- **Graph Intelligence Engine:**
  - `networkx` for directed weighted multigraph construction.
  - **PageRank:** Detects high-influence, low-call-volume Masterminds.
  - **Betweenness Centrality:** Detects Hawala couriers and brokers bridging disconnected cells.
  - **Louvain Algorithm (`python-louvain`):** Unsupervised clustering of sub-gangs.
- **Dual Database Persistence:**
  - **MongoDB:** Ingestion lake for raw evidence text, audio transcripts, and OCR dumps.
  - **Supabase / PostgreSQL:** Relational audit storage for canonical entities, edges, alerts, and cases.

---

## 🛠️ Prerequisites

- **Python:** Version `3.10`, `3.11`, or `3.12`
- **MongoDB:** Local instance or MongoDB Atlas connection string
- **PostgreSQL / Supabase:** PostgreSQL connection string
- **Groq API Key:** Free tier key from [Groq Console](https://console.groq.com)

---

## 🚀 Installation & Setup

### 1. Navigate to the Backend Directory

```bash
cd backend
```

### 2. Create & Activate a Python Virtual Environment

- **Windows (PowerShell):**
  ```powershell
  python -m venv venv
  venv\Scripts\Activate.ps1
  ```
- **macOS / Linux:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

### 3. Install Required Packages

```bash
pip install -r requirements.txt
```

### 4. Install spaCy Language Model

```bash
python -m spacy download en_core_web_sm
```

### 5. Configure Environment Variables

Create a `.env` file in `backend/.env` with your credentials:

```env
# MongoDB Configuration (Atlas or Local)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net"
MONGODB_DB_NAME="crimepatrol"

# Supabase / PostgreSQL Database URL
SUPABASE_URL="postgresql://postgres:<password>@<host>:5432/postgres"

# Groq Cloud LLM API (Free tier for LLaMA 3.3 70B)
GROQ_API_KEY="gsk_your_groq_api_key_here"
GROQ_MODEL="llama-3.3-70b-versatile"

# Dataset Root (Defaults to ../crime-petrol-synthetic-data if not set)
CASE_DATA_ROOT="../crime-petrol-synthetic-data"
```

---

## 🏃 Running the Server

Start the FastAPI application with Uvicorn:

```bash
uvicorn app.main:app --reload --port 8000
```

- **API Documentation (Swagger UI):** `http://localhost:8000/docs`
- **Alternative Documentation (ReDoc):** `http://localhost:8000/redoc`

---

## 📡 Key API Endpoints

| Method | Endpoint                    | Description                                                                    |
| :----- | :-------------------------- | :----------------------------------------------------------------------------- |
| `GET`  | `/api/cases`                | Lists all available case datasets in storage                                   |
| `POST` | `/api/analyze/{case_id}`    | Triggers the complete end-to-end multimodal AI pipeline for a case             |
| `GET`  | `/api/graph?case_id={id}`   | Returns graph nodes, directed edges, weights, and entity types                 |
| `GET`  | `/api/players?case_id={id}` | Returns ranked suspects with calculated Risk Scores, PageRank, and Betweenness |
| `GET`  | `/api/alerts?case_id={id}`  | Fetches algorithmic anomaly alerts (cycles, bridges, burner swaps)             |
| `GET`  | `/api/timeline/{case_id}`   | Returns parsed chronological evidence documents and event timelines            |
| `POST` | `/api/clear/{case_id}`      | Flushes processed case data from MongoDB and PostgreSQL                        |

---

## 📂 Backend Architecture

```
backend/
├── app/
│   ├── alerts/             # Rule-based graph anomaly & loop detectors
│   │   └── rules.py
│   ├── database/           # Dual-storage ORM & connection drivers
│   │   ├── models.py       # SQLAlchemy Postgres tables
│   │   ├── mongodb.py      # Motor AsyncIOMotorClient wrapper
│   │   └── supabase.py     # Postgres engine & session factory
│   ├── graph/              # NetworkX modeling & graph theory
│   │   ├── analytics.py    # PageRank, Betweenness, Degree & Louvain
│   │   └── builder.py      # Node/Edge multigraph builder
│   ├── nlp/                # Information extraction & entity resolution
│   │   ├── entity_extractor.py # Regex + spaCy pattern extractor
│   │   ├── llm_extractor.py    # Groq LLaMA-70B contextual extractor
│   │   └── resolver.py         # RapidFuzz entity deduplication
│   ├── parsers/            # Multimodal raw data extractors
│   │   ├── audio_parser.py # Faster-Whisper audio transcription
│   │   ├── csv_parser.py   # Pandas CDR/Banking parser
│   │   ├── ocr_parser.py   # RapidOCR image/PDF extractor
│   │   └── text_parser.py  # Plaintext case notes parser
│   ├── validation/         # Ground truth benchmark evaluator
│   │   └── ground_truth.py
│   ├── config.py           # Environment and path configurations
│   ├── main.py             # FastAPI entry point & API route handlers
│   ├── pipeline.py         # 8-step orchestrated intelligence workflow
│   └── schemas.py          # Pydantic request/response schemas
├── requirements.txt        # Python dependency manifest
└── .env                    # Secret environment credentials
```
