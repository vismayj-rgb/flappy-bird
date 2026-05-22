/**
 * Achievement Service
 * Handles achievement tracking and unlocking
 */

class AchievementService {
  constructor(apiClient) {
    this.client = apiClient;
  }

  /**
   * Get all available achievements
   * GET /achievements
   */
  async getAllAchievements() {
    return await this.client.get(API_CONFIG.ENDPOINTS.ACHIEVEMENTS.GET_ALL);
  }

  /**
   * Get user's achievement progress
   * GET /achievements/:userId
   */
  async getUserProgress(userId) {
    return await this.client.get(API_CONFIG.ENDPOINTS.ACHIEVEMENTS.GET_USER_PROGRESS, {
      params: { userId }
    });
  }

  /**
   * Unlock an achievement
   * POST /achievements/:userId/unlock/:achievementId
   */
  async unlockAchievement(userId, achievementId, metadata = {}) {
    return await this.client.post(
      API_CONFIG.ENDPOINTS.ACHIEVEMENTS.UNLOCK,
      { metadata },
      {
        params: { userId, achievementId }
      }
    );
  }

  /**
   * Get achievement categories
   * GET /achievements/categories
   */
  async getCategories() {
    return await this.client.get(API_CONFIG.ENDPOINTS.ACHIEVEMENTS.GET_CATEGORIES);
  }

  /**
   * Get achievements by category
   * GET /achievements/category/:category
   */
  async getByCategory(category) {
    return await this.client.get(API_CONFIG.ENDPOINTS.ACHIEVEMENTS.GET_BY_CATEGORY, {
      params: { category }
    });
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AchievementService;
}
