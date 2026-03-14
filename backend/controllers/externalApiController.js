const aiAnalysisService = require('../services/aiAnalysisService');

/**
 * Controller for external business API requests
 */
exports.analyzeFeedback = async (req, res) => {
    try {
        const { reviews } = req.body;

        if (!reviews || !Array.isArray(reviews)) {
            return res.status(400).json({ error: 'reviews array is required in request body' });
        }

        if (reviews.length === 0) {
            return res.status(400).json({ error: 'reviews array cannot be empty' });
        }

        // Limit reviews for this demo
        const limitedReviews = reviews.slice(0, 50);

        const analysis = await aiAnalysisService.analyzeFeedback(limitedReviews);

        res.status(200).json({
            status: 'success',
            project: req.apiKeyData.projectName,
            analysis
        });
    } catch (error) {
        console.error('External API Error:', error);
        res.status(500).json({ error: 'AI analysis failed' });
    }
};
