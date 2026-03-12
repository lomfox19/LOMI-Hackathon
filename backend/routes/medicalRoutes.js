const express = require('express');
const { authenticate } = require('../auth/middleware');
const medicalController = require('../controllers/medicalController');

const router = express.Router();

// Medical symptom analysis endpoint
router.post('/medical/analyze', authenticate, medicalController.analyzeSymptoms);

module.exports = router;

