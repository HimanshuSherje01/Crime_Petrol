import os
from pathlib import Path
import pytesseract
from PIL import Image

def parse_ocr(case_path: Path):
    cctv_dir = case_path / "cctv_stills"
    results = []
    
    if not cctv_dir.exists():
        return results

    for img_file in cctv_dir.glob("*.png"):
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
