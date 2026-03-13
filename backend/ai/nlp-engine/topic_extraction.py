import spacy

# Load small English model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # Fallback if model not found
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

def extract_topics(text):
    doc = nlp(text)
    
    # Simple topic extraction based on nouns and noun phrases
    topics = []
    for chunk in doc.noun_chunks:
        if len(chunk.text) > 3:
            topics.append(chunk.text.lower())
    
    # Get most common nouns as keywords
    keywords = [token.text.lower() for token in doc if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop]
    
    return {
        "topics": list(set(topics))[:3],
        "keywords": list(set(keywords))[:5]
    }
