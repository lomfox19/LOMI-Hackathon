const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const { authenticate } = require('../auth/middleware');

// All routes here are protected by user authentication
router.post('/api-key/generate', authenticate, apiKeyController.generateKey);
router.get('/api-key', authenticate, apiKeyController.getKey);
router.delete('/api-key/revoke', authenticate, apiKeyController.revokeKey);

module.exports = router;
