const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
/**
 * @route   POST /api/feedback/upload
 * @desc    Upload a feedback dataset (CSV)
 * @access  Private (Simplified for now)
 */
router.post('/feedback/upload', feedbackController.uploadFeedback);
/**
 * @route   POST /api/feedback/analyze
 * @desc    Analyze a single piece of feedback
 * @access  Private
 */
router.post('/feedback/analyze', feedbackController.analyzeFeedback);
/**
 * @route   GET /api/feedback/insights
 * @desc    Get aggregated AI insights from uploaded feedback
 * @access  Private
 */
router.get('/feedback/insights', feedbackController.getInsights);

/**
 * @route   GET /api/feedback/analytics
 * @desc    Get processed statistics for the dashboard
 * @access  Private
 */
router.get('/feedback/analytics', feedbackController.getAnalytics);
module.exports = router;