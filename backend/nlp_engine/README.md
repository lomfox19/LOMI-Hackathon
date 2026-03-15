# Local NLP Engine

Python-based sentiment analysis, topic extraction, keyword extraction, and insight generation. Used as a **fallback** when Groq AI is unavailable or quota is exceeded.

## Install

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

(Optional: NLTK stopwords download automatically on first use.)

## Usage from Node.js

The backend calls this engine via `child_process`: it writes JSON to stdin and reads the result from stdout.

- **Input (stdin):** `{"feedback_list": ["text1", "text2", ...]}`
- **Output (stdout):** Same structure as Groq AI response (sentiment_distribution, top_customer_issues, keywords, etc.). Up to 50 feedback entries are analyzed.

## Modules

- `engine.py` – Entry point; `analyze_feedback(feedback_list)` and CLI (stdin → stdout).
- `sentiment_analyzer.py` – TextBlob sentiment; returns score and label (positive/neutral/negative).
- `topic_extractor.py` – TF-IDF / keyword frequency for discussion topics.
- `keyword_extractor.py` – Top 10 keywords, stopwords removed.
- `insight_generator.py` – Local business insights (top_issue, risk_alert, recommendations).
- `moderation.py` – Optional toxic/abusive detection; sets flag_review for blacklisted terms.
