const apiKeyService = require('../services/apiKeyService');

/**
 * Handle API Key Management
 */
exports.generateKey = async (req, res) => {
    try {
        const userId = req.userId; // From authenticate middleware (SVH uses req.userId)
        const { projectName } = req.body;

        if (!projectName) {
            return res.status(400).json({ error: 'Project name is required' });
        }

        const key = await apiKeyService.generateKey(userId, projectName);
        res.status(200).json({ key, projectName });
    } catch (error) {
        console.error('API Key Gen Error:', error);
        res.status(500).json({ error: 'Failed to generate API key' });
    }
};

exports.getKey = async (req, res) => {
    try {
        const userId = req.userId;
        const keyData = await apiKeyService.getKey(userId);
        if (!keyData) {
            return res.status(404).json({ error: 'No API key found' });
        }
        res.status(200).json(keyData);
    } catch (error) {
        console.error('API Key Get Error:', error);
        res.status(500).json({ error: 'Failed to retrieve API key' });
    }
};

exports.revokeKey = async (req, res) => {
    try {
        const userId = req.userId;
        await apiKeyService.revokeKey(userId);
        res.status(200).json({ message: 'API key revoked successfully' });
    } catch (error) {
        console.error('API Key Revoke Error:', error);
        res.status(500).json({ error: 'Failed to revoke API key' });
    }
};
