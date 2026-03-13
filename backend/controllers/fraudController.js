const fraudDetectionService = require('../services/fraudDetectionService');

/**
 * Handle Fraud Detection Requests
 */
exports.analyzeFraud = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text content is required for analysis.' });
        }

        const result = await fraudDetectionService.analyze(text);
        res.status(200).json(result);
    } catch (error) {
        console.error('[Fraud Controller] Error:', error);
        res.status(500).json({ error: 'Fraud analysis failed' });
    }
};
