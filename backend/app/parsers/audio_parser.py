import os
from pathlib import Path
import whisper

model = None

def load_whisper():
    global model
    if model is None:
        try:
            model = whisper.load_model("base")
        except Exception as e:
            print(f"Failed to load Whisper model: {e}")

def parse_audio(case_path: Path):
    results = []
    
    if not case_path.exists():
        return results

    audio_files = list(case_path.rglob("*.wav")) + list(case_path.rglob("*.mp3")) + list(case_path.rglob("*.m4a"))

    for wav_file in audio_files:
        text = ""
        # Try whisper first
        try:
            load_whisper()
            if model:
                result = model.transcribe(str(wav_file))
                text = result.get("text", "").strip()
        except Exception as e:
            print(f"Whisper failed for {wav_file.name}: {e}")

        # Fallback to transcript
        if not text:
            transcript_file = wav_file.parent / f"{wav_file.stem}_transcript.txt"
            if transcript_file.exists():
                with open(transcript_file, "r", encoding="utf-8") as f:
                    text = f.read().strip()
        
        if text:
            results.append({
                "file": wav_file.name,
                "text": text,
                "source_type": "AUDIO"
            })
            
    return results
