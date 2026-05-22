/**
 * Settings Routes
 * Handles user settings and preferences endpoints
 */

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/settings/:userId
 * @desc    Get user settings
 * @access  Private
 */
router.get('/:userId', authenticate, settingsController.getSettings);

/**
 * @route   PUT /api/settings/:userId
 * @desc    Update user settings
 * @access  Private
 */
router.put('/:userId', authenticate, settingsController.updateSettings);

/**
 * @route   POST /api/settings/:userId/reset
 * @desc    Reset settings to defaults
 * @access  Private
 */
router.post('/:userId/reset', authenticate, settingsController.resetSettings);

/**
 * @route   GET /api/settings/defaults
 * @desc    Get default settings
 * @access  Public
 */
router.get('/defaults', settingsController.getDefaultSettings);

module.exports = router;
