import sys
import json
from sentiment_analyzer import analyze_sentiment
from topicextraction import extract_topics
from insight_generation import generate_insight

def main():
    if len(sys.argv) < 2:
        sample_feedback = [
            "The product quality is excellent",
            "Customer support is terrible",
            "Delivery was slow"
        ]
        text = " ".join(sample_feedback)
    else:
        text = " ".join(sys.argv[1:])
    
    try:
        # Perform analyses
        sentiment = analyze_sentiment(text)
        topics_result = extract_topics(text)
        topics = topics_result["topics"]
        keywords = topics_result["keywords"]
        
        # Build composite output
        result = {
            "status": "success",
            "analysis": {
                "sentiment": {
                    "score": sentiment["score"],
                    "label": sentiment["label"]
                },
                "topics": topics,
                "keywords": keywords,
                "insights": generate_insight(sentiment, topics)
            }
        }
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))

if __name__ == "__main__":
    main()
