/**
 * Social Routes
 * Handles social features and friend management endpoints
 */

const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/social/friends
 * @desc    Get friends list
 * @access  Private
 */
router.get('/friends', authenticate, socialController.getFriends);

/**
 * @route   POST /api/social/friends/request
 * @desc    Send friend request
 * @access  Private
 */
router.post('/friends/request', authenticate, socialController.sendFriendRequest);

/**
 * @route   POST /api/social/friends/accept/:requestId
 * @desc    Accept friend request
 * @access  Private
 */
router.post('/friends/accept/:requestId', authenticate, socialController.acceptFriendRequest);

/**
 * @route   POST /api/social/friends/reject/:requestId
 * @desc    Reject friend request
 * @access  Private
 */
router.post('/friends/reject/:requestId', authenticate, socialController.rejectFriendRequest);

/**
 * @route   DELETE /api/social/friends/remove/:friendId
 * @desc    Remove friend
 * @access  Private
 */
router.delete('/friends/remove/:friendId', authenticate, socialController.removeFriend);

/**
 * @route   GET /api/social/friends/scores
 * @desc    Get friends' scores
 * @access  Private
 */
router.get('/friends/scores', authenticate, socialController.getFriendScores);

/**
 * @route   POST /api/social/share
 * @desc    Share score on social media
 * @access  Private
 */
router.post('/share', authenticate, socialController.shareScore);

/**
 * @route   GET /api/social/friends/requests/pending
 * @desc    Get pending friend requests
 * @access  Private
 */
router.get('/friends/requests/pending', authenticate, socialController.getPendingRequests);

module.exports = router;
