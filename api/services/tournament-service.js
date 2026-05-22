/**
 * Tournament Service
 * Handles competitive tournaments and events
 */

class TournamentService {
  constructor(apiClient) {
    this.client = apiClient;
  }

  /**
   * Get active tournaments
   * GET /tournaments/active
   */
  async getActiveTournaments() {
    return await this.client.get(API_CONFIG.ENDPOINTS.TOURNAMENT.GET_ACTIVE);
  }

  /**
   * Get upcoming tournaments
   * GET /tournaments/upcoming
   */
  async getUpcomingTournaments() {
    return await this.client.get(API_CONFIG.ENDPOINTS.TOURNAMENT.GET_UPCOMING);
  }

  /**
   * Join a tournament
   * POST /tournaments/:tournamentId/join
   */
  async joinTournament(tournamentId) {
    return await this.client.post(API_CONFIG.ENDPOINTS.TOURNAMENT.JOIN, null, {
      params: { tournamentId }
    });
  }

  /**
   * Submit tournament score
   * POST /tournaments/:tournamentId/submit
   */
  async submitScore(tournamentId, score, metadata = {}) {
    return await this.client.post(
      API_CONFIG.ENDPOINTS.TOURNAMENT.SUBMIT_SCORE,
      { score, metadata },
      { params: { tournamentId } }
    );
  }

  /**
   * Get tournament leaderboard
   * GET /tournaments/:tournamentId/leaderboard
   */
  async getLeaderboard(tournamentId, options = {}) {
    return await this.client.get(API_CONFIG.ENDPOINTS.TOURNAMENT.GET_LEADERBOARD, {
      params: { tournamentId },
      query: {
        limit: options.limit || 100,
        offset: options.offset || 0
      }
    });
  }

  /**
   * Get user's tournament history
   * GET /tournaments/:userId/history
   */
  async getUserTournaments(userId) {
    return await this.client.get(API_CONFIG.ENDPOINTS.TOURNAMENT.GET_USER_TOURNAMENTS, {
      params: { userId }
    });
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TournamentService;
}
