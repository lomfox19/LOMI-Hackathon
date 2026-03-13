const express = require('express');
const { authenticate } = require('../auth/middleware');
const fraudController = require('../controllers/fraudController');
const spamController = require('../controllers/spamController');
const apiKeyController = require('../controllers/apiKeyController');

const router = express.Router();

/**
 * AI Tool Routes
 */
router.post('/ai/fraud-detection', authenticate, fraudController.analyzeFraud);
router.post('/ai/spam-detection', authenticate, spamController.analyzeSpam);

/**
 * API Key Routes
 */
router.post('/api-key/generate', authenticate, apiKeyController.generateKey);
router.get('/api-key', authenticate, apiKeyController.getKey);
router.delete('/api-key/revoke', authenticate, apiKeyController.revokeKey);

module.exports = router;
