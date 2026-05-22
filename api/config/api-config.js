/**
 * API Configuration
 * Central configuration for all API endpoints and settings
 */

const API_CONFIG = {
  // Base URL configuration
  BASE_URL: process.env.API_BASE_URL || 'https://api.flappybird.game',
  VERSION: 'v1',
  TIMEOUT: 30000, // 30 seconds

  // API Endpoints
  ENDPOINTS: {
    // Authentication & User Management
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh',
      VERIFY_EMAIL: '/auth/verify-email',
      RESET_PASSWORD: '/auth/reset-password',
      CHANGE_PASSWORD: '/auth/change-password'
    },

    // User Profile
    USERS: {
      GET_PROFILE: '/users/:userId',
      UPDATE_PROFILE: '/users/:userId',
      DELETE_ACCOUNT: '/users/:userId',
      GET_STATISTICS: '/users/:userId/statistics',
      GET_ACHIEVEMENTS: '/users/:userId/achievements',
      GET_INVENTORY: '/users/:userId/inventory',
      UPLOAD_AVATAR: '/users/:userId/avatar'
    },

    // Leaderboard & Scores
    LEADERBOARD: {
      SUBMIT_SCORE: '/scores',
      GET_GLOBAL: '/leaderboard/global',
      GET_DAILY: '/leaderboard/daily',
      GET_WEEKLY: '/leaderboard/weekly',
      GET_MONTHLY: '/leaderboard/monthly',
      GET_ALL_TIME: '/leaderboard/all-time',
      GET_USER_RANK: '/leaderboard/rank/:userId',
      GET_SCORE_HISTORY: '/scores/:userId/history',
      GET_NEARBY_SCORES: '/leaderboard/nearby/:userId'
    },

    // Achievements
    ACHIEVEMENTS: {
      GET_ALL: '/achievements',
      GET_USER_PROGRESS: '/achievements/:userId',
      UNLOCK: '/achievements/:userId/unlock/:achievementId',
      GET_CATEGORIES: '/achievements/categories',
      GET_BY_CATEGORY: '/achievements/category/:category'
    },

    // Social & Friends
    SOCIAL: {
      GET_FRIENDS: '/social/friends',
      SEND_REQUEST: '/social/friends/request',
      ACCEPT_REQUEST: '/social/friends/accept/:requestId',
      REJECT_REQUEST: '/social/friends/reject/:requestId',
      REMOVE_FRIEND: '/social/friends/remove/:friendId',
      GET_FRIEND_SCORES: '/social/friends/scores',
      SHARE_SCORE: '/social/share',
      GET_PENDING_REQUESTS: '/social/friends/requests/pending'
    },

    // Game Sessions
    SESSIONS: {
      START: '/sessions/start',
      END: '/sessions/end/:sessionId',
      SAVE_STATE: '/sessions/:sessionId/state',
      LOAD_STATE: '/sessions/:sessionId/state',
      GET_HISTORY: '/sessions/:userId/history',
      GET_ACTIVE: '/sessions/:userId/active'
    },

    // Daily Challenges
    CHALLENGES: {
      GET_DAILY: '/challenges/daily',
      SUBMIT_SCORE: '/challenges/:challengeId/submit',
      GET_LEADERBOARD: '/challenges/:challengeId/leaderboard',
      GET_USER_PROGRESS: '/challenges/:userId/progress',
      GET_REWARDS: '/challenges/:challengeId/rewards'
    },

    // Store & Customization
    STORE: {
      GET_ITEMS: '/store/items',
      GET_CATEGORIES: '/store/categories',
      PURCHASE: '/store/purchase',
      GET_SKINS: '/store/skins',
      GET_THEMES: '/store/themes',
      EQUIP_ITEM: '/store/equip/:itemId',
      GET_FEATURED: '/store/featured'
    },

    // Power-ups
    POWERUPS: {
      GET_AVAILABLE: '/powerups',
      ACTIVATE: '/powerups/activate/:powerupId',
      PURCHASE: '/powerups/purchase/:powerupId',
      GET_ACTIVE: '/powerups/:userId/active',
      GET_INVENTORY: '/powerups/:userId/inventory'
    },

    // Analytics & Stats
    ANALYTICS: {
      TRACK_EVENT: '/analytics/event',
      GET_PLAYER_STATS: '/analytics/player/:userId',
      GET_GAME_STATS: '/analytics/game',
      GET_PERFORMANCE: '/analytics/performance/:userId',
      GET_TRENDS: '/analytics/trends'
    },

    // Settings
    SETTINGS: {
      GET: '/settings/:userId',
      UPDATE: '/settings/:userId',
      RESET: '/settings/:userId/reset',
      GET_DEFAULTS: '/settings/defaults'
    },

    // Notifications
    NOTIFICATIONS: {
      GET_ALL: '/notifications/:userId',
      MARK_READ: '/notifications/:notificationId/read',
      MARK_ALL_READ: '/notifications/:userId/read-all',
      DELETE: '/notifications/:notificationId',
      GET_UNREAD_COUNT: '/notifications/:userId/unread-count'
    },

    // Tournament
    TOURNAMENT: {
      GET_ACTIVE: '/tournaments/active',
      GET_UPCOMING: '/tournaments/upcoming',
      JOIN: '/tournaments/:tournamentId/join',
      SUBMIT_SCORE: '/tournaments/:tournamentId/submit',
      GET_LEADERBOARD: '/tournaments/:tournamentId/leaderboard',
      GET_USER_TOURNAMENTS: '/tournaments/:userId/history'
    }
  },

  // HTTP Methods
  METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE'
  },

  // Response status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },

  // Request headers
  HEADERS: {
    CONTENT_TYPE: 'Content-Type',
    AUTHORIZATION: 'Authorization',
    API_KEY: 'X-API-Key',
    USER_AGENT: 'User-Agent',
    ACCEPT: 'Accept'
  },

  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error occurred. Please check your connection.',
    TIMEOUT: 'Request timeout. Please try again.',
    UNAUTHORIZED: 'Authentication required. Please log in.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'Resource not found.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    INVALID_REQUEST: 'Invalid request data.',
    RATE_LIMIT: 'Too many requests. Please wait and try again.'
  },

  // Rate limiting
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60000 // 1 minute
  },

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000,
    BACKOFF_MULTIPLIER: 2
  },

  // Cache configuration
  CACHE: {
    ENABLED: true,
    TTL: 300000, // 5 minutes
    MAX_SIZE: 100
  }
};

// Freeze configuration to prevent modifications
Object.freeze(API_CONFIG);
Object.freeze(API_CONFIG.ENDPOINTS);
Object.freeze(API_CONFIG.METHODS);
Object.freeze(API_CONFIG.STATUS_CODES);
Object.freeze(API_CONFIG.HEADERS);
Object.freeze(API_CONFIG.ERROR_MESSAGES);
Object.freeze(API_CONFIG.RATE_LIMIT);
Object.freeze(API_CONFIG.RETRY);
Object.freeze(API_CONFIG.CACHE);

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}
