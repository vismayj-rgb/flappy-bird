/**
 * User Service
 * Handles user profile and account management
 */

class UserService {
  constructor(apiClient) {
    this.client = apiClient;
  }

  /**
   * Get user profile
   * GET /users/:userId
   */
  async getProfile(userId) {
    return await this.client.get(API_CONFIG.ENDPOINTS.USERS.GET_PROFILE, {
      params: { userId }
    });
  }

  /**
   * Update user profile
   * PUT /users/:userId
   */
  async updateProfile(userId, profileData) {
    return await this.client.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE, profileData, {
      params: { userId }
    });
  }

  /**
   * Delete user account
   * DELETE /users/:userId
   */
  async deleteAccount(userId, password) {
    return await this.client.delete(API_CONFIG.ENDPOINTS.USERS.DELETE_ACCOUNT, {
      params: { userId },
      data: { password }
    });
  }

  /**
   * Get user statistics
   * GET /users/:userId/statistics
   */
  async getStatistics(userId) {
    return await this.client.get(API_CONFIG.ENDPOINTS.USERS.GET_STATISTICS, {
      params: { userId }
    });
  }

  /**
   * Get user achievements
   * GET /users/:userId/achievements
   */
  async getAchievements(userId) {
    return await this.client.get(API_CONFIG.ENDPOINTS.USERS.GET_ACHIEVEMENTS, {
      params: { userId }
    });
  }

  /**
   * Get user inventory
   * GET /users/:userId/inventory
   */
  async getInventory(userId) {
    return await this.client.get(API_CONFIG.ENDPOINTS.USERS.GET_INVENTORY, {
      params: { userId }
    });
  }

  /**
   * Upload user avatar
   * POST /users/:userId/avatar
   */
  async uploadAvatar(userId, avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    return await this.client.post(API_CONFIG.ENDPOINTS.USERS.UPLOAD_AVATAR, formData, {
      params: { userId },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserService;
}
