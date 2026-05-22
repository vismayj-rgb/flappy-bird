/**
 * Leaderboard Service
 * Handles score submission and leaderboard retrieval
 */

class LeaderboardService {
  constructor(apiClient) {
    this.client = apiClient;
  }

  /**
   * Submit a score
   * POST /scores
   */
  async submitScore(scoreData) {
    return await this.client.post(API_CONFIG.ENDPOINTS.LEADERBOARD.SUBMIT_SCORE, {
      score: scoreData.score,
      gameMode: scoreData.gameMode || 'classic',
      difficulty: scoreData.difficulty || 'medium',
      metadata: scoreData.metadata || {}
    });
  }

  /**
   * Get global leaderboard
   * GET /leaderboard/global
   */
  async getGlobalLeaderboard(options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.LEADERBOARD.GET_GLOBAL, {
      query: {
        limit: options.limit || 100,
        offset: options.offset || 0,
        gameMode: options.gameMode,
        difficulty: options.difficulty
      }
    });
  }

  /**
   * Get daily leaderboard
   * GET /leaderboard/daily
   */
  async getDailyLeaderboard(options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.LEADERBOARD.GET_DAILY, {
      query: {
        limit: options.limit || 100,
        offset: options.offset || 0
      }
    });
  }

  /**
   * Get weekly leaderboard
   * GET /leaderboard/weekly
   */
  async getWeeklyLeaderboard(options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.LEADERBOARD.GET_WEEKLY, {
      query: {
        limit: options.limit || 100,
        offset: options.offset || 0
      }
    });
  }

  /**
   * Get monthly leaderboard
   * GET /leaderboard/monthly
   */
  async getMonthlyLeaderboard(options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.LEADERBOARD.GET_MONTHLY, {
      query: {
        limit: options.limit || 100,
        offset: options.offset || 0
      }
    });
  }

  /**
   * Get all-time leaderboard
   * GET /leaderboard/all-time
   */
  async getAllTimeLeaderboard(options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.LEADERBOARD.GET_ALL_TIME, {
      query: {
        limit: options.limit || 100,
        offset: options.offset || 0
      }
    });
  }

  /**
   * Get user's rank
   * GET /leaderboard/rank/:userId
   */
  async getUserRank(userId, period = 'all-time') {
    return await this.client.get(API_CONFIG.ENDPOINTS.LEADERBOARD.GET_USER_RANK, {
      params: { userId },
      query: { period }
    });
  }

  /**
   * Get user's score history
   * GET /scores/:userId/history
   */
  async getScoreHistory(userId, options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.LEADERBOARD.GET_SCORE_HISTORY, {
      params: { userId },
      query: {
        limit: options.limit || 50,
        offset: options.offset || 0,
        startDate: options.startDate,
        endDate: options.endDate
      }
    });
  }

  /**
   * Get nearby scores (scores close to user's rank)
   * GET /leaderboard/nearby/:userId
   */
  async getNearbyScores(userId, range = 10) {
    return await this.client.get(API_CONFIG.ENDPOINTS.LEADERBOARD.GET_NEARBY_SCORES, {
      params: { userId },
      query: { range }
    });
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LeaderboardService;
}
