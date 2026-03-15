"""
Local NLP engine for Customer Feedback Intelligence.
Performs sentiment analysis, keyword extraction, topic detection, and insight generation.
Designed to be called from Node.js via child_process (JSON stdin -> JSON stdout).
"""
import sys
import json

from sentiment_analyzer import analyze_sentiment_batch
from keyword_extractor import extract_keywords
from topic_extractor import extract_topics
from insight_generator import generate_insights
from moderation import flag_reviews

# Cap for performance (only analyze latest N entries)
MAX_FEEDBACK_ENTRIES = 50


def analyze_feedback(feedback_list):
    """
    Analyze a list of feedback texts locally.
    Returns structure compatible with Groq AI response for dashboard/analytics/AI Insights.

    Returns:
        {
            "sentiment_distribution": { "positive": %, "neutral": %, "negative": % },
            "top_customer_issues": [...],
            "positive_feedback_themes": [...],
            "business_risks": [...],
            "business_recommendations": [...],
            "strategic_insights": [...],
            "summary": str,
            "keywords": [...],
            "flagged_review_indices": [...]  # optional
        }
    """
    if not feedback_list:
        return _empty_response()

    # Limit to latest 50 for performance
    limited = list(feedback_list)[-MAX_FEEDBACK_ENTRIES:]
    texts = [t if isinstance(t, str) else str(t) for t in limited]

    # 1. Sentiment
    sentiment_results = analyze_sentiment_batch(texts)
    n = len(sentiment_results)
    pos = sum(1 for s in sentiment_results if s.get("sentiment_label") == "positive")
    neu = sum(1 for s in sentiment_results if s.get("sentiment_label") == "neutral")
    neg = sum(1 for s in sentiment_results if s.get("sentiment_label") == "negative")
    sentiment_distribution = {
        "positive": round((pos / n) * 100) if n else 0,
        "neutral": round((neu / n) * 100) if n else 0,
        "negative": round((neg / n) * 100) if n else 0,
    }
    # Normalize to sum to 100
    total_pct = sum(sentiment_distribution.values())
    if total_pct != 100 and total_pct > 0:
        diff = 100 - total_pct
        sentiment_distribution["positive"] = max(0, sentiment_distribution["positive"] + diff)

    # 2. Topics (used as top_customer_issues and positive_feedback_themes)
    topics = extract_topics(texts, max_topics=10)
    top_customer_issues = topics[:5]
    positive_feedback_themes = topics[1:4] if len(topics) > 1 else (topics or ["customer experience"])

    # 3. Keywords (top 10)
    keywords = extract_keywords(texts, top_n=10)

    # 4. Moderation: flag toxic/abusive
    flags = flag_reviews(texts)
    flagged_indices = [i for i, f in enumerate(flags) if f]

    # 5. Local insights
    local_insights = generate_insights(sentiment_results, topics, keywords, flagged_indices)

    # 6. Build Groq-compatible response
    business_risks = []
    if local_insights.get("risk_alert"):
        business_risks.append(local_insights["risk_alert"])
    if neg > n * 0.3 and topics:
        business_risks.append(f"Recurring negative feedback on: {topics[0]}.")

    business_recommendations = [local_insights.get("business_recommendation", "Review feedback regularly.")]
    if keywords:
        business_recommendations.append(f"Focus on themes: {', '.join(keywords[:3])}.")

    strategic_insights = [
        "Use local NLP insights when external AI is unavailable.",
        "Prioritize top customer issues for next sprint.",
        "Monitor sentiment trends over time.",
    ]

    summary = (
        f"Local analysis of {n} feedback entries: "
        f"{sentiment_distribution['positive']}% positive, {sentiment_distribution['neutral']}% neutral, "
        f"{sentiment_distribution['negative']}% negative. Top issue: {local_insights.get('top_issue', 'N/A')}. "
    )
    if flagged_indices:
        summary += f" {len(flagged_indices)} review(s) flagged for moderation."

    return {
        "sentiment_distribution": sentiment_distribution,
        "top_customer_issues": top_customer_issues,
        "positive_feedback_themes": positive_feedback_themes,
        "business_risks": business_risks,
        "business_recommendations": business_recommendations,
        "strategic_insights": strategic_insights,
        "summary": summary.strip(),
        "keywords": keywords[:12],
        "flagged_review_indices": flagged_indices,
        "source": "local_nlp",
    }


def _empty_response():
    return {
        "sentiment_distribution": {"positive": 33, "neutral": 34, "negative": 33},
        "top_customer_issues": [],
        "positive_feedback_themes": [],
        "business_risks": [],
        "business_recommendations": [],
        "strategic_insights": [],
        "summary": "No feedback to analyze.",
        "keywords": [],
        "flagged_review_indices": [],
        "source": "local_nlp",
    }


def main():
    """Read JSON from stdin, run analyze_feedback, print JSON to stdout."""
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
        feedback_list = payload.get("feedback_list", [])
        result = analyze_feedback(feedback_list)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e), "source": "local_nlp"}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
