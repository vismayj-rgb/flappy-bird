/**
 * Settings Service
 * Handles user preferences and game settings
 */

class SettingsService {
  constructor(apiClient) {
    this.client = apiClient;
  }

  /**
   * Get user settings
   * GET /settings/:userId
   */
  async getSettings(userId) {
    return await this.client.get(API_CONFIG.ENDPOINTS.SETTINGS.GET, {
      params: { userId }
    });
  }

  /**
   * Update user settings
   * PUT /settings/:userId
   */
  async updateSettings(userId, settings) {
    return await this.client.put(API_CONFIG.ENDPOINTS.SETTINGS.UPDATE, settings, {
      params: { userId }
    });
  }

  /**
   * Reset settings to defaults
   * POST /settings/:userId/reset
   */
  async resetSettings(userId) {
    return await this.client.post(API_CONFIG.ENDPOINTS.SETTINGS.RESET, null, {
      params: { userId }
    });
  }

  /**
   * Get default settings
   * GET /settings/defaults
   */
  async getDefaultSettings() {
    return await this.client.get(API_CONFIG.ENDPOINTS.SETTINGS.GET_DEFAULTS);
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsService;
}
