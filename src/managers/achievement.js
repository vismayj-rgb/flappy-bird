/**
 * Achievement Manager
 * Handles local achievements progress, unlocks, notifications, and UI panel rendering
 */

class AchievementManager {
  constructor() {
    this.unlocked = {};
    this.loadUnlocked();
  }

  loadUnlocked() {
    if (typeof StorageManager !== 'undefined') {
      this.unlocked = StorageManager.get(CONFIG.STORAGE.ACHIEVEMENTS, {});
    }
  }

  check(metric, value) {
    CONFIG.ACHIEVEMENTS.forEach(ach => {
      if (this.unlocked[ach.id]) {
        return; // Already unlocked
      }

      let shouldUnlock = false;

      switch (ach.id) {
        case 'first_flight':
          if (metric === 'score' && value >= 1) shouldUnlock = true;
          break;
        case 'bronze_flapper':
          if (metric === 'score' && value >= 10) shouldUnlock = true;
          break;
        case 'silver_flapper':
          if (metric === 'score' && value >= 25) shouldUnlock = true;
          break;
        case 'gold_flapper':
          if (metric === 'score' && value >= 50) shouldUnlock = true;
          break;
      }

      if (shouldUnlock) {
        this.unlock(ach.id);
      }
    });
  }

  unlock(id) {
    if (this.unlocked[id]) return;

    this.unlocked[id] = true;
    if (typeof StorageManager !== 'undefined') {
      StorageManager.set(CONFIG.STORAGE.ACHIEVEMENTS, this.unlocked);
    }

    const ach = CONFIG.ACHIEVEMENTS.find(a => a.id === id);
    if (ach) {
      // Play sound
      if (window.soundManager && typeof soundManager.playAchievementUnlock === 'function') {
        soundManager.playAchievementUnlock();
      }

      // Show toast
      this.showToast(ach.title, ach.desc);
    }

    this.refreshUI();
  }

  showToast(title, desc) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <div class="toast-icon">🏆</div>
      <div class="toast-text">
        <h4>Achievement Unlocked!</h4>
        <p><strong>${title}</strong>: ${desc}</p>
      </div>
    `;

    container.appendChild(toast);

    // Slide in
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Slide out and remove
    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 4000);
  }

  refreshUI() {
    const listElement = document.getElementById('achievementsList');
    if (!listElement) return;

    listElement.innerHTML = '';

    CONFIG.ACHIEVEMENTS.forEach(ach => {
      const isUnlocked = !!this.unlocked[ach.id];
      const item = document.createElement('div');
      item.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
      item.innerHTML = `
        <div class="ach-info">
          <span class="ach-title">${ach.title}</span>
          <span class="ach-desc">${ach.desc}</span>
        </div>
        <div class="ach-status">${isUnlocked ? '✅ Unlocked' : '🔒 Locked'}</div>
      `;
      listElement.appendChild(item);
    });
  }
}

// Create global instance
const achievementManager = new AchievementManager();
