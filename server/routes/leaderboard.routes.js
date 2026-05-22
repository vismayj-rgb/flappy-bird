/**
 * Leaderboard Routes
 * Handles leaderboard and score management endpoints
 */

const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/scores
 * @desc    Submit a score
 * @access  Private
 */
router.post('/', authenticate, leaderboardController.submitScore);

/**
 * @route   GET /api/leaderboard/global
 * @desc    Get global leaderboard
 * @access  Public
 */
router.get('/global', leaderboardController.getGlobalLeaderboard);

/**
 * @route   GET /api/leaderboard/daily
 * @desc    Get daily leaderboard
 * @access  Public
 */
router.get('/daily', leaderboardController.getDailyLeaderboard);

/**
 * @route   GET /api/leaderboard/weekly
 * @desc    Get weekly leaderboard
 * @access  Public
 */
router.get('/weekly', leaderboardController.getWeeklyLeaderboard);

/**
 * @route   GET /api/leaderboard/monthly
 * @desc    Get monthly leaderboard
 * @access  Public
 */
router.get('/monthly', leaderboardController.getMonthlyLeaderboard);

/**
 * @route   GET /api/leaderboard/all-time
 * @desc    Get all-time leaderboard
 * @access  Public
 */
router.get('/all-time', leaderboardController.getAllTimeLeaderboard);

/**
 * @route   GET /api/leaderboard/rank/:userId
 * @desc    Get user rank
 * @access  Public
 */
router.get('/rank/:userId', leaderboardController.getUserRank);

/**
 * @route   GET /api/scores/:userId/history
 * @desc    Get user score history
 * @access  Private
 */
router.get('/:userId/history', authenticate, leaderboardController.getScoreHistory);

/**
 * @route   GET /api/leaderboard/nearby/:userId
 * @desc    Get nearby scores
 * @access  Private
 */
router.get('/nearby/:userId', authenticate, leaderboardController.getNearbyScores);

module.exports = router;
