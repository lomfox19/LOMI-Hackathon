"""
Optional detection for toxic or abusive reviews.
Uses a simple keyword blacklist and sentiment threshold.
Sets flag_review=True when feedback may be offensive.
"""
import re

# Simple blacklist of offensive/toxic keywords (subset; extend as needed)
TOXIC_BLACKLIST = {
    "abuse", "abusive", "hate", "hateful", "offensive", "racist", "sexist",
    "violent", "threat", "threaten", "harass", "harassment", "insult",
    "insulting", "curse", "cursing", "profanity", "obscene", "inappropriate",
}


def is_flagged(text, blacklist=None):
    """
    Returns True if feedback contains likely toxic/abusive language.
    Uses keyword blacklist; can be extended with sentiment threshold.
    """
    if not text or not isinstance(text, str):
        return False
    blacklist = blacklist or TOXIC_BLACKLIST
    tokens = set(re.findall(r"\b[a-zA-Z]+\b", text.lower()))
    return bool(tokens & blacklist)


def flag_reviews(feedback_list, blacklist=None):
    """
    For each feedback string, determine if it should be flagged.
    Returns list of booleans (True = flag_review).
    """
    return [is_flagged(t, blacklist) for t in feedback_list]
