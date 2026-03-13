from textblob import TextBlob

def analyze_sentiment(text):
    blob = TextBlob(text)
    score = blob.sentiment.polarity
    
    if score > 0.1:
        label = "positive"
    elif score < -0.1:
        label = "negative"
    else:
        label = "neutral"
        
    return {
        "score": (score + 1) / 2, # Normalize to 0.0 - 1.0
        "label": label
    }
