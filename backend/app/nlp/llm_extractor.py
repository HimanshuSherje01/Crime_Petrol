"""
LLM-powered entity extractor (Groq free-tier, llama-3.3-70b-versatile).

Falls back to empty list on any failure / missing key so the pipeline can
revert to the reliable spaCy + regex extractor.
"""

import json
import os
import re
from typing import List, Dict

import requests

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

ALLOWED_TYPES = {
    "PERSON", "ORGANIZATION", "ORG", "ORGANISATION", "LOCATION", "GPE",
    "VEHICLE", "CAR", "BIKE", "PHONE", "PHONE_NUMBER", "CDR",
    "BANK_ACCOUNT", "BANK", "ACCOUNT", "AMOUNT", "MONEY",
    "FIR_NUMBER", "FIR", "CASE_NUMBER",
}

_TYPE_MAP = {
    "PERSON": "PERSON",
    "ORGANIZATION": "ORG",
    "ORG": "ORG",
    "ORGANISATION": "ORG",
    "LOCATION": "LOCATION",
    "GPE": "LOCATION",
    "VEHICLE": "VEHICLE",
    "CAR": "VEHICLE",
    "BIKE": "VEHICLE",
    "PHONE": "PHONE",
    "PHONE_NUMBER": "PHONE",
    "CDR": "PHONE",
    "BANK_ACCOUNT": "BANK",
    "BANK": "BANK",
    "ACCOUNT": "BANK",
    "AMOUNT": "AMOUNT",
    "MONEY": "AMOUNT",
    "FIR_NUMBER": "FIR",
    "FIR": "FIR",
    "CASE_NUMBER": "FIR",
}

_SYSTEM_PROMPT = (
    "You are an expert Indian law-enforcement intelligence analyst.\n"
    "You receive a single evidence document (FIR text, CDR transcript, surveillance report, "
    "bank statement, CCTV description, call-log, etc.).\n\n"
    "TASK: Extract all concrete named entities mentioned in the document.\n\n"
    "OUTPUT RULES:\n"
    "- Return ONLY valid JSON — no markdown fences, no commentary.\n"
    "- Shape: {\"entities\":[{\"text\":\"<exact substring>\",\"type\":\"<TYPE>\"}]}\n"
    "- <TYPE> must be exactly one of: PERSON, ORGANIZATION, LOCATION, VEHICLE, PHONE, "
    "BANK_ACCOUNT, AMOUNT, FIR_NUMBER.\n"
    "- For phone numbers, include the full number exactly as written.\n"
    "- For vehicles, include the full registration string exactly.\n"
    "- For monetary amounts, keep the currency symbol if present.\n"
    "- For FIRs / case numbers, include the full alphanumeric string.\n"
    "- For locations, use the full place name as written (do not translate or standardize).\n"
    "- If multiple entities share the same substring, list each distinct entity once.\n"
    "- If you find no named entities, return {\"entities\":[]}.\n"
)

_USER_TEMPLATE = (
    "Below is an excerpt from a {source} evidence document ({filename}).\n"
    "Extract every concrete named entity.\n\n"
    "\"\"\"\n{text}\n\"\"\""
)


def _map_type(raw_type: str) -> str | None:
    return _TYPE_MAP.get(raw_type.strip().upper())


def _parse_json_from_llm(content: str) -> dict | None:
    """Extract the first JSON object from LLM output, tolerating markdown fences."""
    # Strip markdown code fences the model may emit
    content = content.strip()
    content = re.sub(r"^```(?:json)?\s*\n?", "", content, flags=re.IGNORECASE)
    content = re.sub(r"\n?```\s*$", "", content)
    content = content.strip()

    start = content.find("{")
    end = content.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        return json.loads(content[start : end + 1])
    except json.JSONDecodeError:
        return None


def extract_with_llm(text: str, source_type: str, file_name: str, timeout: int = 45) -> List[Dict]:
    """
    Ask Groq / llama-3.3 for entities.  Returns a list of raw entity dicts
    compatible with the NLP pipeline, or an empty list on any failure.
    """
    from app.config import GROQ_API_KEY, GROQ_MODEL

    api_key = GROQ_API_KEY
    model = GROQ_MODEL
    if not api_key:
        return []

    # Truncate text to first ~3 500 chars to keep prompt well within free-tier limits
    trimmed = text[:3_500]
    if len(text) > len(trimmed):
        trimmed += "\n… [truncated]"

    payload = {
        "model": model,
        "temperature": 0.0,
        "max_tokens": 1_024,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {
                "role": "user",
                "content": _USER_TEMPLATE.format(source=source_type, filename=file_name, text=trimmed),
            },
        ],
    }

    try:
        resp = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=timeout,
        )
        if resp.status_code != 200:
            print(f"LLM extractor HTTP {resp.status_code}: {(resp.text or '')[:180]}")
            return []

        content = resp.json()["choices"][0]["message"]["content"]
        parsed = _parse_json_from_llm(content)
        if not parsed:
            print("LLM extractor: could not parse JSON from model response")
            return []

        out = []
        seen = set()
        for ent in parsed.get("entities", []):
            etype = _map_type(str(ent.get("type", "")))
            if etype is None:
                continue
            etext = str(ent.get("text", "")).strip()
            if not etext:
                continue
            key = (etext.lower(), etype)
            if key in seen:
                continue
            seen.add(key)
            out.append({"text": etext, "type": etype, "source": source_type, "file": file_name})

        return out

    except Exception as exc:
        print(f"LLM extractor skipped: {exc}")
        return []
