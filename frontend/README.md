# Crime Patrol — Investigator Frontend

An interactive, high-performance intelligence dashboard built for law enforcement analysts and criminal investigators. Developed with **React 19**, **Vite**, **Tailwind CSS**, **React-Force-Graph-3D**, and **MapLibre GL**.

---

## Key Features

- **3D Force-Directed Knowledge Graph (`react-force-graph-3d` + Three.js)**:
  - 360° rotational camera inspection of complex criminal webs.
  - Node color coding by entity type (Suspects, Phones, Vehicles, Bank Accounts, Locations).
  - Node scaling proportional to algorithmic threat level and PageRank centrality.
  - Interactive click-to-inspect drawer for detailed entity dossiers.
- **Geospatial GIS Tracking (`maplibre-gl`)**:
  - Real-time plotting of crime scenes, tower dumps, meeting locations, and getaway routes.
- **Key Players & Syndicate Hierarchy**:
  - Automated ranking of suspects by blended risk score.
  - Categorization into Kingpins, Brokers, Foot Soldiers, and Money Mules.
- **Investigative Timeline & Scrubber**:
  - Chronological event replay across FIR filings, wiretap transcripts, and CDR timestamps.
- **Heuristic Anomaly Alerts Feed**:
  - Real-time badges for circular money kickbacks, burner phone swaps, and bridge operators.
- **Ground Truth Accuracy Scorecard**:
  - Instant feedback displaying benchmark match percentage against verified case files.

---

## 🛠️ Tech Stack

- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS (v4)
- **State Management:** Zustand (`useStore.js`)
- **Graph Visualization:** `react-force-graph-3d`, `three`
- **Maps & Geospatial:** `maplibre-gl`
- **Icons:** `lucide-react`
- **HTTP Client:** `axios`
- **Database Client:** `@supabase/supabase-js`

---

## 📋 Prerequisites

- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **Package Manager:** `npm` (comes with Node), `yarn`, or `pnpm`
- **Active Backend:** FastAPI backend running at `http://localhost:8000`

---

## 🚀 Installation & Setup

### 1. Navigate to the Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables (Optional)

If your backend is running on a different port or domain, create a `.env` file in the `frontend` root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

_(Defaults to `http://localhost:8000` if omitted)._

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at:
👉 **`http://localhost:5173`**

---

## 📦 Build for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 📂 Directory Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── 3d/             # ForceGraph3D canvas and node shaders
│   │   ├── alerts/         # Anomaly alerts panel
│   │   ├── dossiers/       # Suspect inspector & profile cards
│   │   ├── map/            # MapLibre GIS tracking view
│   │   └── timeline/       # Chronological event scrubber
│   ├── store/
│   │   └── useStore.js     # Central Zustand state (filters, active case, selection)
│   ├── App.jsx             # Main layout shell
│   ├── main.jsx            # React root mount
│   └── index.css           # Tailwind CSS directives & cyber theme
├── index.html              # HTML entry point
├── package.json            # Frontend dependencies & scripts
└── vite.config.js          # Vite build configuration
```

---

## 🔧 Troubleshooting

- **WebGL Not Supported Error:**
  Ensure hardware acceleration is enabled in your browser settings (`chrome://settings/system` $\rightarrow$ _"Use hardware acceleration when available"_).
- **Network Requests Failing (CORS):**
  Ensure the FastAPI backend is running and has CORS enabled (`CORSMiddleware` in `app/main.py` allowing origin `http://localhost:5173`).
- **Map Rendering Blanks:**
  Verify that WebGL is active and that your local network allows fetching open-source vector map tiles.
