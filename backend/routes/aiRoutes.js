const express = require('express');
const { authenticate } = require('../auth/middleware');
const aiController = require('../controllers/aiController');

const router = express.Router();

// Core AI chat endpoint used by the chatbot module
router.post('/chat', authenticate, aiController.handleChat);

module.exports = router;

