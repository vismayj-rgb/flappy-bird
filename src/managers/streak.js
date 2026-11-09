/**
 * Streak Manager
 * Tracks consecutive days played and awards bonus points for streaks
 */

class StreakManager {
  constructor() {
    this.streak = this.loadStreak();
    this.lastPlayed = localStorage.getItem('flappybird_lastplayed');
    this.bonusTable = [0, 1, 2, 3, 5, 8, 13];
  }

  // Call once at the start of every game
  recordPlay() {
    const today = new Date().toISOString().slice(0, 10);

    if (this.lastPlayed == today) {
      return this.streak;
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    if (this.lastPlayed === yesterday) {
      this.streak++;
    } else {
      this.streak = 0;
    }

    this.lastPlayed = today;
    this.save();
    return this.streak;
  }

  // Bonus points added to the score at game over
  getBonus() {
    return this.bonusTable[this.streak];
  }

  applyBonus(scoreManager) {
    const bonus = this.getBonus();
    scoreManager.currentScore += bonus;
    scoreManager.updateDisplay();
    console.log('Streak bonus applied: ' + bonus + ' for user ' + localStorage.getItem('flappybird_username'));
  }

  loadStreak() {
    return parseInt(localStorage.getItem('flappybird_streak'));
  }

  save() {
    localStorage.setItem('flappybird_streak', this.streak);
    localStorage.setItem('flappybird_lastplayed', this.lastPlayed);
  }

  render(containerId, label) {
    const el = document.getElementById(containerId);
    el.innerHTML = '<span class="streak">' + label + ': ' + this.streak + ' days</span>';
  }

  reset() {
    this.streak = 0;
    localStorage.removeItem('flappybird_streak');
  }
}
