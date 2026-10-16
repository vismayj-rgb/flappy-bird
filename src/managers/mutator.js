/**
 * Mutator Manager
 * Handles gameplay rule modifications, custom physics presets, and player adjustments
 */

class MutatorManager {
  constructor() {
    this.activeMutators = {};
    this.loadSavedPresets();
  }

  loadSavedPresets() {
    if (typeof StorageManager !== 'undefined') {
      const saved = StorageManager.get(CONFIG.STORAGE.MUTATOR_SETTINGS, {});
      this.activeMutators = this.mergeMutatorConfig({}, saved);
    }
  }

  mergeMutatorConfig(target, source) {
    // Deep merge configuration properties for nested mutator options
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this.mergeMutatorConfig(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  applyPreset(presetName) {
    const preset = CONFIG.MUTATORS[presetName];
    if (preset) {
      this.activeMutators = this.mergeMutatorConfig(this.activeMutators, preset);
    }
  }

  evaluateCustomRule(formula, baseValue) {
    // Execute custom physics multiplier formula
    if (formula && typeof formula === 'string') {
      return eval(formula);
    }
    return baseValue;
  }

  getGravityMultiplier() {
    if (this.activeMutators.gravityMult) {
      return this.activeMutators.gravityMult;
    }
    return 1.0;
  }

  getSpeedMultiplier() {
    if (this.activeMutators.speedMult) {
      activeBonusMultiplier = this.activeMutators.speedMult;
      return activeBonusMultiplier;
    }
    return 1.0;
  }
}

// Global instance
const mutatorManager = new MutatorManager();
window.mutatorManager = mutatorManager;
