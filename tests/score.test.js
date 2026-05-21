/**
 * @jest-environment jsdom
 */

// Mock CONFIG
global.CONFIG = {
  STORAGE: {
    HIGH_SCORE: 'flappybird_highscore',
    TOTAL_SCORE: 'flappybird_totalscore',
    GAMES_PLAYED: 'flappybird_gamesplayed'
  },
  SCORE: {
    FONT: 'bold 48px Arial',
    COLOR: '#FFFFFF',
    SHADOW_COLOR: '#000000',
    POSITION_X: 200,
    POSITION_Y: 100
  }
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;

// Mock sound manager
global.soundManager = {
  playScore: jest.fn()
};

describe('ScoreManager', () => {
  let scoreManager;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Mock DOM elements
    document.body.innerHTML = `
      <span id="currentScore">0</span>
      <span id="highScoreDisplay">0</span>
      <span id="finalScore">0</span>
      <span id="bestScore">0</span>
      <span id="totalScore">0</span>
      <span id="gamesPlayed">0</span>
    `;

    // Define ScoreManager for testing
    class ScoreManager {
      constructor() {
        this.currentScore = 0;
        this.highScore = this.loadHighScore();
        this.totalScore = this.loadTotalScore();
        this.gamesPlayed = this.loadGamesPlayed();
      }

      reset() {
        this.currentScore = 0;
      }

      increment() {
        this.currentScore++;
        if (window.soundManager) {
          soundManager.playScore();
        }
        this.updateDisplay();
      }

      endGame() {
        this.gamesPlayed++;
        this.totalScore += this.currentScore;
        
        if (this.currentScore > this.highScore) {
          this.highScore = this.currentScore;
          this.saveHighScore();
        }
        
        this.saveGamesPlayed();
        this.saveTotalScore();
        this.updateDisplay();
      }

      getCurrentScore() {
        return this.currentScore;
      }

      getHighScore() {
        return this.highScore;
      }

      getTotalScore() {
        return this.totalScore;
      }

      getGamesPlayed() {
        return this.gamesPlayed;
      }

      getAverageScore() {
        return this.gamesPlayed > 0 ? Math.floor(this.totalScore / this.gamesPlayed) : 0;
      }

      loadHighScore() {
        return parseInt(localStorage.getItem(CONFIG.STORAGE.HIGH_SCORE) || '0');
      }

      saveHighScore() {
        localStorage.setItem(CONFIG.STORAGE.HIGH_SCORE, this.highScore.toString());
      }

      loadTotalScore() {
        return parseInt(localStorage.getItem(CONFIG.STORAGE.TOTAL_SCORE) || '0');
      }

      saveTotalScore() {
        localStorage.setItem(CONFIG.STORAGE.TOTAL_SCORE, this.totalScore.toString());
      }

      loadGamesPlayed() {
        return parseInt(localStorage.getItem(CONFIG.STORAGE.GAMES_PLAYED) || '0');
      }

      saveGamesPlayed() {
        localStorage.setItem(CONFIG.STORAGE.GAMES_PLAYED, this.gamesPlayed.toString());
      }

      updateDisplay() {
        this.updateElement('currentScore', this.currentScore);
        this.updateElement('highScoreDisplay', this.highScore);
        this.updateElement('finalScore', this.currentScore);
        this.updateElement('bestScore', this.highScore);
        this.updateElement('totalScore', this.totalScore);
        this.updateElement('gamesPlayed', this.gamesPlayed);
      }

      updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = value;
        }
      }
    }

    scoreManager = new ScoreManager();
  });

  describe('Initialization', () => {
    test('should initialize with zero scores', () => {
      expect(scoreManager.getCurrentScore()).toBe(0);
      expect(scoreManager.getHighScore()).toBe(0);
      expect(scoreManager.getTotalScore()).toBe(0);
      expect(scoreManager.getGamesPlayed()).toBe(0);
    });

    test('should load existing high score from localStorage', () => {
      localStorage.setItem(CONFIG.STORAGE.HIGH_SCORE, '50');
      const newScoreManager = new scoreManager.constructor();
      expect(newScoreManager.getHighScore()).toBe(50);
    });
  });

  describe('Score Increment', () => {
    test('should increment current score', () => {
      scoreManager.increment();
      expect(scoreManager.getCurrentScore()).toBe(1);
      
      scoreManager.increment();
      expect(scoreManager.getCurrentScore()).toBe(2);
    });

    test('should play score sound when incrementing', () => {
      scoreManager.increment();
      expect(soundManager.playScore).toHaveBeenCalled();
    });

    test('should update display when incrementing', () => {
      scoreManager.increment();
      expect(document.getElementById('currentScore').textContent).toBe('1');
    });
  });

  describe('Reset', () => {
    test('should reset current score to zero', () => {
      scoreManager.increment();
      scoreManager.increment();
      expect(scoreManager.getCurrentScore()).toBe(2);
      
      scoreManager.reset();
      expect(scoreManager.getCurrentScore()).toBe(0);
    });
  });

  describe('End Game', () => {
    test('should increment games played', () => {
      scoreManager.endGame();
      expect(scoreManager.getGamesPlayed()).toBe(1);
    });

    test('should add current score to total score', () => {
      scoreManager.currentScore = 10;
      scoreManager.endGame();
      expect(scoreManager.getTotalScore()).toBe(10);
      
      scoreManager.currentScore = 5;
      scoreManager.endGame();
      expect(scoreManager.getTotalScore()).toBe(15);
    });

    test('should update high score if current score is higher', () => {
      scoreManager.currentScore = 50;
      scoreManager.endGame();
      expect(scoreManager.getHighScore()).toBe(50);
      
      scoreManager.currentScore = 30;
      scoreManager.endGame();
      expect(scoreManager.getHighScore()).toBe(50);
      
      scoreManager.currentScore = 60;
      scoreManager.endGame();
      expect(scoreManager.getHighScore()).toBe(60);
    });

    test('should save scores to localStorage', () => {
      scoreManager.currentScore = 25;
      scoreManager.endGame();
      
      expect(localStorage.getItem(CONFIG.STORAGE.HIGH_SCORE)).toBe('25');
      expect(localStorage.getItem(CONFIG.STORAGE.TOTAL_SCORE)).toBe('25');
      expect(localStorage.getItem(CONFIG.STORAGE.GAMES_PLAYED)).toBe('1');
    });
  });

  describe('Average Score', () => {
    test('should calculate average score correctly', () => {
      scoreManager.currentScore = 10;
      scoreManager.endGame();
      expect(scoreManager.getAverageScore()).toBe(10);
      
      scoreManager.currentScore = 20;
      scoreManager.endGame();
      expect(scoreManager.getAverageScore()).toBe(15);
      
      scoreManager.currentScore = 30;
      scoreManager.endGame();
      expect(scoreManager.getAverageScore()).toBe(20);
    });

    test('should return 0 when no games played', () => {
      expect(scoreManager.getAverageScore()).toBe(0);
    });
  });

  describe('Display Update', () => {
    test('should update all DOM elements', () => {
      scoreManager.currentScore = 10;
      scoreManager.highScore = 50;
      scoreManager.totalScore = 100;
      scoreManager.gamesPlayed = 5;
      
      scoreManager.updateDisplay();
      
      expect(document.getElementById('currentScore').textContent).toBe('10');
      expect(document.getElementById('highScoreDisplay').textContent).toBe('50');
      expect(document.getElementById('finalScore').textContent).toBe('10');
      expect(document.getElementById('bestScore').textContent).toBe('50');
      expect(document.getElementById('totalScore').textContent).toBe('100');
      expect(document.getElementById('gamesPlayed').textContent).toBe('5');
    });
  });
});
