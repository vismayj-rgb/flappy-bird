/**
 * Session Service
 * Handles game session management and state persistence
 */

class SessionService {
  constructor(apiClient) {
    this.client = apiClient;
  }

  /**
   * Start a new game session
   * POST /sessions/start
   */
  async startSession(sessionData = {}) {
    return await this.client.post(API_CONFIG.ENDPOINTS.SESSIONS.START, {
      gameMode: sessionData.gameMode || 'classic',
      difficulty: sessionData.difficulty || 'medium',
      device: sessionData.device || this.getDeviceInfo()
    });
  }

  /**
   * End game session
   * POST /sessions/end/:sessionId
   */
  async endSession(sessionId, sessionResults) {
    return await this.client.post(API_CONFIG.ENDPOINTS.SESSIONS.END, sessionResults, {
      params: { sessionId }
    });
  }

  /**
   * Save game state
   * POST /sessions/:sessionId/state
   */
  async saveState(sessionId, gameState) {
    return await this.client.post(API_CONFIG.ENDPOINTS.SESSIONS.SAVE_STATE, {
      state: gameState,
      timestamp: Date.now()
    }, {
      params: { sessionId }
    });
  }

  /**
   * Load game state
   * GET /sessions/:sessionId/state
   */
  async loadState(sessionId) {
    return await this.client.get(API_CONFIG.ENDPOINTS.SESSIONS.LOAD_STATE, {
      params: { sessionId }
    });
  }

  /**
   * Get session history
   * GET /sessions/:userId/history
   */
  async getHistory(userId, options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.SESSIONS.GET_HISTORY, {
      params: { userId },
      query: {
        limit: options.limit || 20,
        offset: options.offset || 0,
        startDate: options.startDate,
        endDate: options.endDate
      }
    });
  }

  /**
   * Get active session
   * GET /sessions/:userId/active
   */
  async getActiveSession(userId) {
    return await this.client.get(API_CONFIG.ENDPOINTS.SESSIONS.GET_ACTIVE, {
      params: { userId }
    });
  }

  /**
   * Get device information
   */
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    };
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionService;
}
