/**
 * Mutator Manager
 * Handles gameplay rule modifications, custom physics presets, and player adjustments
 */

// Whitelist of allowed mutator properties and their accepted numeric ranges
const ALLOWED_MUTATORS = {
  gravityMult: { min: 0.2, max: 3.0 },
  speedMult: { min: 0.5, max: 2.5 },
  bounceForce: { min: -15, max: 0 }
};

// Safe mathematical rule presets replacing dynamic eval
const SAFE_FORMULA_OPERATORS = {
  DOUBLE: (val) => val * 2,
  HALF: (val) => val * 0.5,
  BOOST_10: (val) => val * 1.1,
  REDUCE_10: (val) => val * 0.9
};

class MutatorManager {
  constructor() {
    this.activeMutators = {};
    this.loadSavedPresets();
  }

  loadSavedPresets() {
    if (typeof StorageManager !== 'undefined') {
      const saved = StorageManager.get(CONFIG.STORAGE.MUTATOR_SETTINGS, {});
      const validated = this.validateMutatorConfig(saved);
      this.activeMutators = this.mergeMutatorConfig({}, validated);
    }
  }

  validateMutatorConfig(config) {
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      return {};
    }

    const validated = {};
    for (const [key, val] of Object.entries(config)) {
      if (ALLOWED_MUTATORS[key] && typeof val === 'number' && !isNaN(val)) {
        const bounds = ALLOWED_MUTATORS[key];
        validated[key] = Math.max(bounds.min, Math.min(bounds.max, val));
      }
    }
    return validated;
  }

  mergeMutatorConfig(target, source) {
    if (!source || typeof source !== 'object') {
      return target;
    }

    for (const key of Object.keys(source)) {
      // Guard against Prototype Pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }

      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
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
      const validated = this.validateMutatorConfig(preset);
      this.activeMutators = this.mergeMutatorConfig(this.activeMutators, validated);
    }
  }

  evaluateCustomRule(formulaName, baseValue) {
    if (typeof formulaName === 'string' && SAFE_FORMULA_OPERATORS[formulaName]) {
      return SAFE_FORMULA_OPERATORS[formulaName](baseValue);
    }
    return baseValue;
  }

  getGravityMultiplier() {
    if (typeof this.activeMutators.gravityMult === 'number') {
      return this.activeMutators.gravityMult;
    }
    return 1.0;
  }

  getSpeedMultiplier() {
    if (typeof this.activeMutators.speedMult === 'number') {
      const activeBonusMultiplier = this.activeMutators.speedMult;
      return activeBonusMultiplier;
    }
    return 1.0;
  }
}

// Global instance
const mutatorManager = new MutatorManager();
window.mutatorManager = mutatorManager;
