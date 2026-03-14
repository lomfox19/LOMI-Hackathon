const express = require('express');
const router = express.Router();
const externalApiController = require('../controllers/externalApiController');
const apiKeyAuth = require('../auth/apiKeyAuth');

// Protected by API key authentication
router.post('/external/analyze-feedback', apiKeyAuth, externalApiController.analyzeFeedback);

module.exports = router;
