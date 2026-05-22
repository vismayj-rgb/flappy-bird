/**
 * Power-up Service
 * Handles power-ups, boosts, and special abilities
 */

class PowerupService {
  constructor(apiClient) {
    this.client = apiClient;
  }

  /**
   * Get available power-ups
   * GET /powerups
   */
  async getAvailablePowerups() {
    return await this.client.get(API_CONFIG.ENDPOINTS.POWERUPS.GET_AVAILABLE);
  }

  /**
   * Activate a power-up
   * POST /powerups/activate/:powerupId
   */
  async activatePowerup(powerupId) {
    return await this.client.post(API_CONFIG.ENDPOINTS.POWERUPS.ACTIVATE, null, {
      params: { powerupId }
    });
  }

  /**
   * Purchase a power-up
   * POST /powerups/purchase/:powerupId
   */
  async purchasePowerup(powerupId, quantity = 1) {
    return await this.client.post(
      API_CONFIG.ENDPOINTS.POWERUPS.PURCHASE,
      { quantity },
      { params: { powerupId } }
    );
  }

  /**
   * Get active power-ups
   * GET /powerups/:userId/active
   */
  async getActivePowerups(userId) {
    return await this.client.get(API_CONFIG.ENDPOINTS.POWERUPS.GET_ACTIVE, {
      params: { userId }
    });
  }

  /**
   * Get power-up inventory
   * GET /powerups/:userId/inventory
   */
  async getPowerupInventory(userId) {
    return await this.client.get(API_CONFIG.ENDPOINTS.POWERUPS.GET_INVENTORY, {
      params: { userId }
    });
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PowerupService;
}
