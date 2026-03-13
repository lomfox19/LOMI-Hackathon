const crypto = require('crypto');

/**
 * API Key Service
 * Manages master credentials for Intelligence Web Services.
 * Using in-memory storage to adhere to "No database schema modification" rule.
 */
class ApiKeyService {
    constructor() {
        this.keys = new Map();
    }

    async generateKey(userId) {
        // Revoke existing key if any (one key per user for this demo)
        this.revokeKey(userId);

        const key = 'sk_live_' + crypto.randomBytes(16).toString('hex');
        this.keys.set(userId, {
            key,
            createdAt: new Date(),
            userId
        });
        return key;
    }

    getKey(userId) {
        return this.keys.get(userId);
    }

    revokeKey(userId) {
        return this.keys.delete(userId);
    }
}

module.exports = new ApiKeyService();
