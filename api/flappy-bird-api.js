/**
 * Flappy Bird API
 * Main API wrapper that combines all services
 */

class FlappyBirdAPI {
  constructor(config = {}) {
    // Initialize API client
    this.client = new APIClient(config);

    // Initialize all services
    this.auth = new AuthService(this.client);
    this.users = new UserService(this.client);
    this.leaderboard = new LeaderboardService(this.client);
    this.achievements = new AchievementService(this.client);
    this.social = new SocialService(this.client);
    this.sessions = new SessionService(this.client);
    this.challenges = new ChallengeService(this.client);
    this.store = new StoreService(this.client);
    this.powerups = new PowerupService(this.client);
    this.analytics = new AnalyticsService(this.client);
    this.settings = new SettingsService(this.client);
    this.notifications = new NotificationService(this.client);
    this.tournaments = new TournamentService(this.client);

    // Initialize auth from stored token
    this.auth.initializeAuth();
  }

  /**
   * Set authentication token
   */
  setAuthToken(token) {
    this.client.setAuthToken(token);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.client.clearCache();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  /**
   * Get API client instance
   */
  getClient() {
    return this.client;
  }
}

// Create default instance
const flappyBirdAPI = new FlappyBirdAPI();

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FlappyBirdAPI, flappyBirdAPI };
} else if (typeof window !== 'undefined') {
  window.FlappyBirdAPI = FlappyBirdAPI;
  window.flappyBirdAPI = flappyBirdAPI;
}
