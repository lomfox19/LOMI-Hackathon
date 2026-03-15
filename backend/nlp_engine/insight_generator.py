"""
Generate simple AI-like insights locally from sentiment, topics, and keywords.
Returns structure compatible with dashboard/analytics.
"""
from sentiment_analyzer import analyze_sentiment_batch


def generate_insights(sentiment_results, topics, keywords, flagged_indices=None):
    """
    Build insight object for frontend compatibility.
    sentiment_results: list of { sentiment_label, sentiment_score }
    topics: list of topic strings
    keywords: list of keyword strings
    flagged_indices: optional list of indices where feedback was flagged (toxic/abusive)
    """
    n = len(sentiment_results) or 1
    pos = sum(1 for s in sentiment_results if s.get("sentiment_label") == "positive")
    neu = sum(1 for s in sentiment_results if s.get("sentiment_label") == "neutral")
    neg = sum(1 for s in sentiment_results if s.get("sentiment_label") == "negative")

    top_issue = topics[0] if topics else "general feedback"
    positive_theme = topics[1] if len(topics) > 1 else "customer experience"
    if neg > pos and neg > neu:
        risk_alert = f"Increase in negative feedback about {top_issue}. Consider immediate review."
    else:
        risk_alert = f"Sentiment is balanced; monitor {top_issue} for changes."

    # Business recommendation based on dominant sentiment
    if neg >= n * 0.3 and topics:
        business_recommendation = f"Improve logistics and service quality around {top_issue}."
    elif pos >= n * 0.5:
        business_recommendation = "Maintain quality and consider promoting positive themes."
    else:
        business_recommendation = "Continue monitoring feedback and address top issues proactively."

    return {
        "top_issue": top_issue,
        "positive_theme": positive_theme,
        "risk_alert": risk_alert,
        "business_recommendation": business_recommendation,
        "flagged_count": len(flagged_indices) if flagged_indices else 0,
    }
