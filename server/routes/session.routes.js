/**
 * Session Routes
 * Handles game session management endpoints
 */

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/sessions/start
 * @desc    Start new game session
 * @access  Private
 */
router.post('/start', authenticate, sessionController.startSession);

/**
 * @route   POST /api/sessions/end/:sessionId
 * @desc    End game session
 * @access  Private
 */
router.post('/end/:sessionId', authenticate, sessionController.endSession);

/**
 * @route   POST /api/sessions/:sessionId/state
 * @desc    Save game state
 * @access  Private
 */
router.post('/:sessionId/state', authenticate, sessionController.saveState);

/**
 * @route   GET /api/sessions/:sessionId/state
 * @desc    Load game state
 * @access  Private
 */
router.get('/:sessionId/state', authenticate, sessionController.loadState);

/**
 * @route   GET /api/sessions/:userId/history
 * @desc    Get session history
 * @access  Private
 */
router.get('/:userId/history', authenticate, sessionController.getHistory);

/**
 * @route   GET /api/sessions/:userId/active
 * @desc    Get active session
 * @access  Private
 */
router.get('/:userId/active', authenticate, sessionController.getActiveSession);

module.exports = router;
