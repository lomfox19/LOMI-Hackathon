import sys
import json
from sentiment_analysis import analyze_sentiment
from topic_extraction import extract_topics
from insight_generation import generate_insight

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No text provided"}))
        return
        
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
