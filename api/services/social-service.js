/**
 * Social Service
 * Handles friends, social interactions, and sharing
 */

class SocialService {
  constructor(apiClient) {
    this.client = apiClient;
  }

  /**
   * Get user's friends list
   * GET /social/friends
   */
  async getFriends() {
    return await this.client.get(API_CONFIG.ENDPOINTS.SOCIAL.GET_FRIENDS);
  }

  /**
   * Send friend request
   * POST /social/friends/request
   */
  async sendFriendRequest(targetUserId) {
    return await this.client.post(API_CONFIG.ENDPOINTS.SOCIAL.SEND_REQUEST, {
      targetUserId
    });
  }

  /**
   * Accept friend request
   * POST /social/friends/accept/:requestId
   */
  async acceptFriendRequest(requestId) {
    return await this.client.post(API_CONFIG.ENDPOINTS.SOCIAL.ACCEPT_REQUEST, null, {
      params: { requestId }
    });
  }

  /**
   * Reject friend request
   * POST /social/friends/reject/:requestId
   */
  async rejectFriendRequest(requestId) {
    return await this.client.post(API_CONFIG.ENDPOINTS.SOCIAL.REJECT_REQUEST, null, {
      params: { requestId }
    });
  }

  /**
   * Remove friend
   * DELETE /social/friends/remove/:friendId
   */
  async removeFriend(friendId) {
    return await this.client.delete(API_CONFIG.ENDPOINTS.SOCIAL.REMOVE_FRIEND, {
      params: { friendId }
    });
  }

  /**
   * Get friends' scores
   * GET /social/friends/scores
   */
  async getFriendScores(options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.SOCIAL.GET_FRIEND_SCORES, {
      query: {
        period: options.period || 'weekly',
        limit: options.limit || 50
      }
    });
  }

  /**
   * Share score on social media
   * POST /social/share
   */
  async shareScore(shareData) {
    return await this.client.post(API_CONFIG.ENDPOINTS.SOCIAL.SHARE_SCORE, {
      platform: shareData.platform,
      score: shareData.score,
      message: shareData.message
    });
  }

  /**
   * Get pending friend requests
   * GET /social/friends/requests/pending
   */
  async getPendingRequests() {
    return await this.client.get(API_CONFIG.ENDPOINTS.SOCIAL.GET_PENDING_REQUESTS);
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SocialService;
}
