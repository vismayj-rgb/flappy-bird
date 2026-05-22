/**
 * Analytics Routes
 * Handles analytics and statistics endpoints
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/analytics/event
 * @desc    Track game event
 * @access  Private
 */
router.post('/event', authenticate, analyticsController.trackEvent);

/**
 * @route   GET /api/analytics/player/:userId
 * @desc    Get player analytics
 * @access  Private
 */
router.get('/player/:userId', authenticate, analyticsController.getPlayerStats);

/**
 * @route   GET /api/analytics/game
 * @desc    Get game statistics
 * @access  Public
 */
router.get('/game', analyticsController.getGameStats);

/**
 * @route   GET /api/analytics/performance/:userId
 * @desc    Get performance metrics
 * @access  Private
 */
router.get('/performance/:userId', authenticate, analyticsController.getPerformanceMetrics);

/**
 * @route   GET /api/analytics/trends
 * @desc    Get trends analysis
 * @access  Public
 */
router.get('/trends', analyticsController.getTrends);

module.exports = router;
