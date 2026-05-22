/**
 * Flappy Bird API - Main Entry Point
 * Exports all API components for easy importing
 */

// Load in correct order (dependencies first)
if (typeof window !== 'undefined') {
  // Browser environment - load scripts in order
  const scripts = [
    'config/api-config.js',
    'core/api-client.js',
    'services/auth-service.js',
    'services/user-service.js',
    'services/leaderboard-service.js',
    'services/achievement-service.js',
    'services/social-service.js',
    'services/session-service.js',
    'services/challenge-service.js',
    'services/store-service.js',
    'services/powerup-service.js',
    'services/analytics-service.js',
    'services/settings-service.js',
    'services/notification-service.js',
    'services/tournament-service.js',
    'flappy-bird-api.js'
  ];

  console.log('Flappy Bird API initialized');
  console.log('Available services:', [
    'auth', 'users', 'leaderboard', 'achievements', 
    'social', 'sessions', 'challenges', 'store', 
    'powerups', 'analytics', 'settings', 'notifications', 'tournaments'
  ]);
}

// Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  const API_CONFIG = require('./config/api-config');
  const APIClient = require('./core/api-client');
  const AuthService = require('./services/auth-service');
  const UserService = require('./services/user-service');
  const LeaderboardService = require('./services/leaderboard-service');
  const AchievementService = require('./services/achievement-service');
  const SocialService = require('./services/social-service');
  const SessionService = require('./services/session-service');
  const ChallengeService = require('./services/challenge-service');
  const StoreService = require('./services/store-service');
  const PowerupService = require('./services/powerup-service');
  const AnalyticsService = require('./services/analytics-service');
  const SettingsService = require('./services/settings-service');
  const NotificationService = require('./services/notification-service');
  const TournamentService = require('./services/tournament-service');
  const { FlappyBirdAPI, flappyBirdAPI } = require('./flappy-bird-api');

  module.exports = {
    API_CONFIG,
    APIClient,
    AuthService,
    UserService,
    LeaderboardService,
    AchievementService,
    SocialService,
    SessionService,
    ChallengeService,
    StoreService,
    PowerupService,
    AnalyticsService,
    SettingsService,
    NotificationService,
    TournamentService,
    FlappyBirdAPI,
    flappyBirdAPI
  };
}
