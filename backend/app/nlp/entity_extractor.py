import spacy
import re
from typing import List, Dict

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Warning: en_core_web_sm model not found. Downloading...")
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

PHONE = re.compile(r'\b[6-9]\d{9}\b')
VEHICLE = re.compile(r'[A-Z]{2}\d{2}[A-Z]{2}\d{4}')
AMOUNT = re.compile(r'₹\s?[\d,]+')

def extract(text: str, source: str, file_name: str) -> List[Dict]:
    doc = nlp(text)
    out = []
    
    # NLP Entities
    for e in doc.ents:
        if e.label_ in ("PERSON", "ORG", "GPE"):
            # Map GPE to LOCATION
            ent_type = "LOCATION" if e.label_ == "GPE" else e.label_
            out.append({
                "text": e.text.strip(), 
                "type": ent_type, 
                "source": source,
                "file": file_name
            })
            
    # Regex Entities
    for m in PHONE.findall(text): 
        out.append({"text": m.strip(), "type": "PHONE", "source": source, "file": file_name})
    for m in VEHICLE.findall(text): 
        out.append({"text": m.strip(), "type": "VEHICLE", "source": source, "file": file_name})
    for m in AMOUNT.findall(text): 
        out.append({"text": m.strip(), "type": "AMOUNT", "source": source, "file": file_name})
        
    return out
