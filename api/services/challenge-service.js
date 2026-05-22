/**
 * Challenge Service
 * Handles daily challenges and special events
 */

class ChallengeService {
  constructor(apiClient) {
    this.client = apiClient;
  }

  /**
   * Get today's daily challenge
   * GET /challenges/daily
   */
  async getDailyChallenge() {
    return await this.client.get(API_CONFIG.ENDPOINTS.CHALLENGES.GET_DAILY);
  }

  /**
   * Submit score for a challenge
   * POST /challenges/:challengeId/submit
   */
  async submitChallengeScore(challengeId, score, metadata = {}) {
    return await this.client.post(
      API_CONFIG.ENDPOINTS.CHALLENGES.SUBMIT_SCORE,
      { score, metadata },
      { params: { challengeId } }
    );
  }

  /**
   * Get challenge leaderboard
   * GET /challenges/:challengeId/leaderboard
   */
  async getChallengeLeaderboard(challengeId, options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.CHALLENGES.GET_LEADERBOARD, {
      params: { challengeId },
      query: {
        limit: options.limit || 100,
        offset: options.offset || 0
      }
    });
  }

  /**
   * Get user's challenge progress
   * GET /challenges/:userId/progress
   */
  async getUserProgress(userId) {
    return await this.client.get(API_CONFIG.ENDPOINTS.CHALLENGES.GET_USER_PROGRESS, {
      params: { userId }
    });
  }

  /**
   * Get challenge rewards
   * GET /challenges/:challengeId/rewards
   */
  async getChallengeRewards(challengeId) {
    return await this.client.get(API_CONFIG.ENDPOINTS.CHALLENGES.GET_REWARDS, {
      params: { challengeId }
    });
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChallengeService;
}
