const express = require('express');
const { authenticate } = require('../auth/middleware');
const fraudController = require('../controllers/fraudController');
const spamController = require('../controllers/spamController');
const apiKeyController = require('../controllers/apiKeyController');
const aiAnalysisController = require('../controllers/aiAnalysisController');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

/**
 * AI Tool Routes
 */
router.post('/ai/fraud-detection', authenticate, fraudController.analyzeFraud);
router.post('/ai/spam-detection', authenticate, spamController.analyzeSpam);
router.post('/ai/analyze-feedback', authenticate, aiAnalysisController.analyzeFeedback);
router.post('/ai/generate-insight-report', authenticate, feedbackController.generateInsightReport);

/**
 * Diagnostic Route: Test Gemini API
 */
router.post('/api-key/generate', authenticate, apiKeyController.generateKey);
router.get('/api-key', authenticate, apiKeyController.getKey);
router.delete('/api-key/revoke', authenticate, apiKeyController.revokeKey);

module.exports = router;
