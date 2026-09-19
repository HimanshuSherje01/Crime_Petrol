# 🔍 CRIME PATROL — AI-Powered Criminal Network Analysis & Intelligence Discovery System

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Groq LLaMA-70B](https://img.shields.io/badge/Groq-LLaMA--3.3--70B-f55036?style=for-the-badge)](https://groq.com/)
[![Whisper](https://img.shields.io/badge/Faster--Whisper-Speech_To_Text-blue?style=for-the-badge)](https://github.com/SYSTRAN/faster-whisper)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Graph-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

> **An enterprise-grade multimodal intelligence platform that transforms fragmented, unstructured crime data—scanned paper FIRs, wiretap call recordings, CDRs, and bank transactions—into an interactive, 3D Knowledge Graph with automated mastermind discovery, broker isolation, and suspicious pattern alerts.**

---

## 📌 Problem Statement & Background

### The Real-World Challenge

Modern criminal activities are increasingly organized, decentralized, and obfuscated. Syndicates operate through layers of intermediaries, burner phones, hawala channels, and shell entities. Law enforcement agencies collect massive volumes of data:

- **Unstructured Narratives:** Scanned First Information Reports (FIRs), witness testimonies, and interrogation transcripts.
- **Audio Interceptions:** Wiretaps and recorded suspect calls.
- **Structured Records:** Call Detail Records (CDRs), tower dumps, bank/UPI statements, and vehicle RTO registrations.

**The Bottleneck:** Investigators face severe data fragmentation. Critical connections remain buried in paper files or siloed spreadsheets. Manual analysis is labor-intensive, error-prone, and takes weeks—allowing suspects to flee or destroy evidence.

### The Solution: CRIME PATROL

An end-to-end AI platform that automatically:

1. **Ingests Multimodal Intelligence:** Extracts text from scans (OCR), audio (Whisper STT), and logs (Pandas).
2. **Extracts Entities & Merges Aliases:** Employs a **Hybrid Neuro-Symbolic NLP** architecture (spaCy + Groq LLaMA-3.3-70B + RapidFuzz) to identify suspects, vehicles, accounts, and nicknames.
3. **Builds a 3D Knowledge Graph:** Visualizes cross-entity relationships in an interactive 360° rotational force-directed environment.
4. **Uncovers Hidden Influencers:** Uses mathematical graph theory (PageRank, Betweenness Centrality) to isolate shadow masterminds and financial brokers.
5. **Flags Suspicious Patterns:** Automatically detects conspiratorial cycles, call bursts, and burner phone switches.
6. **Validates Against Ground Truth:** Measures extraction precision and recall against verified crime benchmarks.

---

## 🏛️ System Architecture

```
                       [ MULTIMODAL INGESTION LAYER ]
  ┌───────────────────┬───────────────────┬───────────────────┬───────────────────┐
  │   Scanned FIRs    │  Audio Wiretaps   │ CDRs / Tower Dumps│  Bank Statements  │
  │ (RapidOCR + PDF)  │ (Faster-Whisper)  │     (Pandas)      │     (Pandas)      │
  └─────────┬─────────┴─────────┬─────────┴─────────┬─────────┴─────────┬─────────┘
            └───────────────────┼───────────────────┘                   │
                                ▼                                       ▼
                    [ DOCUMENT INGESTION LAKE ]
                    MongoDB Atlas (Unstructured Store)
                                │
                                ▼
             [ HYBRID NEURO-SYMBOLIC EXTRACTION & RESOLUTION ]
  ┌─────────────────────────────────────────┬─────────────────────────────────────┐
  │  Deterministic Pattern Engine           │  Deep Contextual LLM Engine         │
  │  (spaCy + Regex: Phones, Plates, INR)   │  (Groq LLaMA-3.3-70B-Versatile)     │
  └────────────────────┬────────────────────┴──────────────────┬──────────────────┘
                       └──────────────────┬────────────────────┘
                                          ▼
                       [ ENTITY RESOLUTION & DEDUPLICATION ]
                       RapidFuzz (Fuzzy String & Alias Merging)
                                          │
                                          ▼
                         [ GRAPH ANALYTICS ENGINE (NetworkX) ]
  ┌────────────────────────┬────────────────────────┬─────────────────────────────┐
  │  PageRank Centrality   │ Betweenness Centrality │  Louvain Community Grouping │
  │  (Shadow Kingpins)     │ (Hawala / Brokers)     │  (Operational Sub-Cells)    │
  └────────────────────────┴────────────────────────┴─────────────────────────────┘
                                          │
                                          ▼
                        [ HEURISTIC ANOMALY DETECTOR ]
             Circular Kickbacks • Burner Phone Lifespans • Dense Bursts
                                          │
                                          ▼
                         [ RELATIONAL & AUDIT LAYER ]
                    PostgreSQL / Supabase (Entities, Edges, Runs)
                                          │
                                          ▼
                        [ INVESTIGATOR FRONTEND WORKSPACE ]
  ┌────────────────────────┬────────────────────────┬─────────────────────────────┐
  │  3D Force Graph (WebGL)│ Geospatial GIS Map     │ Suspect Threat Dossiers     │
  │  (React-Force-Graph-3D)│ (MapLibre GL)          │ (Central Zustand State)     │
  └────────────────────────┴────────────────────────┴─────────────────────────────┘
```

---

## ✨ Core Innovations & Key Modules

### 1. Multimodal Parsing Engine

- **OCR Module (`RapidOCR` + `pdfplumber`):** Parses scanned police records, handwritten charge sheets, and receipts directly without third-party cloud OCR fees.
- **Audio Wiretap Transcription (`faster-whisper`):** Transcribes Hindi/English phone conversations and suspect interrogations locally with GPU/CPU acceleration.
- **Tabular Log Processor (`pandas`):** Normalizes CDR call logs (caller, receiver, duration, tower ID) and banking transaction spreadsheets.

### 2. Hybrid Neuro-Symbolic NLP & Entity Resolution

- **Fast Deterministic Engine:** Regex and spaCy instantly capture structured formats (Indian phone numbers, license plates like `DL-04-XX`, and INR currency).
- **Deep Contextual LLM (Groq LLaMA-3.3-70B):** Discovers nuanced Indian crime aliases (_"Bhai"_, _"s/o Ramesh"_), weapons, and extortion demands that rule engines miss.
- **Entity Deduplication (`RapidFuzz`):** Merges fragmented references (_"Vicky"_, _"Vikram Malhotra"_, and phone `+91-98765-XXXXX`) into a single canonical identity.

### 3. Graph Theory & Role Classification

Instead of naively declaring whoever has the most calls as the "Leader", Crime Patrol evaluates mathematical graph properties:

- **The Mastermind (High PageRank + Low Out-Degree):** Shadow leaders who keep a low profile but communicate strictly with high-influence lieutenants.
- **The Broker / Hawala Operator (High Betweenness Centrality):** The vital bridge whose removal completely fractures the criminal network.
- **The Foot Soldiers (High Degree Centrality):** Operational runners who handle logistics and frequent ground communication.
- **Sub-Gang Communities (`python-louvain`):** Unsupervised partition of the network into distinct functional modules (Heist Crew vs. Getaway Team vs. Money Laundering Arm).

### 4. Interactive 3D & GIS Intelligence Dashboard

- **3D Force-Directed Graph:** Built with WebGL, Three.js, and React-Force-Graph-3D. Allows 360-degree rotation, zoom, physics stabilization, and real-time node scaling by calculated risk score.
- **Geospatial GIS Map (`maplibre-gl`):** Overlays call tower pings and incident locations on interactive digital maps to trace suspect escape paths.
- **Inspector Dossier Drawer:** Click any node to reveal aliases, phone numbers, threat score breakdown, and direct evidence provenance links.

---

## 🗂️ Project Repository Layout

```
Crime_Petrol/
├── backend/                        # FastAPI REST API & Machine Learning Engine
│   ├── app/
│   │   ├── alerts/rules.py         # Heuristic cycle & bridge anomaly detector
│   │   ├── database/               # Dual MongoDB + PostgreSQL (Supabase) layer
│   │   ├── graph/                  # NetworkX builder & PageRank/Louvain analytics
│   │   ├── nlp/                    # spaCy + Groq LLaMA-70B + RapidFuzz deduplicator
│   │   ├── parsers/                # OCR, Faster-Whisper, CSV, and Text parsers
│   │   ├── validation/             # Ground truth accuracy validation benchmark
│   │   ├── main.py                 # FastAPI application & API routers
│   │   └── pipeline.py             # 8-stage orchestrated intelligence pipeline
│   ├── requirements.txt            # Python dependencies
│   └── README.md                   # Backend installation guide
│
├── frontend/                       # Modern React 19 Cyber-Intelligence Dashboard
│   ├── src/
│   │   ├── components/             # 3D Graph, Geospatial Map, Timeline, Dossiers
│   │   ├── store/useStore.js       # Global state (Zustand)
│   │   └── App.jsx                 # Dashboard interface shell
│   ├── package.json                # Node dependencies
│   └── README.md                   # Frontend installation guide
│
├── crime-petrol-synthetic-data/    # Realistic multi-source synthetic cases
│   └── case_A_flagship_jewelry_heist_gang/
│       ├── audio_interceptions/    # Wiretap audio files
│       ├── bank_records/           # Transaction CSVs (Mule accounts)
│       ├── cdr_logs/               # Call Detail Records (Tower pings)
│       ├── fir_reports/            # Unstructured police FIRs
│       ├── ground_truth.json       # Benchmark labels for accuracy verification
│       └── surveillance_notes/     # Undercover observation logs
│
└── README.md                       # Master project documentation
```

---

## ⚡ Quick Start & Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/HimanshuSherje01/Crime_Petrol.git
cd Crime_Petrol
```

### Step 2: Set Up Backend

```bash
cd backend
python -m venv venv

# Windows PowerShell
venv\Scripts\Activate.ps1
# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Configure your `backend/.env`:

```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net"
MONGODB_DB_NAME="crimepatrol"
SUPABASE_URL="postgresql://postgres:<password>@<host>:5432/postgres"
GROQ_API_KEY="gsk_your_groq_key_here"
GROQ_MODEL="llama-3.3-70b-versatile"
```

Start the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

_(Backend documentation live at: `http://localhost:8000/docs`)_

### Step 3: Set Up Frontend

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 🧪 Validating with Ground Truth Benchmark

To prove measurable accuracy, Crime Patrol includes pre-labeled synthetic benchmark cases (e.g., `case_A_flagship_jewelry_heist_gang`).

When you trigger analysis:

1. The backend parses all multimodal files and builds the canonical graph.
2. The `validation/ground_truth.py` engine matches extracted entities against `ground_truth.json`.
3. The dashboard displays the **Match Percentage (Precision/Recall)**:

$$\text{Match Percentage} = \left( \frac{\text{Found Ground Truth Entities}}{\text{Total Ground Truth Entities}} \right) \times 100$$

This enables law enforcement agencies to objectively audit system precision before deploying to active field investigations.

---

## 🛡️ License & Acknowledgments

- **License:** MIT License
- **Hackathon:** Built for advanced AI criminal network analysis challenges.
- **Powered by:** Open-source AI libraries (NetworkX, PyMongo, SQLAlchemy, React, Three.js, Groq Cloud, and Faster-Whisper).
