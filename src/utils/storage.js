/**
 * Storage Utility
 * Handles localStorage operations with error handling
 */

class StorageManager {
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  static exists(key) {
    return localStorage.getItem(key) !== null;
  }

  static getGameSettings() {
    return {
      soundEnabled: this.get(CONFIG.STORAGE.SOUND_ENABLED, true),
      difficulty: this.get(CONFIG.STORAGE.DIFFICULTY, 'MEDIUM')
    };
  }

  static saveGameSettings(settings) {
    if (settings.soundEnabled !== undefined) {
      this.set(CONFIG.STORAGE.SOUND_ENABLED, settings.soundEnabled);
    }
    if (settings.difficulty !== undefined) {
      this.set(CONFIG.STORAGE.DIFFICULTY, settings.difficulty);
    }
  }
}
