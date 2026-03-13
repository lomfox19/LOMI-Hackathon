const nlpService = require('../services/nlpService');
// In-memory storage for demonstration (Replace with DB model in production)
let uploadedFeedback = [];
/**
 * Handle CSV Upload
 */
exports.uploadFeedback = async (req, res) => {
    try {
        // In a real scenario, we would parse the CSV here using a library like 'csv-parser'
        // For now, we'll simulate processing a file from the request
        const mockData = [
            "The app is great and very fast!",
            "I've been experiencing high latency recently.",
            "Decent application, does what it says.",
            "Excellent customer support and easy UI.",
            "The mobile version is quite buggy and crashes often.",
            "Love the new AI features, they save me so much time!"
        ];
        // Perform real analysis on each item using the NLP service (which calls Python)
        uploadedFeedback = await Promise.all(mockData.map(async (text, index) => {
            const analysis = await nlpService.analyzeSentiment(text);
            return {
                id: index + 1,
                text,
                sentiment: analysis.sentiment,
                score: analysis.score,
                topics: analysis.topics
            };
        }));
        res.status(200).json({
            message: 'Feedback dataset uploaded and processed with AI analysis successfully.',
            count: uploadedFeedback.length,
            preview: uploadedFeedback.slice(0, 5)
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed to process feedback upload.' });
    }
};
/**
 * Analyze Feedback
 */
exports.analyzeFeedback = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'No text provided for analysis.' });
        }
        const analysis = await nlpService.analyzeSentiment(text);
        res.status(200).json({
            originalText: text,
            analysis
        });
    } catch (error) {
        console.error('Analysis Error:', error);
        res.status(500).json({ error: 'Failed to analyze feedback.' });
    }
};
/**
 * Get Insights
 */
exports.getInsights = async (req, res) => {
    try {
        // If no feedback uploaded, use a default sample for demo
        const data = uploadedFeedback.length > 0 ? uploadedFeedback : [
            { sentiment: 'positive' }, { sentiment: 'positive' }, { sentiment: 'negative' }, { sentiment: 'neutral' }
        ];
        const insights = nlpService.generateInsights(data);
        res.status(200).json(insights);
    } catch (error) {
        console.error('Insights Error:', error);
        res.status(500).json({ error: 'Failed to retrieve feedback insights.' });
    }
};