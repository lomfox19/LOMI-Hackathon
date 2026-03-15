"""
Topic extraction using TF-IDF or keyword frequency to detect common discussion topics.
"""
from collections import Counter
import re

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    _HAS_SKLEARN = True
except ImportError:
    _HAS_SKLEARN = False

from keyword_extractor import extract_keywords

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
        "this", "that", "these", "those", "it", "its", "my", "your",
    }


def _normalize_phrase(phrase):
    """Normalize to lowercase and strip."""
    return " ".join(phrase.lower().split()).strip()


def extract_topics_tfidf(texts, max_topics=10):
    """
    Use TF-IDF to get distinctive terms across documents as topic indicators.
    Returns list of topic strings (e.g. ["delivery delay", "product quality"]).
    """
    if not texts or not _HAS_SKLEARN:
        return _extract_topics_fallback(texts, max_topics)

    try:
        vectorizer = TfidfVectorizer(
            max_features=50,
            stop_words=list(_STOP),
            ngram_range=(1, 2),
            min_df=1,
        )
        X = vectorizer.fit_transform(texts)
        terms = vectorizer.get_feature_names_out()
        scores = X.sum(axis=0).A1
        order = scores.argsort()[::-1]
        topics = []
        for i in order[:max_topics]:
            t = _normalize_phrase(str(terms[i]))
            if len(t) > 2 and t not in topics:
                topics.append(t)
        return topics[:max_topics]
    except Exception:
        return _extract_topics_fallback(texts, max_topics)


def _extract_topics_fallback(texts, max_topics=10):
    """Fallback: use keyword frequency and common bigrams."""
    keywords = extract_keywords(texts, top_n=max_topics * 2, min_word_len=2)
    # Optionally add bigrams
    combined = " ".join(t for t in texts if isinstance(t, str)).lower()
    tokens = re.findall(r"\b[a-zA-Z]{2,}\b", combined)
    bigrams = []
    for i in range(len(tokens) - 1):
        w1, w2 = tokens[i], tokens[i + 1]
        if w1 not in _STOP and w2 not in _STOP:
            bigrams.append(f"{w1} {w2}")
    bigram_counts = Counter(bigrams)
    topics = list(keywords[: max_topics - 3]) + [
        b for b, _ in bigram_counts.most_common(5) if b not in keywords
    ]
    return list(dict.fromkeys(topics))[:max_topics]


def extract_topics(feedback_list, max_topics=10):
    """
    Extract common discussion topics from feedback list.
    Returns list of topic strings.
    """
    if not feedback_list:
        return []
    return extract_topics_tfidf(feedback_list, max_topics=max_topics)
