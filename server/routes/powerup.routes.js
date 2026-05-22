/**
 * Powerup Routes
 * Handles power-ups and boosts endpoints
 */

const express = require('express');
const router = express.Router();
const powerupController = require('../controllers/powerup.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/powerups
 * @desc    Get available power-ups
 * @access  Public
 */
router.get('/', powerupController.getAvailablePowerups);

/**
 * @route   POST /api/powerups/activate/:powerupId
 * @desc    Activate a power-up
 * @access  Private
 */
router.post('/activate/:powerupId', authenticate, powerupController.activatePowerup);

/**
 * @route   POST /api/powerups/purchase/:powerupId
 * @desc    Purchase a power-up
 * @access  Private
 */
router.post('/purchase/:powerupId', authenticate, powerupController.purchasePowerup);

/**
 * @route   GET /api/powerups/:userId/active
 * @desc    Get active power-ups
 * @access  Private
 */
router.get('/:userId/active', authenticate, powerupController.getActivePowerups);

/**
 * @route   GET /api/powerups/:userId/inventory
 * @desc    Get power-up inventory
 * @access  Private
 */
router.get('/:userId/inventory', authenticate, powerupController.getPowerupInventory);

module.exports = router;
