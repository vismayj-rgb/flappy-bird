/**
 * Notification Service
 * Handles in-game notifications and alerts
 */

class NotificationService {
  constructor(apiClient) {
    this.client = apiClient;
  }

  /**
   * Get all notifications
   * GET /notifications/:userId
   */
  async getNotifications(userId, options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.GET_ALL, {
      params: { userId },
      query: {
        limit: options.limit || 50,
        offset: options.offset || 0,
        unreadOnly: options.unreadOnly || false
      }
    });
  }

  /**
   * Mark notification as read
   * PUT /notifications/:notificationId/read
   */
  async markAsRead(notificationId) {
    return await this.client.put(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ, null, {
      params: { notificationId }
    });
  }

  /**
   * Mark all notifications as read
   * PUT /notifications/:userId/read-all
   */
  async markAllAsRead(userId) {
    return await this.client.put(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, null, {
      params: { userId }
    });
  }

  /**
   * Delete notification
   * DELETE /notifications/:notificationId
   */
  async deleteNotification(notificationId) {
    return await this.client.delete(API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE, {
      params: { notificationId }
    });
  }

  /**
   * Get unread notification count
   * GET /notifications/:userId/unread-count
   */
  async getUnreadCount(userId) {
    return await this.client.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.GET_UNREAD_COUNT, {
      params: { userId }
    });
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationService;
}
