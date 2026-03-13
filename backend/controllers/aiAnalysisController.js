const aiAnalysisService = require('../services/aiAnalysisService');

/**
 * Handle AI Feedback Analysis Requests
 */
exports.analyzeFeedback = async (req, res) => {
    try {
        const { feedback } = req.body;
        
        if (!feedback || !Array.isArray(feedback)) {
            return res.status(400).json({ error: 'Feedback list is required as an array.' });
        }

        const insights = await aiAnalysisService.analyzeFeedback(feedback);
        res.status(200).json(insights);
    } catch (error) {
        console.error('[AI Analysis Controller] Error:', error);
        res.status(500).json({ error: 'AI analysis failed' });
    }
};
