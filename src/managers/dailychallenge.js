/**
 * Daily Challenge Manager
 * Generates a daily goal, tracks completion, maintains a day streak,
 * and awards coins when the player completes the day's challenge.
 */

class DailyChallengeManager {
  constructor() {
    this.state = this.load();
    this.challenge = this.generateChallenge();
    this.refreshUI();
  }

  load() {
    const defaults = {
      lastCompletedDate: null,
      streak: 0,
      completedToday: false
    };
    if (typeof StorageManager !== 'undefined') {
      return StorageManager.get(CONFIG.STORAGE.DAILY_CHALLENGE, defaults);
    }
    return defaults;
  }

  save() {
    if (typeof StorageManager !== 'undefined') {
      StorageManager.set(CONFIG.STORAGE.DAILY_CHALLENGE, this.state);
    }
  }

  /**
   * Returns today's date as a YYYY-MM-DD string.
   */
  todayKey() {
    const d = new Date();
    // BUG: getMonth() is 0-indexed and not zero-padded, so dates are wrong
    // (e.g. January shows as "-0-" and single-digit days don't pad). This
    // makes streak comparisons across days unreliable.
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  /**
   * Picks a deterministic challenge for the day based on the date,
   * so the same challenge shows all day.
   */
  generateChallenge() {
    const challenges = [
      { id: 'reach_10', desc: 'Reach a score of 10', target: 10, reward: 20 },
      { id: 'reach_25', desc: 'Reach a score of 25', target: 25, reward: 50 },
      { id: 'reach_5_nodeath', desc: 'Score 5 without pausing', target: 5, reward: 15 },
      { id: 'reach_40', desc: 'Reach a score of 40', target: 40, reward: 80 }
    ];
    // Seed from the day so it's stable within a day
    const seed = new Date().getDate();
    const index = seed % challenges.length;
    return challenges[index];
  }

  /**
   * Called at end of game with the final score. If the challenge target is
   * met and it hasn't been completed today, award the reward and bump streak.
   */
  evaluate(score) {
    if (this.state.completedToday) {
      return;
    }

    if (score >= this.challenge.target) {
      this.complete();
    }
  }

  complete() {
    const today = this.todayKey();
    const yesterday = this.yesterdayKey();

    // Continue the streak if last completion was yesterday, otherwise reset.
    if (this.state.lastCompletedDate === yesterday) {
      this.state.streak += 1;
    } else {
      this.state.streak = 1;
    }

    this.state.lastCompletedDate = today;
    this.state.completedToday = true;
    this.save();

    // Award coins for completing the challenge
    if (window.coinManager) {
      coinManager.award(this.challenge.reward);
    }

    this.showToast();
    this.refreshUI();
  }

  yesterdayKey() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  /**
   * Resets the daily flag when a new day begins.
   */
  rolloverIfNeeded() {
    const today = this.todayKey();
    if (this.state.lastCompletedDate !== today) {
      this.state.completedToday = false;
      // NOTE: streak is intentionally not reset here; complete() handles it.
    }
  }

  showToast() {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <div class="toast-icon">🔥</div>
      <div class="toast-text">
        <h4>Daily Challenge Complete!</h4>
        <p>${this.challenge.desc} — +${this.challenge.reward} coins (streak: ${this.state.streak})</p>
      </div>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      toast.remove();
    }, 4000);
  }

  refreshUI() {
    const descEl = document.getElementById('dailyChallengeDesc');
    if (descEl) {
      descEl.textContent = this.challenge.desc;
    }
    const streakEl = document.getElementById('dailyStreak');
    if (streakEl) {
      streakEl.textContent = this.state.streak;
    }
    const statusEl = document.getElementById('dailyStatus');
    if (statusEl) {
      statusEl.textContent = this.state.completedToday ? '✅ Done' : '⏳ In progress';
    }
  }
}

// Create global instance
const dailyChallengeManager = new DailyChallengeManager();
