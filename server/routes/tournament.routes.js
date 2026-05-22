/**
 * Tournament Routes
 * Handles tournament and competitive play endpoints
 */

const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/tournaments/active
 * @desc    Get active tournaments
 * @access  Public
 */
router.get('/active', tournamentController.getActiveTournaments);

/**
 * @route   GET /api/tournaments/upcoming
 * @desc    Get upcoming tournaments
 * @access  Public
 */
router.get('/upcoming', tournamentController.getUpcomingTournaments);

/**
 * @route   POST /api/tournaments/:tournamentId/join
 * @desc    Join a tournament
 * @access  Private
 */
router.post('/:tournamentId/join', authenticate, tournamentController.joinTournament);

/**
 * @route   POST /api/tournaments/:tournamentId/submit
 * @desc    Submit tournament score
 * @access  Private
 */
router.post('/:tournamentId/submit', authenticate, tournamentController.submitScore);

/**
 * @route   GET /api/tournaments/:tournamentId/leaderboard
 * @desc    Get tournament leaderboard
 * @access  Public
 */
router.get('/:tournamentId/leaderboard', tournamentController.getLeaderboard);

/**
 * @route   GET /api/tournaments/:userId/history
 * @desc    Get user tournament history
 * @access  Private
 */
router.get('/:userId/history', authenticate, tournamentController.getUserTournaments);

module.exports = router;
