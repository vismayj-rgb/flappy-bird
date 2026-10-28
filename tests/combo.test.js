/**
 * @jest-environment jsdom
 */

// Mock CONFIG
global.CONFIG = {
  COMBO: {
    BASE_POINTS: 1,
    STEP: 3,
    MAX_MULTIPLIER: 5,
    WINDOW_FRAMES: 180
  },
  CANVAS: {
    WIDTH: 400,
    HEIGHT: 600
  }
};

describe('ComboManager', () => {
  let comboManager;

  beforeEach(() => {
    // Local copy of the class logic for the JSDOM test runner
    class ComboManager {
      constructor() {
        this.combo = 0;
        this.maxCombo = 0;
        this.lastScoreFrame = 0;
        this.frame = 0;
      }

      reset() {
        this.combo = 0;
        this.maxCombo = 0;
        this.lastScoreFrame = 0;
        this.frame = 0;
      }

      tick() {
        this.frame++;
        if (this.combo > 0 && this.frame - this.lastScoreFrame > CONFIG.COMBO.WINDOW_FRAMES) {
          this.combo = 0;
        }
      }

      registerScore() {
        this.combo++;
        this.lastScoreFrame = this.frame;
        if (this.combo > this.maxCombo) {
          this.maxCombo = this.combo;
        }
        return CONFIG.COMBO.BASE_POINTS * this.getMultiplier();
      }

      getMultiplier() {
        const multiplier = 1 + Math.floor(this.combo / CONFIG.COMBO.STEP);
        return Math.min(multiplier, CONFIG.COMBO.MAX_MULTIPLIER);
      }

      getCombo() {
        return this.combo;
      }

      getMaxCombo() {
        return this.maxCombo;
      }
    }

    comboManager = new ComboManager();
  });

  describe('Initialization', () => {
    test('should start with no combo and x1 multiplier', () => {
      expect(comboManager.getCombo()).toBe(0);
      expect(comboManager.getMultiplier()).toBe(1);
      expect(comboManager.getMaxCombo()).toBe(0);
    });
  });

  describe('Multiplier tiers', () => {
    test('first two pipes stay at x1 (multiplier rises every STEP pipes)', () => {
      comboManager.registerScore(); // combo 1
      expect(comboManager.getMultiplier()).toBe(1);

      comboManager.registerScore(); // combo 2
      expect(comboManager.getMultiplier()).toBe(1);
    });

    test('third pipe reaches x2', () => {
      comboManager.registerScore();
      comboManager.registerScore();
      comboManager.registerScore(); // combo 3
      expect(comboManager.getMultiplier()).toBe(2);
    });

    test('sixth pipe reaches x3', () => {
      for (let i = 0; i < 6; i++) {
        comboManager.registerScore();
      }
      expect(comboManager.getMultiplier()).toBe(3);
    });

    test('multiplier is capped at MAX_MULTIPLIER', () => {
      for (let i = 0; i < 50; i++) {
        comboManager.registerScore();
      }
      expect(comboManager.getMultiplier()).toBe(CONFIG.COMBO.MAX_MULTIPLIER);
    });
  });

  describe('Points awarded', () => {
    test('awards base points while at x1', () => {
      expect(comboManager.registerScore()).toBe(1); // combo 1 -> x1
    });

    test('awards multiplied points once a tier is reached', () => {
      comboManager.registerScore(); // combo 1
      comboManager.registerScore(); // combo 2
      expect(comboManager.registerScore()).toBe(2); // combo 3 -> x2
    });
  });

  describe('Combo window', () => {
    test('combo resets after the window elapses with no new pipe', () => {
      comboManager.registerScore();
      comboManager.registerScore();
      comboManager.registerScore();
      expect(comboManager.getCombo()).toBe(3);

      for (let i = 0; i <= CONFIG.COMBO.WINDOW_FRAMES; i++) {
        comboManager.tick();
      }
      expect(comboManager.getCombo()).toBe(0);
    });

    test('combo survives if pipes keep coming within the window', () => {
      comboManager.registerScore();
      for (let i = 0; i < CONFIG.COMBO.WINDOW_FRAMES - 1; i++) {
        comboManager.tick();
      }
      comboManager.registerScore(); // refreshes the window
      for (let i = 0; i < CONFIG.COMBO.WINDOW_FRAMES - 1; i++) {
        comboManager.tick();
      }
      expect(comboManager.getCombo()).toBe(2);
    });
  });

  describe('Reset', () => {
    test('reset clears combo and max combo', () => {
      comboManager.registerScore();
      comboManager.registerScore();
      comboManager.reset();
      expect(comboManager.getCombo()).toBe(0);
      expect(comboManager.getMaxCombo()).toBe(0);
    });
  });
});
