const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');

/**
 * API Key Service
 * Manages credentials for businesses to access AI Intelligence Platform.
 */
class ApiKeyService {
    async generateKey(userId, projectName) {
        // Revoke existing key if any (one key per user for this demo)
        await this.revokeKey(userId);

        console.log("Generating API key for project:", projectName);
        const key = crypto.randomBytes(32).toString('hex');
        
        const newKey = await ApiKey.create({
            apiKey: key,
            projectName,
            createdBy: userId,
            createdAt: new Date()
        });

        return key;
    }

    async getKey(userId) {
        const keyData = await ApiKey.findOne({ createdBy: userId });
        if (!keyData) return null;
        return {
            key: keyData.apiKey,
            projectName: keyData.projectName,
            createdAt: keyData.createdAt
        };
    }

    async revokeKey(userId) {
        return await ApiKey.deleteOne({ createdBy: userId });
    }

    async validateKey(apiKey) {
        const keyEntry = await ApiKey.findOne({ apiKey });
        if (keyEntry) {
            console.log("API key validated for external request");
            return keyEntry;
        }
        return null;
    }
}

module.exports = new ApiKeyService();
