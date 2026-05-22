/**
 * Store Routes
 * Handles store and customization endpoints
 */

const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/store/items
 * @desc    Get all store items
 * @access  Public
 */
router.get('/items', storeController.getItems);

/**
 * @route   GET /api/store/categories
 * @desc    Get store categories
 * @access  Public
 */
router.get('/categories', storeController.getCategories);

/**
 * @route   POST /api/store/purchase
 * @desc    Purchase an item
 * @access  Private
 */
router.post('/purchase', authenticate, storeController.purchaseItem);

/**
 * @route   GET /api/store/skins
 * @desc    Get available skins
 * @access  Public
 */
router.get('/skins', storeController.getSkins);

/**
 * @route   GET /api/store/themes
 * @desc    Get available themes
 * @access  Public
 */
router.get('/themes', storeController.getThemes);

/**
 * @route   POST /api/store/equip/:itemId
 * @desc    Equip an item
 * @access  Private
 */
router.post('/equip/:itemId', authenticate, storeController.equipItem);

/**
 * @route   GET /api/store/featured
 * @desc    Get featured items
 * @access  Public
 */
router.get('/featured', storeController.getFeaturedItems);

module.exports = router;
