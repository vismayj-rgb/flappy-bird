/**
 * Mutator Manager
 * Manages gameplay mutators (Low Gravity, Double Speed, Tiny Bird, Drunk Mode)
 * and keeps their states saved persistently in localStorage.
 */

class MutatorManager {
  constructor() {
    this.active = this.load();
  }

  load() {
    if (typeof StorageManager !== 'undefined') {
      const saved = StorageManager.get(CONFIG.STORAGE.MUTATORS, null);
      if (saved) return saved;
    }
    return {
      low_gravity: false,
      double_speed: false,
      tiny_bird: false,
      drunk_mode: false
    };
  }

  save() {
    if (typeof StorageManager !== 'undefined') {
      StorageManager.set(CONFIG.STORAGE.MUTATORS, this.active);
    }
  }

  toggle(mutatorId) {
    if (this.active[mutatorId] !== undefined) {
      this.active[mutatorId] = !this.active[mutatorId];
      this.save();
      
      // Play a little feedback beep
      if (window.soundManager) {
        soundManager.playTone(this.active[mutatorId] ? 500 : 350, 0.1, 'sine');
      }

      // If game is active, reset it to apply mutators properly
      if (window.game && window.game.state === CONFIG.STATES.PLAYING) {
        window.game.start();
      }

      this.refreshUI();
    }
  }

  isActive(mutatorId) {
    return !!this.active[mutatorId];
  }

  refreshUI() {
    Object.keys(this.active).forEach(key => {
      const checkbox = document.getElementById(`mutator_${key}`);
      if (checkbox) {
        checkbox.checked = this.active[key];
      }
    });
  }
}

// Global instance
const mutatorManager = new MutatorManager();
window.mutatorManager = mutatorManager;
