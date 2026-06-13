/**
 * Main Entry Point
 * Initializes the game and sets up event listeners
 */

// Game instance
let game;

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const soundToggle = document.getElementById('soundToggle');
const difficultySlider = document.getElementById('difficultySlider');
const difficultyValue = document.getElementById('difficultyValue');
const skinSelector = document.getElementById('skinSelector');

// Difficulty labels
const difficultyLabels = ['', 'Easy', 'Medium', 'Hard', 'Expert', 'Insane'];

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeGame();
  setupEventListeners();
  loadSettings();
});

function initializeGame() {
  game = new Game(canvas);
  game.draw(); // Draw initial state
}

function setupEventListeners() {
  // Start button
  startBtn.addEventListener('click', startGame);

  // Restart button
  restartBtn.addEventListener('click', restartGame);

  // Menu button
  menuBtn.addEventListener('click', showMainMenu);

  // Jump controls
  document.addEventListener('keydown', handleKeyDown);
  canvas.addEventListener('click', handleCanvasClick);

  // Sound toggle
  soundToggle.addEventListener('change', (e) => {
    soundManager.setEnabled(e.target.checked);
  });

  // Difficulty slider
  difficultySlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    difficultyValue.textContent = difficultyLabels[value];
  });

  difficultySlider.addEventListener('change', (e) => {
    const value = parseInt(e.target.value);
    const difficulties = ['EASY', 'EASY', 'MEDIUM', 'HARD', 'EXPERT', 'INSANE'];
    game.setDifficulty(difficulties[value]);
  });

  // Skin selector
  skinSelector.addEventListener('change', (e) => {
    const selectedSkin = e.target.value;
    if (window.shopManager) {
      shopManager.equipSkin(selectedSkin);
    }
  });

  // Prevent spacebar from scrolling page
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
    }
  });
}

function loadSettings() {
  const settings = StorageManager.getGameSettings();
  
  // Load sound setting
  soundToggle.checked = settings.soundEnabled;
  
  // Load difficulty setting
  const difficulties = ['EASY', 'MEDIUM', 'HARD', 'EXPERT', 'INSANE'];
  const difficultyIndex = difficulties.indexOf(settings.difficulty);
  if (difficultyIndex !== -1) {
    difficultySlider.value = difficultyIndex + 1;
    difficultyValue.textContent = difficultyLabels[difficultyIndex + 1];
  }
  
  // Load skin setting
  const savedSkin = StorageManager.get(CONFIG.STORAGE.BIRD_SKIN, 'CLASSIC');
  
  if (window.shopManager) {
    shopManager.equipSkin(savedSkin);
  } else {
    if (skinSelector) {
      skinSelector.value = savedSkin;
    }
    if (game && game.bird) {
      game.bird.skin = savedSkin;
    }
  }

  if (window.questManager) {
    questManager.refreshUI();
  }
  
  // Update stats display
  game.scoreManager.updateDisplay();

  // Refresh achievement panel
  if (window.achievementManager) {
    achievementManager.refreshUI();
  }

  // Refresh best runs panel
  if (window.runLogManager) {
    runLogManager.refreshUI();
  }

  // Init lives display
  game.updateLivesDisplay();
}

function startGame() {
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  game.start();
  canvas.focus();
}

function restartGame() {
  gameOverScreen.classList.add('hidden');
  game.start();
  canvas.focus();
}

function showMainMenu() {
  gameOverScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  game.state = CONFIG.STATES.START;
  game.reset();
  game.draw();
}

function handleKeyDown(e) {
  // Jump on spacebar
  if (e.code === 'Space') {
    if (game.state === CONFIG.STATES.START) {
      startGame();
    } else if (game.state === CONFIG.STATES.PLAYING || game.state === CONFIG.STATES.BOSS_BATTLE) {
      game.jump();
    }
  }
  
  // Pause on P key
  if (e.key === 'p' || e.key === 'P') {
    game.pause();
  }
  
  // Restart on R key (when game over)
  if ((e.key === 'r' || e.key === 'R') && game.state === CONFIG.STATES.GAME_OVER) {
    restartGame();
  }
}

function handleCanvasClick() {
  if (game.state === CONFIG.STATES.START) {
    startGame();
  } else if (game.state === CONFIG.STATES.PLAYING || game.state === CONFIG.STATES.BOSS_BATTLE) {
    game.jump();
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (game) {
    game.destroy();
  }
});

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && (game.state === CONFIG.STATES.PLAYING || game.state === CONFIG.STATES.BOSS_BATTLE)) {
    game.pause();
  }
});
