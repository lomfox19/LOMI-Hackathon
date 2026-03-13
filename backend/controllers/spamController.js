const spamDetectionService = require('../services/spamDetectionService');

/**
 * Handle Spam Detection Requests
 */
exports.analyzeSpam = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text content is required for analysis.' });
        }

        const result = await spamDetectionService.analyze(text);
        res.status(200).json(result);
    } catch (error) {
        console.error('[Spam Controller] Error:', error);
        res.status(500).json({ error: 'Spam analysis failed' });
    }
};
