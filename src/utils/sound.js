/**
 * Sound Manager
 * Handles audio playback with Web Audio API fallback
 */

class SoundManager {
  constructor() {
    this.enabled = StorageManager.get(CONFIG.STORAGE.SOUND_ENABLED, true);
    this.sounds = {};
    this.audioContext = null;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  // Generate simple tones using Web Audio API
  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext) {
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  playJump() {
    // Quick rising tone
    this.playTone(400, 0.1, 'square');
  }

  playScore() {
    // Pleasant ding sound
    this.playTone(800, 0.15, 'sine');
  }

  playHit() {
    // Harsh collision sound
    this.playTone(100, 0.3, 'sawtooth');
  }

  playPowerUp() {
    // Rising chime sound
    if (!this.enabled || !this.audioContext) {
      return;
    }
    try {
      this.playTone(523.25, 0.08, 'sine'); // C5
      setTimeout(() => {
        this.playTone(659.25, 0.12, 'sine'); // E5
      }, 70);
    } catch (error) {
      console.error('Error playing power-up sound:', error);
    }
  }

  playAchievementUnlock() {
    if (!this.enabled || !this.audioContext) {
      return;
    }
    try {
      const play = (freq, time, len) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + len);
        osc.start(time);
        osc.stop(time + len);
      };
      const now = this.audioContext.currentTime;
      play(261.63, now, 0.15);      // C4
      play(329.63, now + 0.1, 0.15);  // E4
      play(392.00, now + 0.2, 0.15);  // G4
      play(523.25, now + 0.3, 0.3);   // C5
    } catch (error) {
      console.error('Error playing achievement sound:', error);
    }
  }

  playGameOver() {
    // Descending tone
    if (!this.enabled || !this.audioContext) {
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing game over sound:', error);
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    StorageManager.set(CONFIG.STORAGE.SOUND_ENABLED, this.enabled);
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    StorageManager.set(CONFIG.STORAGE.SOUND_ENABLED, this.enabled);
  }

  isEnabled() {
    return this.enabled;
  }
}

// Create global instance
const soundManager = new SoundManager();
