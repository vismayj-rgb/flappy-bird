/**
 * Analytics Service
 * Handles game analytics and statistics tracking
 */

class AnalyticsService {
  constructor(apiClient) {
    this.client = apiClient;
  }

  /**
   * Track a game event
   * POST /analytics/event
   */
  async trackEvent(eventData) {
    return await this.client.post(API_CONFIG.ENDPOINTS.ANALYTICS.TRACK_EVENT, {
      eventType: eventData.type,
      eventData: eventData.data,
      timestamp: eventData.timestamp || Date.now()
    });
  }

  /**
   * Get player analytics
   * GET /analytics/player/:userId
   */
  async getPlayerStats(userId, options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.ANALYTICS.GET_PLAYER_STATS, {
      params: { userId },
      query: {
        period: options.period || 'week',
        metrics: options.metrics
      }
    });
  }

  /**
   * Get game statistics
   * GET /analytics/game
   */
  async getGameStats(options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.ANALYTICS.GET_GAME_STATS, {
      query: {
        period: options.period || 'week'
      }
    });
  }

  /**
   * Get performance metrics
   * GET /analytics/performance/:userId
   */
  async getPerformanceMetrics(userId, options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.ANALYTICS.GET_PERFORMANCE, {
      params: { userId },
      query: {
        startDate: options.startDate,
        endDate: options.endDate
      }
    });
  }

  /**
   * Get trends analysis
   * GET /analytics/trends
   */
  async getTrends(options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.ANALYTICS.GET_TRENDS, {
      query: {
        metric: options.metric || 'score',
        period: options.period || 'month'
      }
    });
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsService;
}
