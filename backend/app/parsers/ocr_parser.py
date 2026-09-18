import os
from pathlib import Path
import pytesseract
from PIL import Image

def parse_ocr(case_path: Path):
    results = []
    
    if not case_path.exists():
        return results

    image_files = list(case_path.rglob("*.png")) + list(case_path.rglob("*.jpg")) + list(case_path.rglob("*.jpeg"))
    
    for img_file in image_files:
        try:
            image = Image.open(img_file)
            text = pytesseract.image_to_string(image).strip()
            if text:
                results.append({
                    "file": img_file.name,
                    "text": text,
                    "source_type": "CCTV"
                })
        except Exception as e:
            print(f"Error OCR parsing {img_file.name}: {e}")
            
    return results
