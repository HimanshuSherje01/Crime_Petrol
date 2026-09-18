# Synthetic Dataset — Organized Robbery / Dacoity Gang Network

Three synthetic cases built for the "AI-Powered Criminal Network Analysis
System" prototype (Crime Petrol). All names, phone numbers, addresses,
account numbers and events are entirely fictional — any resemblance to real
people or cases is coincidental. This exists purely to have realistic,
multi-modal input to demo and stress-test the ingestion → NER → RAG → graph
pipeline against, and to have a ground-truth answer key for evaluating link
prediction.

## Why these three cases

- **Case A (flagship)** is the one to actually demo. It's dense, multi-modal,
  and deliberately built with a **hidden-coordinator pattern**: the gang
  leader never appears alongside his operatives in any single document — he
  only surfaces by chaining the CDR pattern with the financial-laundering
  trail. This is the exact "AI discovers hidden relationships" capability
  the problem statement asks for, and it's what your GNN link-predictor (or,
  short of that, a manual multi-hop graph query) should be able to recover.
- **Case B and C** are lighter (FIR + CDR only, no financial/audio/image
  data) so your dashboard's case list doesn't look like a single-case demo,
  and so you have a "thin data, early-stage investigation" example alongside
  the rich one — useful for showing the system handles varying data density.

## Folder structure

```
case_A_flagship_jewelry_heist_gang/
├── fir_reports/                  3 FIR text files (unstructured — for NER/RAG)
├── surveillance_reports/         2 field-surveillance text reports
├── cdr_logs/cdr_log_case_A.csv   call detail records (structured — for graph)
├── financial_transactions/
│   └── financial_transactions_case_A.csv   the fencing/laundering chain
├── cctv_stills/                  4 generated PNG "camera" images with
│                                  embedded, OCR-readable plate/location text
├── intercepted_calls/
│   ├── intercepted_call_001_transcript.txt   authoritative transcript
│   └── intercepted_call_001_narration.wav    synthesized audio (see note below)
└── ground_truth.json             full entity list + explicit AND hidden edges

case_B_wadi_bike_snatching_ring/
├── fir_reports/                  2 FIR text files
├── cdr_logs/cdr_log_case_B.csv
└── ground_truth.json

case_C_dharampeth_burglary_series/
├── fir_reports/                  2 FIR text files
└── ground_truth.json             thin/early-stage — only 1 entity, 1 edge
```

## A note on the audio file

`intercepted_call_001_narration.wav` is synthesized with the open-source
`espeak-ng` engine reading an **English investigator's summary** of the call
(not a Hindi voice reading the original dialogue — a reliable free offline
Hindi TTS voice wasn't available in this environment). The
`intercepted_call_001_transcript.txt` file is the authoritative version of
what was actually said and is what your NER pipeline should be tested
against; the `.wav` file exists so your Whisper transcription step has a
real audio file to run on for the ingestion demo. If you want a more
realistic Hindi-language audio clip later, re-record the transcript with any
Hindi TTS voice you have access to, or record it yourself.

## How to use this with the Crime Petrol app

1. Register a user, create three cases in the dashboard named to match the
   three folders here (or your own titles).
2. Upload every file inside `case_A_flagship_jewelry_heist_gang/` (FIRs,
   surveillance reports, CDR csv, financial csv, CCTV pngs, transcript, wav)
   into that case via the upload panel. Repeat for cases B and C with their
   (smaller) file sets.
3. Open the case's Relationship Graph tab — entities extracted from the FIRs
   and surveillance reports should populate as nodes.
4. Ask the RAG chat things like *"Who was seen near the Wardha Road
   workshop?"* or *"What vehicle was used in the Sitabuldi robbery?"* — it
   should answer from the FIR/surveillance text with citations.
5. Compare what the app's graph surfaces against `ground_truth.json`'s
   `edges_explicit` list — a correctly working ingestion+NER+graph pipeline
   should recover most of those from co-occurrence alone.
6. The `edges_hidden` list in Case A's ground truth is what your **trained
   GNN link-predictor** should eventually be evaluated against — the
   `evaluation_note` field in that file explains exactly how to run that
   test (hide those edges from the training graph, see if the model's
   top-k predictions recover them).

## Entity type legend (for consistency with the app's NER schema)

| Type | Examples in this dataset |
|---|---|
| PERSON | Sanjay Deshmukh, Iqbal Sheikh, Ravi Tandel, Mahesh Oswal... |
| ORG | Mahesh Jewelers, Shree Ganesh Scrap Traders |
| VEHICLE | MH31 AB 1234, MH31 CD 5678 |
| LOCATION | Sitabuldi Market, Kamptee Road warehouse, Wardha Road workshop |
| PHONE | 9822011234, 9822045678, ... |

## Regenerating or extending this dataset

`generate.py` (included alongside this README at the package root) is the
script that produced everything here. It's plain Python + PIL + a call out
to the `espeak-ng` CLI — re-run it after editing the entity/case definitions
near the top of the file to produce variations, additional cases, or a
larger flagship network. Random seed is fixed (`42`) so re-runs are
reproducible unless you change the content.
