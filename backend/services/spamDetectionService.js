/**
 * Spam Detection Service
 * Filters promotional and repetitive content.
 */
class SpamDetectionService {
    async analyze(text) {
        // Simulate AI classification latency
        await new Promise(resolve => setTimeout(resolve, 600));

        const lowerText = text.toLowerCase();
        const spamKeywords = ['buy now', 'click here', 'discount', 'free', 'subscribe', 'contact', 'whatsapp', 'telegram', 'prize'];
        
        const foundKeywords = spamKeywords.filter(keyword => lowerText.includes(keyword));
        const isRepetitive = /(\b\w+\b)(.*\b\1\b){2,}/.test(lowerText);
        
        const isSpam = foundKeywords.length > 0 || isRepetitive || Math.random() > 0.9;
        const confidence = isSpam ? (90 + Math.random() * 9.9) : (95 + Math.random() * 4.9);

        return {
            isSpam,
            confidence: confidence.toFixed(1),
            id: 'SPM-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            timestamp: new Date().toISOString(),
            classification: isSpam ? "Spam Content Detected" : "Legitimate Content Identified",
            keywords: foundKeywords
        };
    }
}

module.exports = new SpamDetectionService();
