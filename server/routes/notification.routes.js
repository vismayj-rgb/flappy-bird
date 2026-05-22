/**
 * Notification Routes
 * Handles notification management endpoints
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/notifications/:userId
 * @desc    Get all notifications
 * @access  Private
 */
router.get('/:userId', authenticate, notificationController.getNotifications);

/**
 * @route   PUT /api/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:notificationId/read', authenticate, notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/:userId/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/:userId/read-all', authenticate, notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:notificationId', authenticate, notificationController.deleteNotification);

/**
 * @route   GET /api/notifications/:userId/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/:userId/unread-count', authenticate, notificationController.getUnreadCount);

module.exports = router;
