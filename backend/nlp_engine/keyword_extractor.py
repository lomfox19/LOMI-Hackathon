"""
Keyword extraction: most frequent meaningful terms, ignoring stopwords.
Returns top N keywords (default 10).
"""
import re
from collections import Counter

try:
    import nltk
    from nltk.corpus import stopwords
    try:
        stopwords.words("english")
    except LookupError:
        nltk.download("stopwords", quiet=True)
    _STOP = set(stopwords.words("english"))
except Exception:
    _STOP = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "is", "was", "are", "were", "been", "be",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "must", "can", "this", "that", "these",
        "those", "i", "you", "he", "she", "it", "we", "they", "my", "your",
    }


def extract_keywords(texts, top_n=10, min_word_len=2):
    """
    Extract top N keywords from a list of feedback texts.
    Ignores stopwords and very short tokens.
    """
    if not texts:
        return []

    combined = " ".join(t for t in texts if isinstance(t, str))
    tokens = re.findall(r"\b[a-zA-Z]{2,}\b", combined.lower())
    filtered = [t for t in tokens if t not in _STOP]
    counts = Counter(filtered)
    return [word for word, _ in counts.most_common(top_n)]
