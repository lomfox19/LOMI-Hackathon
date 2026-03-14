const apiKeyService = require('../services/apiKeyService');

/**
 * Middleware to authenticate external API requests using API keys.
 */
const apiKeyAuth = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: 'API key is missing in x-api-key header' });
    }

    try {
        const keyData = await apiKeyService.validateKey(apiKey);
        if (!keyData) {
            return res.status(401).json({ error: 'Invalid or revoked API key' });
        }

        // Attach user info to request if needed
        req.apiKeyData = keyData;
        req.userId = keyData.createdBy;
        
        next();
    } catch (error) {
        console.error('API Key Auth Error:', error);
        res.status(500).json({ error: 'Internal server error during key validation' });
    }
};

module.exports = apiKeyAuth;
