/**
 * Game Configuration
 * Central configuration for all game constants and settings
 */

const CONFIG = {
  // Canvas dimensions
  CANVAS: {
    WIDTH: 400,
    HEIGHT: 600
  },

  // Physics
  PHYSICS: {
    GRAVITY: 0.5,
    JUMP_FORCE: -8,
    MAX_VELOCITY: 10
  },

  // Bird settings
  BIRD: {
    WIDTH: 34,
    HEIGHT: 24,
    START_X: 100,
    START_Y: 300,
    COLOR: '#FFD700',
    ROTATION_SPEED: 3
  },

  // Pipe settings
  PIPE: {
    WIDTH: 52,
    GAP_HEIGHT: 150,
    MIN_GAP_Y: 100,
    MAX_GAP_Y: 400,
    SPEED: 3,
    SPAWN_INTERVAL: 90, // frames
    COLOR_TOP: '#5CB85C',
    COLOR_BOTTOM: '#5CB85C'
  },

  // Difficulty settings (adjustable)
  DIFFICULTY: {
    EASY: {
      pipeSpeed: 2,
      gapHeight: 180,
      spawnInterval: 110
    },
    MEDIUM: {
      pipeSpeed: 3,
      gapHeight: 150,
      spawnInterval: 90
    },
    HARD: {
      pipeSpeed: 4,
      gapHeight: 130,
      spawnInterval: 70
    },
    EXPERT: {
      pipeSpeed: 5,
      gapHeight: 110,
      spawnInterval: 60
    },
    INSANE: {
      pipeSpeed: 6,
      gapHeight: 100,
      spawnInterval: 50
    }
  },

  // Visual settings
  VISUALS: {
    BACKGROUND_COLOR: '#4ec0ca',
    GROUND_HEIGHT: 50,
    GROUND_COLOR: '#DEB887',
    CLOUD_COUNT: 3,
    CLOUD_COLOR: 'rgba(255, 255, 255, 0.6)'
  },

  // Score settings
  SCORE: {
    FONT: 'bold 48px Arial',
    COLOR: '#FFFFFF',
    SHADOW_COLOR: '#000000',
    POSITION_X: 200,
    POSITION_Y: 100
  },

  // Game states
  STATES: {
    START: 'START',
    PLAYING: 'PLAYING',
    GAME_OVER: 'GAME_OVER',
    PAUSED: 'PAUSED'
  },

  // Input keys
  KEYS: {
    SPACE: ' ',
    SPACE_CODE: 32,
    ESCAPE: 'Escape',
    P: 'p'
  },

  // Storage keys
  STORAGE: {
    HIGH_SCORE: 'flappybird_highscore',
    TOTAL_SCORE: 'flappybird_totalscore',
    GAMES_PLAYED: 'flappybird_gamesplayed',
    SOUND_ENABLED: 'flappybird_sound',
    DIFFICULTY: 'flappybird_difficulty'
  },

  // Debug mode
  DEBUG: false
};

// Make config immutable
Object.freeze(CONFIG);
Object.freeze(CONFIG.CANVAS);
Object.freeze(CONFIG.PHYSICS);
Object.freeze(CONFIG.BIRD);
Object.freeze(CONFIG.PIPE);
Object.freeze(CONFIG.DIFFICULTY);
Object.freeze(CONFIG.VISUALS);
Object.freeze(CONFIG.SCORE);
Object.freeze(CONFIG.STATES);
Object.freeze(CONFIG.KEYS);
Object.freeze(CONFIG.STORAGE);
