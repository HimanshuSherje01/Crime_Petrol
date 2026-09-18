from pathlib import Path

from faster_whisper import WhisperModel

_model = None


def _get_model():
    global _model
    if _model is None:
        try:
            _model = WhisperModel("base", device="cpu", compute_type="int8")
        except Exception as e:
            print(f"Failed to load Faster-Whisper model: {e}")
    return _model


def parse_audio(case_path: Path):
    results = []

    if not case_path.exists():
        return results

    audio_files = (
        list(case_path.rglob("*.wav"))
        + list(case_path.rglob("*.mp3"))
        + list(case_path.rglob("*.m4a"))
    )

    model = _get_model()

    for wav_file in audio_files:
        text = ""
        if model is not None:
            try:
                segments, _ = model.transcribe(str(wav_file))
                text = " ".join(segment.text.strip() for segment in segments).strip()
            except Exception as e:
                print(f"Faster-Whisper failed for {wav_file.name}: {e}")

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