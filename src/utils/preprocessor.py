import re
from textblob import TextBlob

# Optional: turn this off to speed up processing
ENABLE_SPELLING_CORRECTION = False

REDUNDANT_PATTERNS = [
    r"\bn/a\b", r"\bna\b", r"\bn\.a\.\b",
    r"\bi think\b", r"\bin my opinion\b", r"\bi feel that\b",
    r"\bsome of\b", r"\ba bit\b", r"\bjust\b",
]

ABBREVIATIONS = {
    "ppt": "powerpoint",
    "pdfs": "pdf files",
    "pharm": "pharmacology",
    "rx": "prescription"
}

def correct_spelling(text):
    return str(TextBlob(text).correct())

def expand_abbreviations(text):
    for abbr, full in ABBREVIATIONS.items():
        text = re.sub(rf"\b{abbr}\b", full, text, flags=re.IGNORECASE)
    return text

def remove_redundant_phrases(text):
    for pattern in REDUNDANT_PATTERNS:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    return re.sub(r'\s+', ' ', text).strip()

def preprocess_sentences(sentences: list[str]) -> list[str]:
    cleaned = []
    for sentence in sentences:
        text = sentence.lower()
        text = expand_abbreviations(text)
        text = remove_redundant_phrases(text)
        if ENABLE_SPELLING_CORRECTION:
            text = correct_spelling(text)
        cleaned.append(text)
    return cleaned
