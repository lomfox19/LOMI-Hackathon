"""
Local sentiment analysis using TextBlob.
Returns structured result compatible with dashboard/analytics.
"""
from textblob import TextBlob


def analyze_sentiment(text):
    """
    Analyze sentiment of a single text.
    Returns: { "sentiment_score": number, "sentiment_label": "positive"|"neutral"|"negative" }
    """
    if not text or not isinstance(text, str):
        return {"sentiment_score": 0.5, "sentiment_label": "neutral"}

    blob = TextBlob(text)
    score = blob.sentiment.polarity  # -1 to 1

    if score > 0.1:
        label = "positive"
    elif score < -0.1:
        label = "negative"
    else:
        label = "neutral"

    # Normalize to 0.0 - 1.0 for compatibility
    normalized_score = round((score + 1) / 2, 4)
    return {
        "sentiment_score": normalized_score,
        "sentiment_label": label,
    }


def analyze_sentiment_batch(texts):
    """
    Analyze sentiment for a list of texts.
    Returns list of { "sentiment_score", "sentiment_label" }.
    """
    return [analyze_sentiment(t) for t in texts]
