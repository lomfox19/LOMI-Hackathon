const apiKeyService = require('../services/apiKeyService');

/**
 * Handle API Key Management
 */
exports.generateKey = async (req, res) => {
    try {
        const userId = req.user.id; // From authenticate middleware
        const key = await apiKeyService.generateKey(userId);
        res.status(200).json({ key });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate API key' });
    }
};

exports.getKey = async (req, res) => {
    try {
        const userId = req.user.id;
        const keyData = apiKeyService.getKey(userId);
        if (!keyData) {
            return res.status(404).json({ error: 'No API key found' });
        }
        res.status(200).json(keyData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve API key' });
    }
};

exports.revokeKey = async (req, res) => {
    try {
        const userId = req.user.id;
        const success = apiKeyService.revokeKey(userId);
        res.status(200).json({ message: 'API key revoked successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke API key' });
    }
};
