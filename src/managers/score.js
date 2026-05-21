/**
 * Score Manager
 * Handles score tracking, high scores, and statistics
 */

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
    
    // Play score sound if available
    if (window.soundManager) {
      soundManager.playScore();
    }
    
    this.updateDisplay();
  }

  endGame() {
    // Update statistics
    this.gamesPlayed++;
    this.totalScore += this.currentScore;
    
    // Update high score if necessary
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      this.saveHighScore();
    }
    
    // Save statistics
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

  // Storage methods
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

  // UI Update methods
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

  draw(ctx) {
    ctx.save();
    ctx.font = CONFIG.SCORE.FONT;
    ctx.fillStyle = CONFIG.SCORE.COLOR;
    ctx.textAlign = 'center';
    
    // Draw shadow
    ctx.shadowColor = CONFIG.SCORE.SHADOW_COLOR;
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillText(this.currentScore, CONFIG.SCORE.POSITION_X, CONFIG.SCORE.POSITION_Y);
    
    ctx.restore();
  }
}
