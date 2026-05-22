/**
 * Challenge Routes
 * Handles daily challenges and events endpoints
 */

const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challenge.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/challenges/daily
 * @desc    Get daily challenge
 * @access  Public
 */
router.get('/daily', challengeController.getDailyChallenge);

/**
 * @route   POST /api/challenges/:challengeId/submit
 * @desc    Submit challenge score
 * @access  Private
 */
router.post('/:challengeId/submit', authenticate, challengeController.submitScore);

/**
 * @route   GET /api/challenges/:challengeId/leaderboard
 * @desc    Get challenge leaderboard
 * @access  Public
 */
router.get('/:challengeId/leaderboard', challengeController.getLeaderboard);

/**
 * @route   GET /api/challenges/:userId/progress
 * @desc    Get user challenge progress
 * @access  Private
 */
router.get('/:userId/progress', authenticate, challengeController.getUserProgress);

/**
 * @route   GET /api/challenges/:challengeId/rewards
 * @desc    Get challenge rewards
 * @access  Public
 */
router.get('/:challengeId/rewards', challengeController.getRewards);

module.exports = router;
