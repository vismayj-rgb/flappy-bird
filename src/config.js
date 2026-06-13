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
    ROTATION_SPEED: 3,
    SKINS: {
      CLASSIC: { name: 'Classic Gold', body: '#FFD700', wing: '#FFA500', beak: '#FF6347', price: 0 },
      RUBY: { name: 'Ruby Red', body: '#E53E3E', wing: '#ED8936', beak: '#ECC94B', price: 0 },
      EMERALD: { name: 'Neon Emerald', body: '#48BB78', wing: '#38A169', beak: '#E53E3E', price: 0 },
      VORTEX: { name: 'Vortex Violet', body: '#9F7AEA', wing: '#00B5D8', beak: '#ED64A6', price: 0 },
      // Premium skins (purchasable in shop)
      PHOENIX: { name: 'Golden Phoenix', body: '#FFAE00', wing: '#FF4D00', beak: '#FFFFFF', price: 150 },
      RAINBOW: { name: 'Rainbow Trail', body: '#FF007F', wing: '#00F2FE', beak: '#FFF700', price: 100 },
      BAT: { name: 'Shadow Bat', body: '#1D1D2C', wing: '#4B0082', beak: '#E53E3E', price: 50 },
      ROBO: { name: 'Robo Bird', body: '#718096', wing: '#3182CE', beak: '#00FFFF', price: 75 }
    }
  },

  // Power-up settings
  POWERUP: {
    WIDTH: 20,
    HEIGHT: 20,
    SPAWN_CHANCE: 0.25, // 25% chance to spawn with a pipe
    SHIELD_DURATION: 300, // 5 seconds at 60 FPS
    DOUBLE_SCORE_DURATION: 300, // 5 seconds at 60 FPS
    SLOW_MO_DURATION: 300, // 5 seconds at 60 FPS
    TYPES: {
      SHIELD: 'SHIELD',
      DOUBLE_SCORE: 'DOUBLE_SCORE',
      SLOW_MO: 'SLOW_MO'
    },
    COLORS: {
      SHIELD: '#00FFFF',      // Cyan
      DOUBLE_SCORE: '#FF00FF', // Magenta
      SLOW_MO: '#FFAA00'      // Amber
    }
  },

  // Coin settings
  COIN: {
    WIDTH: 16,
    HEIGHT: 16,
    RADIUS: 8,
    SPAWN_CHANCE: 0.45, // 45% chance to spawn a coin in the pipe gap
    COLOR: '#FFD700',
    SHADOW_COLOR: '#B8860B'
  },

  // Boss settings
  BOSS: {
    TRIGGER_SCORE: 25, // Spawn boss every 25 points
    HEALTH: 3,
    WIDTH: 70,
    HEIGHT: 55,
    COLOR: '#2D3748',
    SPEED: 1.5,
    FIRE_INTERVAL: 80, // frames between fireball shots
    FIREBALL_SPEED: 4.5,
    FIREBALL_RADIUS: 7,
    ENERGY_ORB_SPAWN_CHANCE: 0.2, // Spawns during boss phases so player can attack
    ENERGY_ORB_RADIUS: 8
  },

  // Weather settings
  WEATHER: {
    TYPES: {
      CLEAR: 'CLEAR',
      RAINY: 'RAINY',
      SNOWY: 'SNOWY',
      STORMY: 'STORMY'
    },
    WINDS: {
      CLEAR: { x: 0, y: 0, name: 'Calm' },
      RAINY: { x: -0.2, y: 0.15, name: 'Breezy (Downward force)' },
      SNOWY: { x: 0.1, y: -0.05, name: 'Slight Draft (Upward drift)' },
      STORMY: { x: -0.6, y: 0.35, name: 'Gale (Heavy resistance)' }
    }
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
    CLOUD_COLOR: 'rgba(255, 255, 255, 0.6)',
    THEMES: {
      DAY: {
        BACKGROUND: ['#4ec0ca', '#a7dbd8', '#e0f9ff'],
        CLOUD_COLOR: 'rgba(255, 255, 255, 0.6)',
        PIPE_COLOR_TOP: '#5CB85C',
        PIPE_COLOR_BOTTOM: '#5CB85C',
        PIPE_CAP: '#4A934A',
        PIPE_STRIPE: '#4A934A',
        GROUND_COLOR: '#DEB887',
        GROUND_STRIPE: '#C9A66B',
        GROUND_LINE: '#8B7355'
      },
      SUNSET: {
        BACKGROUND: ['#FD6A02', '#FF8C00', '#FFD700'],
        CLOUD_COLOR: 'rgba(255, 220, 200, 0.5)',
        PIPE_COLOR_TOP: '#8B5A2B',
        PIPE_COLOR_BOTTOM: '#8B5A2B',
        PIPE_CAP: '#6E4720',
        PIPE_STRIPE: '#6E4720',
        GROUND_COLOR: '#CD853F',
        GROUND_STRIPE: '#B8860B',
        GROUND_LINE: '#8B4513'
      },
      NIGHT: {
        BACKGROUND: ['#0A1128', '#101F42', '#1C3166'],
        CLOUD_COLOR: 'rgba(255, 255, 255, 0.15)',
        PIPE_COLOR_TOP: '#4B0082',
        PIPE_COLOR_BOTTOM: '#4B0082',
        PIPE_CAP: '#3A0066',
        PIPE_STRIPE: '#3A0066',
        GROUND_COLOR: '#2F4F4F',
        GROUND_STRIPE: '#1C2E2E',
        GROUND_LINE: '#000000'
      }
    }
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
    PAUSED: 'PAUSED',
    BOSS_WARNING: 'BOSS_WARNING', // New intermediate state
    BOSS_BATTLE: 'BOSS_BATTLE'     // New active state
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
    DIFFICULTY: 'flappybird_difficulty',
    BIRD_SKIN: 'flappybird_birdskin',
    ACHIEVEMENTS: 'flappybird_achievements',
    BEST_RUNS: 'flappybird_bestruns',
    COINS: 'flappybird_coins',               // New
    UNLOCKED_SKINS: 'flappybird_unlocked_skins', // New
    QUESTS: 'flappybird_quests'             // New
  },

  // Achievement definitions
  ACHIEVEMENTS: [
    { id: 'first_flight',  title: 'First Flight 🐦',    desc: 'Score your first point!' },
    { id: 'bronze_flapper',title: 'Bronze Flapper 🥉', desc: 'Reach a score of 10 points.' },
    { id: 'silver_flapper',title: 'Silver Flapper 🥈', desc: 'Reach a score of 25 points.' },
    { id: 'gold_flapper',  title: 'Gold Flapper 🥇',   desc: 'Reach a score of 50 points.' },
    { id: 'shield_master', title: 'Shield Master 🛡️',   desc: 'Collect 3 shields in a single run.' },
    { id: 'gem_collector', title: 'Gem Collector 💎',   desc: 'Collect 5 gems in a single run.' },
    { id: 'slow_time_lord',title: 'Slow Time Lord ⏳',        desc: 'Collect 3 slow-motion power-ups in a run.' },
    { id: 'combo_5',       title: 'Combo Master 🔥',    desc: 'Build a 5x combo without missing.' },
    { id: 'survivor',      title: 'Survivor ❤️',         desc: 'Finish a run with all 3 lives intact.' },
    // New Achievements
    { id: 'boss_slayer',   title: 'Boss Slayer ⚔️',      desc: 'Defeat your first epic boss.' },
    { id: 'wealthy_bird',  title: 'Wealthy Bird 💰',     desc: 'Accumulate 100 gold coins.' },
    { id: 'storm_survivor',title: 'Storm Survivor ⚡',   desc: 'Score 10 points during a Stormy weather phase.' }
  ],

  // Daily Quests definitions
  QUESTS: [
    { id: 'collect_coins', title: 'Coin Collector', desc: 'Collect 15 gold coins', target: 15, reward: 25, metric: 'coins' },
    { id: 'defeat_boss', title: 'Slayer of Giants', desc: 'Defeat 1 boss encounter', target: 1, reward: 50, metric: 'bosses' },
    { id: 'high_combo', title: 'Combo Connoisseur', desc: 'Get a 4x combo multiplier', target: 4, reward: 20, metric: 'combo' }
  ],

  // Debug mode
  DEBUG: false
};

// Make config immutable
Object.freeze(CONFIG);
Object.freeze(CONFIG.CANVAS);
Object.freeze(CONFIG.PHYSICS);
Object.freeze(CONFIG.BIRD);
Object.freeze(CONFIG.BIRD.SKINS);
Object.freeze(CONFIG.PIPE);
Object.freeze(CONFIG.POWERUP);
Object.freeze(CONFIG.POWERUP.TYPES);
Object.freeze(CONFIG.POWERUP.COLORS);
Object.freeze(CONFIG.COIN);
Object.freeze(CONFIG.BOSS);
Object.freeze(CONFIG.WEATHER);
Object.freeze(CONFIG.WEATHER.TYPES);
Object.freeze(CONFIG.WEATHER.WINDS);
Object.freeze(CONFIG.DIFFICULTY);
Object.freeze(CONFIG.VISUALS);
Object.freeze(CONFIG.VISUALS.THEMES);
Object.freeze(CONFIG.VISUALS.THEMES.DAY);
Object.freeze(CONFIG.VISUALS.THEMES.SUNSET);
Object.freeze(CONFIG.VISUALS.THEMES.NIGHT);
Object.freeze(CONFIG.SCORE);
Object.freeze(CONFIG.STATES);
Object.freeze(CONFIG.KEYS);
Object.freeze(CONFIG.STORAGE);
Object.freeze(CONFIG.ACHIEVEMENTS);
Object.freeze(CONFIG.QUESTS);
