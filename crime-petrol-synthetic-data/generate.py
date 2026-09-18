"""
Synthetic dataset generator — Organized Robbery / Dacoity Gang Network.

Produces three cases of increasing simplicity:
  Case A (flagship): a dense, multi-modal dataset built around one gang —
    FIR text, CDR logs, financial/fencing transactions, surveillance reports,
    CCTV still images (with embedded, OCR-readable plate/text), an
    intercepted-call transcript + synthesized audio, and a ground-truth
    entity/edge file for evaluating link prediction.
  Case B & C: lighter cases (FIR + CDR only) just to populate the case list
    in the dashboard realistically.

Run: python3 generate.py
Output: ./output/
"""
import csv
import json
import os
import random
import subprocess

random.seed(42)

ROOT = os.path.join(os.path.dirname(__file__), "output")


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)
    return path


def write_text(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")


# ======================================================================
# CASE A — FLAGSHIP: "Sitabuldi Jewelry Heist Gang"
# ======================================================================
CASE_A_DIR = ensure_dir(os.path.join(ROOT, "case_A_flagship_jewelry_heist_gang"))

# ---- Ground truth entities & network (the "answer key") ----
ground_truth_A = {
    "case_name": "Sitabuldi Jewelry Heist Gang",
    "narrative_summary": (
        "A gang running three linked robberies (a jewelry showroom heist, an ATM "
        "cash-van robbery, and a residential burglary) across Nagpur. Field "
        "operatives report only to a lieutenant; the gang leader never appears "
        "by name in any FIR or call log — he only surfaces through the financial "
        "layering trail via a front business. This hidden link is the target for "
        "link-prediction: no single document names both the leader and the "
        "operatives together."
    ),
    "entities": [
        {"id": "sanjay_deshmukh", "type": "PERSON", "value": "Sanjay Deshmukh", "aliases": ["Bhai", "SD"], "role": "gang_leader"},
        {"id": "iqbal_sheikh", "type": "PERSON", "value": "Iqbal Sheikh", "aliases": ["Iqbal"], "role": "lieutenant_coordinator"},
        {"id": "ravi_tandel", "type": "PERSON", "value": "Ravi Tandel", "aliases": ["Ravi"], "role": "operative"},
        {"id": "suresh_pawar", "type": "PERSON", "value": "Suresh Pawar", "aliases": ["Suresh"], "role": "operative"},
        {"id": "vikram_chauhan", "type": "PERSON", "value": "Vikram Chauhan", "aliases": ["Vikram", "Chauhan"], "role": "operative"},
        {"id": "ajay_more", "type": "PERSON", "value": "Ajay More", "aliases": ["Ajay"], "role": "getaway_driver"},
        {"id": "pooja_rane", "type": "PERSON", "value": "Pooja Rane", "aliases": ["Pooja"], "role": "lookout_informant"},
        {"id": "mahesh_oswal", "type": "PERSON", "value": "Mahesh Oswal", "aliases": ["Mahesh Seth"], "role": "fence"},
        {"id": "mahesh_jewelers", "type": "ORG", "value": "Mahesh Jewelers", "aliases": [], "role": "fencing_front"},
        {"id": "shree_ganesh_scrap", "type": "ORG", "value": "Shree Ganesh Scrap Traders", "aliases": [], "role": "money_laundering_front"},
        {"id": "vehicle_getaway", "type": "VEHICLE", "value": "MH31 AB 1234", "aliases": [], "role": "getaway_car"},
        {"id": "vehicle_recon", "type": "VEHICLE", "value": "MH31 CD 5678", "aliases": [], "role": "recon_bike"},
        {"id": "loc_sitabuldi", "type": "LOCATION", "value": "Sitabuldi Market", "aliases": [], "role": "robbery_site_1"},
        {"id": "loc_kamptee_warehouse", "type": "LOCATION", "value": "Kamptee Road warehouse", "aliases": [], "role": "hideout"},
        {"id": "loc_wardha_workshop", "type": "LOCATION", "value": "Wardha Road workshop", "aliases": [], "role": "vehicle_repaint_spot"},
        {"id": "loc_civil_lines_atm", "type": "LOCATION", "value": "Civil Lines ATM", "aliases": [], "role": "robbery_site_2"},
        {"id": "loc_manish_nagar", "type": "LOCATION", "value": "Manish Nagar residential colony", "aliases": [], "role": "robbery_site_3"},
        {"id": "phone_sanjay", "type": "PHONE", "value": "9822011234", "aliases": [], "role": "leader_burner"},
        {"id": "phone_iqbal", "type": "PHONE", "value": "9822045678", "aliases": [], "role": "lieutenant_phone"},
        {"id": "phone_ravi", "type": "PHONE", "value": "9822078901", "aliases": [], "role": "operative_phone"},
        {"id": "phone_suresh", "type": "PHONE", "value": "9822012345", "aliases": [], "role": "operative_phone"},
        {"id": "phone_vikram", "type": "PHONE", "value": "9822067890", "aliases": [], "role": "operative_phone"},
        {"id": "phone_ajay", "type": "PHONE", "value": "9822098765", "aliases": [], "role": "driver_phone"},
        {"id": "phone_pooja", "type": "PHONE", "value": "9822054321", "aliases": [], "role": "lookout_phone"}
    ],
    "edges_explicit": [
        {"source": "sanjay_deshmukh", "target": "iqbal_sheikh", "relation": "gives_orders_to", "evidence": "CDR call pattern only — never named together in any FIR"},
        {"source": "iqbal_sheikh", "target": "ravi_tandel", "relation": "coordinates_with", "evidence": "CDR + surveillance_002.txt"},
        {"source": "iqbal_sheikh", "target": "suresh_pawar", "relation": "coordinates_with", "evidence": "CDR"},
        {"source": "iqbal_sheikh", "target": "vikram_chauhan", "relation": "coordinates_with", "evidence": "CDR"},
        {"source": "iqbal_sheikh", "target": "ajay_more", "relation": "coordinates_with", "evidence": "CDR"},
        {"source": "iqbal_sheikh", "target": "pooja_rane", "relation": "coordinates_with", "evidence": "intercepted_call_001_transcript.txt"},
        {"source": "ravi_tandel", "target": "vehicle_getaway", "relation": "used_vehicle", "evidence": "FIR_2024_0142.txt, cctv_sitabuldi_cam3.png"},
        {"source": "ajay_more", "target": "vehicle_getaway", "relation": "drove", "evidence": "FIR_2024_0142.txt"},
        {"source": "pooja_rane", "target": "vehicle_recon", "relation": "used_vehicle", "evidence": "surveillance_001.txt"},
        {"source": "vehicle_getaway", "target": "loc_wardha_workshop", "relation": "repainted_at", "evidence": "surveillance_001.txt, cctv_wardha_workshop.png"},
        {"source": "ravi_tandel", "target": "loc_sitabuldi", "relation": "present_at", "evidence": "FIR_2024_0142.txt"},
        {"source": "suresh_pawar", "target": "loc_civil_lines_atm", "relation": "present_at", "evidence": "FIR_2024_0198.txt"},
        {"source": "vikram_chauhan", "target": "loc_manish_nagar", "relation": "present_at", "evidence": "FIR_2024_0233.txt"},
        {"source": "iqbal_sheikh", "target": "loc_kamptee_warehouse", "relation": "frequents", "evidence": "surveillance_002.txt"},
        {"source": "mahesh_oswal", "target": "mahesh_jewelers", "relation": "owns", "evidence": "financial_transactions_case_A.csv"},
        {"source": "ravi_tandel", "target": "mahesh_jewelers", "relation": "sold_stolen_goods_to", "evidence": "financial_transactions_case_A.csv"}
    ],
    "edges_hidden": [
        {
            "source": "sanjay_deshmukh",
            "target": "mahesh_jewelers",
            "relation": "receives_laundered_funds_from",
            "why_hidden": "Not stated in any single document. Must be inferred by chaining: Mahesh Jewelers pays Shree Ganesh Scrap Traders (financial CSV) -> Shree Ganesh Scrap Traders' registered account holder links back to Sanjay Deshmukh via a shared address only visible if the financial CSV's account-holder field is cross-referenced. This is the target edge for your GNN link predictor / manual investigator insight — a system that only reads FIRs will never surface it."
        },
        {
            "source": "sanjay_deshmukh",
            "target": "ravi_tandel",
            "relation": "commands_indirectly",
            "why_hidden": "No document states this directly. Inferable only from: (a) Sanjay->Iqbal CDR calls always precede Iqbal->Ravi calls by 10-30 minutes across all three incidents, and (b) the financial chain above. This is the 'hidden coordinator' pattern the whole flagship case is built to demonstrate."
        }
    ],
    "evaluation_note": (
        "To test a link-prediction model: remove the 'edges_hidden' list from the "
        "training graph entirely, train/run your model on the observed graph built "
        "from 'edges_explicit' only, then check whether the model's top-k predicted "
        "missing edges recover the two hidden edges above. That is the actual "
        "'AI discovers hidden relationships' capability the PS is asking for."
    )
}
write_text(os.path.join(CASE_A_DIR, "ground_truth.json"), json.dumps(ground_truth_A, indent=2))

# ---- FIR reports (unstructured text — for NER + RAG) ----
fir_dir = ensure_dir(os.path.join(CASE_A_DIR, "fir_reports"))

write_text(os.path.join(fir_dir, "FIR_2024_0142.txt"), """
FIRST INFORMATION REPORT
FIR No: 2024/0142                          Police Station: Sitabuldi
Date of Offence: 14-Feb-2024                Time: 14:20 hrs
Sections: IPC 392 (Robbery), 397 (Robbery with deadly weapon)

Complainant: Mr. Deepak Malhotra, Owner, Royal Jewelers, Sitabuldi Market, Nagpur.

Brief Facts:
On 14-Feb-2024 at approximately 14:20 hrs, two unidentified men entered Royal
Jewelers showroom at Sitabuldi Market armed with a knife and threatened staff.
CCTV footage (Camera 3, timestamp 14:22 hrs) shows a white Maruti Swift bearing
registration MH31 AB 1234 parked outside the showroom during the incident,
engine running. One suspect, later identified through witness testimony as
Ravi Tandel (resident of Mahal area), was seen entering the showroom while a
second man remained near the vehicle. Gold ornaments and cash amounting to
approximately Rs. 18,50,000 were taken. The vehicle was driven away by a third
person, believed to be the getaway driver, immediately after the incident.

A witness (shop assistant, name withheld) stated that a woman had visited the
shop twice earlier that week asking about opening/closing times and CCTV
camera positions, but did not report any suspicious activity at the time.

Investigation is underway to trace the vehicle and identify all suspects
involved. Call detail records of Ravi Tandel's mobile number have been
requisitioned for the relevant period.

Investigating Officer: PSI R. Bhonsle, Sitabuldi PS.
""")

write_text(os.path.join(fir_dir, "FIR_2024_0198.txt"), """
FIRST INFORMATION REPORT
FIR No: 2024/0198                          Police Station: Civil Lines
Date of Offence: 02-Mar-2024                Time: 22:45 hrs
Sections: IPC 392 (Robbery), 34 (Common intention)

Complainant: Security Guard on duty, SecureCash ATM Replenishment Van, Civil
Lines ATM, Nagpur.

Brief Facts:
On the night of 02-Mar-2024, a cash-replenishment van was intercepted near
Civil Lines ATM by two masked men on a motorcycle who forced the van to a stop
using a country-made pistol. Approximately Rs. 9,20,000 in cash was seized
from the van before the assailants fled towards Wardha Road. One suspect was
later identified as Suresh Pawar based on a distinctive tattoo visible on his
forearm, matched against prior criminal records.

Mobile tower data places a phone number ending in 2345 in the vicinity of
Civil Lines between 22:00 and 23:15 hrs on the date of the offence. This
number is being cross-checked against known associates of persons involved in
the earlier Sitabuldi jewelry showroom robbery (FIR 2024/0142), given
similarities in modus operandi — a mobile team dispersing quickly towards
Wardha Road in both cases.

Investigating Officer: PI M. Kale, Civil Lines PS.
""")

write_text(os.path.join(fir_dir, "FIR_2024_0233.txt"), """
FIRST INFORMATION REPORT
FIR No: 2024/0233                          Police Station: Manish Nagar
Date of Offence: 19-Apr-2024                Time: 03:10 hrs
Sections: IPC 457 (Lurking house-trespass by night), 380 (Theft)

Complainant: Mrs. Sunita Agrawal, resident of Manish Nagar residential colony,
Nagpur.

Brief Facts:
On the intervening night of 18/19-Apr-2024, unidentified persons broke into
the complainant's residence while the family was away and made off with
jewelry and electronics estimated at Rs. 6,40,000. A neighbour reported
seeing an unfamiliar man loitering near the house two days prior, matching
the description of a man later identified through follow-up investigation as
Vikram Chauhan, who has a prior history of association with persons already
under investigation in FIR 2024/0142 and FIR 2024/0198.

No vehicle was seen at the scene, but a two-wheeler matching the description
of a bike frequently seen near the earlier Sitabuldi Market incident
(registration partially noted as MH31 CD ....) was reported by a resident to
have been parked near the colony entrance on the night of the burglary.

Investigating Officer: ASI V. Deshpande, Manish Nagar PS.
""")

# ---- Surveillance reports ----
surv_dir = ensure_dir(os.path.join(CASE_A_DIR, "surveillance_reports"))

write_text(os.path.join(surv_dir, "surveillance_001.txt"), """
SURVEILLANCE REPORT (Confidential)
Reference: SR/2024/0087
Subject of Surveillance: Vehicle MH31 AB 1234, MH31 CD 5678

Date: 20-Feb-2024

Field team observed vehicle MH31 AB 1234 (white Maruti Swift, matching
description from FIR 2024/0142) enter Wardha Road workshop premises at
approximately 11:15 hrs. The vehicle exited at 16:40 hrs with a visibly
different paint colour (silver-grey), suggesting a repaint to alter
appearance. Workshop is a small unlicensed garage operated informally, no
name board displayed.

Separately, a two-wheeler (registration MH31 CD 5678) was observed parked
outside the same workshop on two occasions this week, operated on both
occasions by a woman later identified as Pooja Rane, who has no prior police
record but has been seen in the company of persons connected to the ongoing
Sitabuldi jewelry robbery investigation.

Recommend continued surveillance of Wardha Road workshop premises.

Reporting Officer: Constable S. Yadav, Special Branch.
""")

write_text(os.path.join(surv_dir, "surveillance_002.txt"), """
SURVEILLANCE REPORT (Confidential)
Reference: SR/2024/0091
Subject of Surveillance: Kamptee Road warehouse premises

Date: 25-Feb-2024

Field team maintained observation of a warehouse property on Kamptee Road,
believed to be used as a meeting point / storage location for persons
connected to ongoing robbery investigations (FIR 2024/0142, FIR 2024/0198).

A man identified as Iqbal Sheikh was seen entering the premises on three
separate occasions this week (21-Feb, 23-Feb, 25-Feb), each time followed
within 30-45 minutes by the separate arrival of one or more of: Ravi Tandel,
Suresh Pawar, Vikram Chauhan, and Ajay More. Meetings inside the warehouse
typically lasted 20-40 minutes. No other individuals of interest were
observed entering or leaving the premises during the surveillance period.
Ownership records for the warehouse are still being traced.

Reporting Officer: Constable S. Yadav, Special Branch.
""")

# ---- CDR (Call Detail Records) CSV ----
cdr_dir = ensure_dir(os.path.join(CASE_A_DIR, "cdr_logs"))

# Pattern: Sanjay calls Iqbal shortly before Iqbal calls each operative,
# around each of the three incidents. Sanjay NEVER appears calling operatives
# directly -- this is the hidden-coordinator pattern for the GNN to recover.
cdr_rows = [
    # --- Around FIR 2024/0142 (14-Feb) ---
    ("9822011234", "9822045678", "2024-02-14 09:02:11", 184, "Kamptee Road Tower"),
    ("9822045678", "9822078901", "2024-02-14 09:31:40", 95,  "Kamptee Road Tower"),
    ("9822045678", "9822098765", "2024-02-14 09:35:02", 61,  "Kamptee Road Tower"),
    ("9822078901", "9822098765", "2024-02-14 13:50:19", 40,  "Sitabuldi Tower"),
    ("9822098765", "9822078901", "2024-02-14 14:35:07", 22,  "Sitabuldi Tower"),
    ("9822045678", "9822078901", "2024-02-14 15:10:44", 30,  "Kamptee Road Tower"),
    # --- Around FIR 2024/0198 (02-Mar) ---
    ("9822011234", "9822045678", "2024-03-02 18:12:03", 210, "Kamptee Road Tower"),
    ("9822045678", "9822012345", "2024-03-02 18:45:51", 88,  "Kamptee Road Tower"),
    ("9822045678", "9822054321", "2024-03-02 19:02:37", 47,  "Kamptee Road Tower"),
    ("9822012345", "9822054321", "2024-03-02 21:40:12", 30,  "Civil Lines Tower"),
    ("9822054321", "9822012345", "2024-03-02 23:22:05", 18,  "Wardha Road Tower"),
    # --- Around FIR 2024/0233 (19-Apr) ---
    ("9822011234", "9822045678", "2024-04-18 20:05:29", 175, "Kamptee Road Tower"),
    ("9822045678", "9822067890", "2024-04-18 20:38:14", 70,  "Kamptee Road Tower"),
    ("9822067890", "9822054321", "2024-04-18 23:15:00", 25,  "Manish Nagar Tower"),
    ("9822054321", "9822045678", "2024-04-19 03:25:41", 33,  "Manish Nagar Tower"),
    # --- routine noise calls (not case-relevant, included for realism) ---
    ("9822078901", "9876511111", "2024-02-16 11:00:00", 120, "Sitabuldi Tower"),
    ("9822012345", "9876522222", "2024-03-05 10:15:00", 95,  "Civil Lines Tower"),
    ("9822067890", "9876533333", "2024-04-01 17:40:00", 60,  "Manish Nagar Tower"),
]
with open(os.path.join(cdr_dir, "cdr_log_case_A.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["caller_number", "callee_number", "timestamp", "duration_seconds", "cell_tower_location"])
    writer.writerows(cdr_rows)

# ---- Financial transactions CSV (the fencing / laundering chain) ----
fin_dir = ensure_dir(os.path.join(CASE_A_DIR, "financial_transactions"))
financial_rows = [
    ("TXN10021", "2024-02-15", "Ravi Tandel (cash)", "Mahesh Jewelers - Current A/c 04521178", 620000, "Cash deposit - gold sale"),
    ("TXN10022", "2024-02-17", "Mahesh Jewelers - Current A/c 04521178", "Shree Ganesh Scrap Traders - A/c 07734410", 400000, "Business payment - scrap supply invoice #SG-118"),
    ("TXN10023", "2024-02-18", "Shree Ganesh Scrap Traders - A/c 07734410", "Sanjay Deshmukh - Savings A/c 09981123", 250000, "Owner drawings"),
    ("TXN10031", "2024-03-04", "Suresh Pawar (cash)", "Mahesh Jewelers - Current A/c 04521178", 310000, "Cash deposit - misc goods"),
    ("TXN10032", "2024-03-06", "Mahesh Jewelers - Current A/c 04521178", "Shree Ganesh Scrap Traders - A/c 07734410", 200000, "Business payment - scrap supply invoice #SG-121"),
    ("TXN10033", "2024-03-07", "Shree Ganesh Scrap Traders - A/c 07734410", "Sanjay Deshmukh - Savings A/c 09981123", 130000, "Owner drawings"),
    ("TXN10041", "2024-04-20", "Vikram Chauhan (cash)", "Mahesh Jewelers - Current A/c 04521178", 210000, "Cash deposit - jewelry sale"),
    ("TXN10042", "2024-04-22", "Mahesh Jewelers - Current A/c 04521178", "Shree Ganesh Scrap Traders - A/c 07734410", 150000, "Business payment - scrap supply invoice #SG-129"),
    ("TXN10043", "2024-04-23", "Shree Ganesh Scrap Traders - A/c 07734410", "Sanjay Deshmukh - Savings A/c 09981123", 95000, "Owner drawings"),
    # unrelated noise transactions for realism
    ("TXN10099", "2024-03-11", "Mahesh Jewelers - Current A/c 04521178", "Nagpur Municipal Corp", 18500, "Property tax"),
    ("TXN10100", "2024-04-02", "Shree Ganesh Scrap Traders - A/c 07734410", "State Electricity Board", 6200, "Electricity bill"),
]
with open(os.path.join(fin_dir, "financial_transactions_case_A.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["transaction_id", "date", "from_account", "to_account", "amount_inr", "description"])
    writer.writerows(financial_rows)

# ---- Intercepted call transcript + synthesized audio ----
intercept_dir = ensure_dir(os.path.join(CASE_A_DIR, "intercepted_calls"))
transcript = """
INTERCEPTED CALL TRANSCRIPT
Call Reference: IC-2024-0037
Date/Time: 18-Apr-2024, 20:38 hrs
Participants: Speaker A (identified as Iqbal Sheikh, number 9822045678),
              Speaker B (identified as Vikram Chauhan, number 9822067890)

Speaker A: Kal raat wala kaam ho jayega na, sab set hai?
Speaker B: Haan bhai, Manish Nagar wala ghar khali hai, family bahar gayi hai.
Speaker A: Theek hai. Bhai ka message hai, jaldi nikalna, zyada time mat lena.
Speaker B: Samajh gaya. Pooja ne bike wahin chhod di hai kya?
Speaker A: Haan, colony ke gate ke bahar. Kaam ke baad seedha workshop aana,
gaadi ka rang badalna hai.
Speaker B: Theek hai, ho jayega.

[END OF TRANSCRIPT]

Note for investigators: Speaker A refers to "Bhai" giving instructions but
does not name him. Cross-reference with CDR log (call from 9822011234 to
9822045678 at 20:05 hrs, same evening, 175 seconds) and financial_transactions
CSV to establish identity of "Bhai".
""".strip()
write_text(os.path.join(intercept_dir, "intercepted_call_001_transcript.txt"), transcript)

# Synthesize a short English-narrated version as audio using espeak-ng,
# since the pipeline's Whisper transcription step needs an actual audio file
# to demonstrate on. (A Hindi-script TTS voice isn't reliably available in
# this offline espeak-ng install, so the audio version below is an English
# investigator's read-aloud of the same content for demo purposes -- the
# transcript .txt above is the authoritative version.)
audio_narration = (
    "Intercepted call, reference I C dash 2024 dash 0037, 18th April, 20:38 hours. "
    "Speaker A, believed to be Iqbal Sheikh, asks if last night's job is ready. "
    "Speaker B, believed to be Vikram Chauhan, confirms the house in Manish Nagar "
    "is empty, the family has gone out of town. Speaker A says boss's message is "
    "to move quickly and not take too much time. Speaker B asks if Pooja left the "
    "motorcycle there. Speaker A confirms, outside the colony gate, and instructs "
    "him to come straight to the workshop afterward to change the color of the "
    "vehicle. End of call."
)
audio_path = os.path.join(intercept_dir, "intercepted_call_001_narration.wav")
subprocess.run(["espeak-ng", "-s", "150", "-w", audio_path, audio_narration], check=True)

print("Case A generated.")

# ======================================================================
# CCTV still images (Case A) — simple generated images with embedded,
# OCR-readable text, so the ingestion pipeline's OCR step has something
# real to extract entities from.
# ======================================================================
from PIL import Image, ImageDraw, ImageFont

cctv_dir = ensure_dir(os.path.join(CASE_A_DIR, "cctv_stills"))


def make_cctv_still(filename, lines, size=(640, 400)):
    img = Image.new("RGB", size, color=(20, 24, 20))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 20)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 16)
    except Exception:
        font = ImageFont.load_default()
        font_small = font

    # Fake camera framing to make it visually read as CCTV-style evidence
    draw.rectangle([0, 0, size[0] - 1, size[1] - 1], outline=(80, 200, 80), width=2)
    draw.text((14, 12), "● REC", fill=(255, 60, 60), font=font)
    draw.text((size[0] - 160, 12), lines["timestamp"], fill=(200, 255, 200), font=font_small)

    y = 60
    for key in ["camera", "location"]:
        draw.text((14, y), lines[key], fill=(200, 255, 200), font=font_small)
        y += 26

    # Simulated vehicle/plate box (the "evidence" text OCR should pick up)
    draw.rectangle([60, 160, 580, 260], outline=(120, 200, 255), width=2)
    draw.text((75, 175), lines["object_desc"], fill=(230, 230, 255), font=font)
    draw.text((75, 210), lines["plate_or_detail"], fill=(255, 220, 120), font=font)

    ensure_dir(os.path.dirname(filename))
    img.save(filename)


make_cctv_still(
    os.path.join(cctv_dir, "cctv_sitabuldi_cam3.png"),
    {
        "timestamp": "14-Feb-2024 14:22:07",
        "camera": "CAMERA 3 - EXTERIOR",
        "location": "LOCATION: Sitabuldi Market, Royal Jewelers frontage",
        "object_desc": "VEHICLE: White Maruti Swift, engine running",
        "plate_or_detail": "PLATE: MH31 AB 1234",
    },
)

make_cctv_still(
    os.path.join(cctv_dir, "cctv_wardha_workshop.png"),
    {
        "timestamp": "20-Feb-2024 11:16:52",
        "camera": "CAMERA 1 - STREET VIEW",
        "location": "LOCATION: Wardha Road, unlicensed workshop premises",
        "object_desc": "VEHICLE ENTERING: White Maruti Swift",
        "plate_or_detail": "PLATE: MH31 AB 1234",
    },
)

make_cctv_still(
    os.path.join(cctv_dir, "cctv_wardha_workshop_exit.png"),
    {
        "timestamp": "20-Feb-2024 16:41:10",
        "camera": "CAMERA 1 - STREET VIEW",
        "location": "LOCATION: Wardha Road, unlicensed workshop premises",
        "object_desc": "VEHICLE EXITING: Silver-grey Maruti Swift (repainted)",
        "plate_or_detail": "PLATE: MH31 AB 1234",
    },
)

make_cctv_still(
    os.path.join(cctv_dir, "cctv_manishnagar_gate.png"),
    {
        "timestamp": "18-Apr-2024 22:58:33",
        "camera": "CAMERA 2 - COLONY GATE",
        "location": "LOCATION: Manish Nagar residential colony entrance",
        "object_desc": "VEHICLE PARKED: Two-wheeler, rider dismounted",
        "plate_or_detail": "PLATE: MH31 CD 5678",
    },
)

print("CCTV stills generated.")


# ======================================================================
# CASE B — lighter case, for dashboard population
# "Wadi Bike Snatching Ring"
# ======================================================================
CASE_B_DIR = ensure_dir(os.path.join(ROOT, "case_B_wadi_bike_snatching_ring"))

fir_dir_b = ensure_dir(os.path.join(CASE_B_DIR, "fir_reports"))
write_text(os.path.join(fir_dir_b, "FIR_2024_0301.txt"), """
FIRST INFORMATION REPORT
FIR No: 2024/0301                          Police Station: Wadi
Date of Offence: 05-May-2024                Time: 21:15 hrs
Sections: IPC 379 (Theft), 34 (Common intention)

Complainant: Mr. Nilesh Sarode, resident of Wadi, Nagpur.

Brief Facts:
Complainant was walking near Wadi bus stand when two men on a motorcycle
(one identified by a passer-by as Rohit Ingle) snatched his mobile phone and
a gold chain before fleeing towards Hingna Road. A similar incident was
reported three days earlier in the same area, suspected to be the same group
based on matching descriptions of the motorcycle (black Bajaj Pulsar, partial
plate MH40 EF ....).

Investigating Officer: ASI P. Thakre, Wadi PS.
""")

write_text(os.path.join(fir_dir_b, "FIR_2024_0288.txt"), """
FIRST INFORMATION REPORT
FIR No: 2024/0288                          Police Station: Wadi
Date of Offence: 02-May-2024                Time: 20:40 hrs
Sections: IPC 379 (Theft)

Complainant: Ms. Kavita Ambhore, resident of Hingna Road, Nagpur.

Brief Facts:
Complainant's handbag was snatched by a motorcycle-borne assailant near
Hingna Road crossing. A witness noted the motorcycle rider was accompanied by
a second man, believed to be Sameer Qureshi, who has a prior record for
similar offences in the Wadi area.

Investigating Officer: ASI P. Thakre, Wadi PS.
""")

cdr_dir_b = ensure_dir(os.path.join(CASE_B_DIR, "cdr_logs"))
cdr_rows_b = [
    ("9811022001", "9811033002", "2024-05-02 19:50:11", 45, "Hingna Road Tower"),
    ("9811033002", "9811022001", "2024-05-02 20:55:30", 20, "Hingna Road Tower"),
    ("9811022001", "9811033002", "2024-05-05 20:40:02", 38, "Wadi Tower"),
    ("9811033002", "9811044003", "2024-05-05 21:20:15", 15, "Wadi Tower"),
]
with open(os.path.join(cdr_dir_b, "cdr_log_case_B.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["caller_number", "callee_number", "timestamp", "duration_seconds", "cell_tower_location"])
    writer.writerows(cdr_rows_b)

ground_truth_b = {
    "case_name": "Wadi Bike Snatching Ring",
    "narrative_summary": "A small two-to-three person street-snatching ring operating near Wadi and Hingna Road. Included as a lighter, faster-to-review second case for the dashboard/case-list demo.",
    "entities": [
        {"id": "rohit_ingle", "type": "PERSON", "value": "Rohit Ingle", "aliases": [], "role": "operative"},
        {"id": "sameer_qureshi", "type": "PERSON", "value": "Sameer Qureshi", "aliases": [], "role": "operative"},
        {"id": "vehicle_pulsar", "type": "VEHICLE", "value": "MH40 EF (partial)", "aliases": [], "role": "getaway_bike"},
        {"id": "loc_wadi_bus_stand", "type": "LOCATION", "value": "Wadi bus stand", "aliases": [], "role": "incident_site"},
        {"id": "loc_hingna_crossing", "type": "LOCATION", "value": "Hingna Road crossing", "aliases": [], "role": "incident_site"},
        {"id": "phone_rohit", "type": "PHONE", "value": "9811022001", "aliases": [], "role": "operative_phone"},
        {"id": "phone_sameer", "type": "PHONE", "value": "9811033002", "aliases": [], "role": "operative_phone"}
    ],
    "edges_explicit": [
        {"source": "rohit_ingle", "target": "sameer_qureshi", "relation": "coordinates_with", "evidence": "CDR log"},
        {"source": "rohit_ingle", "target": "vehicle_pulsar", "relation": "used_vehicle", "evidence": "FIR_2024_0301.txt"},
        {"source": "sameer_qureshi", "target": "loc_hingna_crossing", "relation": "present_at", "evidence": "FIR_2024_0288.txt"},
        {"source": "rohit_ingle", "target": "loc_wadi_bus_stand", "relation": "present_at", "evidence": "FIR_2024_0301.txt"}
    ],
    "edges_hidden": []
}
write_text(os.path.join(CASE_B_DIR, "ground_truth.json"), json.dumps(ground_truth_b, indent=2))

print("Case B generated.")


# ======================================================================
# CASE C — lighter case, for dashboard population
# "Dharampeth Residential Burglary Series"
# ======================================================================
CASE_C_DIR = ensure_dir(os.path.join(ROOT, "case_C_dharampeth_burglary_series"))

fir_dir_c = ensure_dir(os.path.join(CASE_C_DIR, "fir_reports"))
write_text(os.path.join(fir_dir_c, "FIR_2024_0355.txt"), """
FIRST INFORMATION REPORT
FIR No: 2024/0355                          Police Station: Dharampeth
Date of Offence: 12-Jun-2024                Time: 02:30 hrs
Sections: IPC 457, 380

Complainant: Mr. Arvind Kulkarni, resident of Dharampeth, Nagpur.

Brief Facts:
Complainant's residence was broken into while the family was asleep on the
first floor; the burglars appear to have specifically targeted a ground-floor
study room, taking a laptop and cash. Neighbours reported a delivery-type
two-wheeler idling outside the property earlier that evening, rider
unidentified. Investigation ongoing; no suspects named at this stage.

Investigating Officer: PSI N. Gawande, Dharampeth PS.
""")

write_text(os.path.join(fir_dir_c, "FIR_2024_0371.txt"), """
FIRST INFORMATION REPORT
FIR No: 2024/0371                          Police Station: Dharampeth
Date of Offence: 20-Jun-2024                Time: 01:45 hrs
Sections: IPC 457, 380

Complainant: Mrs. Leela Bhagwat, resident of Dharampeth, Nagpur.

Brief Facts:
Similar modus operandi to FIR 2024/0355 — burglary during early morning hours
targeting a ground-floor room, laptop and jewelry taken. A resident from the
same street reported seeing a man matching the description of a person named
Faisal Ansari, previously questioned in an unrelated matter, loitering in the
lane two nights before the incident.

Investigating Officer: PSI N. Gawande, Dharampeth PS.
""")

ground_truth_c = {
    "case_name": "Dharampeth Residential Burglary Series",
    "narrative_summary": "Two similar-MO burglaries under investigation, one named person of interest, no confirmed network yet — included as a realistic 'early-stage, thin-data' case for the dashboard.",
    "entities": [
        {"id": "faisal_ansari", "type": "PERSON", "value": "Faisal Ansari", "aliases": [], "role": "person_of_interest"},
        {"id": "loc_dharampeth", "type": "LOCATION", "value": "Dharampeth", "aliases": [], "role": "incident_area"}
    ],
    "edges_explicit": [
        {"source": "faisal_ansari", "target": "loc_dharampeth", "relation": "seen_near", "evidence": "FIR_2024_0371.txt"}
    ],
    "edges_hidden": []
}
write_text(os.path.join(CASE_C_DIR, "ground_truth.json"), json.dumps(ground_truth_c, indent=2))

print("Case C generated.")
