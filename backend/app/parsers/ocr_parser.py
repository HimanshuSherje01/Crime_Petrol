from pathlib import Path

from rapidocr_onnxruntime import RapidOCR

_engine = None


def _get_engine():
    global _engine
    if _engine is None:
        _engine = RapidOCR()
    return _engine


def parse_ocr(case_path: Path):
    results = []

    if not case_path.exists():
        return results

    image_files = (
        list(case_path.rglob("*.png"))
        + list(case_path.rglob("*.jpg"))
        + list(case_path.rglob("*.jpeg"))
    )
    if not image_files:
        return results

    try:
        engine = _get_engine()
    except Exception as e:
        print(f"OCR engine unavailable: {e}")
        return results

    for img_file in image_files:
        try:
            lines, _ = engine(str(img_file))
            text = "\n".join(line[1] for line in lines).strip() if lines else ""
            if text:
                results.append({
                    "file": img_file.name,
                    "text": text,
                    "source_type": "CCTV"
                })
        except Exception as e:
            print(f"Error OCR parsing {img_file.name}: {e}")

    return results