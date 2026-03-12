const express = require('express');
const { authenticate } = require('../auth/middleware');
const profileController = require('../controllers/profileController');

const router = express.Router();

// All profile routes are protected by JWT auth
router.get('/profile', authenticate, profileController.getProfile);

module.exports = router;

