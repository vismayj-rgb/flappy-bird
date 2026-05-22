/**
 * Store Service
 * Handles in-game store, purchases, and customization
 */

class StoreService {
  constructor(apiClient) {
    this.client = apiClient;
  }

  /**
   * Get all store items
   * GET /store/items
   */
  async getItems(options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.STORE.GET_ITEMS, {
      query: {
        category: options.category,
        limit: options.limit || 50,
        offset: options.offset || 0
      }
    });
  }

  /**
   * Get store categories
   * GET /store/categories
   */
  async getCategories() {
    return await this.client.get(API_CONFIG.ENDPOINTS.STORE.GET_CATEGORIES);
  }

  /**
   * Purchase an item
   * POST /store/purchase
   */
  async purchaseItem(itemId, paymentMethod = 'coins') {
    return await this.client.post(API_CONFIG.ENDPOINTS.STORE.PURCHASE, {
      itemId,
      paymentMethod
    });
  }

  /**
   * Get available skins
   * GET /store/skins
   */
  async getSkins() {
    return await this.client.get(API_CONFIG.ENDPOINTS.STORE.GET_SKINS);
  }

  /**
   * Get available themes
   * GET /store/themes
   */
  async getThemes() {
    return await this.client.get(API_CONFIG.ENDPOINTS.STORE.GET_THEMES);
  }

  /**
   * Equip an item
   * POST /store/equip/:itemId
   */
  async equipItem(itemId) {
    return await this.client.post(API_CONFIG.ENDPOINTS.STORE.EQUIP_ITEM, null, {
      params: { itemId }
    });
  }

  /**
   * Get featured items
   * GET /store/featured
   */
  async getFeaturedItems() {
    return await this.client.get(API_CONFIG.ENDPOINTS.STORE.GET_FEATURED);
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StoreService;
}
