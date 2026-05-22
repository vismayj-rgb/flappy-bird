/**
 * User Routes
 * Handles user profile and account management endpoints
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

/**
 * @route   GET /api/users/:userId
 * @desc    Get user profile
 * @access  Private
 */
router.get('/:userId', authenticate, userController.getProfile);

/**
 * @route   PUT /api/users/:userId
 * @desc    Update user profile
 * @access  Private
 */
router.put('/:userId', authenticate, userController.updateProfile);

/**
 * @route   DELETE /api/users/:userId
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/:userId', authenticate, userController.deleteAccount);

/**
 * @route   GET /api/users/:userId/statistics
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/:userId/statistics', authenticate, userController.getStatistics);

/**
 * @route   GET /api/users/:userId/achievements
 * @desc    Get user achievements
 * @access  Private
 */
router.get('/:userId/achievements', authenticate, userController.getAchievements);

/**
 * @route   GET /api/users/:userId/inventory
 * @desc    Get user inventory
 * @access  Private
 */
router.get('/:userId/inventory', authenticate, userController.getInventory);

/**
 * @route   POST /api/users/:userId/avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/:userId/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
