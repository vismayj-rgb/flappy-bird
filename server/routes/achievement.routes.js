/**
 * Achievement Routes
 * Handles achievement tracking and unlocking endpoints
 */

const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievement.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/achievements
 * @desc    Get all achievements
 * @access  Public
 */
router.get('/', achievementController.getAllAchievements);

/**
 * @route   GET /api/achievements/:userId
 * @desc    Get user achievement progress
 * @access  Private
 */
router.get('/:userId', authenticate, achievementController.getUserProgress);

/**
 * @route   POST /api/achievements/:userId/unlock/:achievementId
 * @desc    Unlock an achievement
 * @access  Private
 */
router.post('/:userId/unlock/:achievementId', authenticate, achievementController.unlockAchievement);

/**
 * @route   GET /api/achievements/categories
 * @desc    Get achievement categories
 * @access  Public
 */
router.get('/categories', achievementController.getCategories);

/**
 * @route   GET /api/achievements/category/:category
 * @desc    Get achievements by category
 * @access  Public
 */
router.get('/category/:category', achievementController.getByCategory);

module.exports = router;
