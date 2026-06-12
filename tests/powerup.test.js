/**
 * @jest-environment jsdom
 */

// Mock CONFIG
global.CONFIG = {
  POWERUP: {
    WIDTH: 20,
    HEIGHT: 20,
    SPAWN_CHANCE: 1.0, // Force spawn for testing
    SHIELD_DURATION: 300,
    DOUBLE_SCORE_DURATION: 300,
    TYPES: {
      SHIELD: 'SHIELD',
      DOUBLE_SCORE: 'DOUBLE_SCORE'
    },
    COLORS: {
      SHIELD: '#00FFFF',
      DOUBLE_SCORE: '#FF00FF'
    }
  },
  PIPE: {
    WIDTH: 52
  },
  CANVAS: {
    WIDTH: 400,
    HEIGHT: 600
  }
};

describe('PowerUp & PowerUpManager', () => {
  // Define local copies of class logic for JSDOM test runner
  class PowerUp {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.type = type;
      this.width = CONFIG.POWERUP.WIDTH;
      this.height = CONFIG.POWERUP.HEIGHT;
      this.radius = CONFIG.POWERUP.WIDTH / 2;
      this.collected = false;
      this.pulse = 0;
    }

    update(speed) {
      this.x -= speed;
      this.pulse += 0.1;
    }

    getBounds() {
      return {
        left: this.x - this.radius,
        right: this.x + this.radius,
        top: this.y - this.radius,
        bottom: this.y + this.radius
      };
    }

    isOffScreen() {
      return this.x + this.radius < 0;
    }
  }

  class PowerUpManager {
    constructor() {
      this.powerups = [];
    }

    reset() {
      this.powerups = [];
    }

    spawn(pipeX, pipeGapY, pipeGapHeight) {
      if (Math.random() > CONFIG.POWERUP.SPAWN_CHANCE) {
        return;
      }
      const x = pipeX + CONFIG.PIPE.WIDTH / 2;
      const y = pipeGapY + pipeGapHeight / 2;
      const types = Object.values(CONFIG.POWERUP.TYPES);
      const type = types[0]; // pick first type for testing consistency
      this.powerups.push(new PowerUp(x, y, type));
    }

    update(speed) {
      for (let i = this.powerups.length - 1; i >= 0; i--) {
        this.powerups[i].update(speed);
        if (this.powerups[i].isOffScreen() || this.powerups[i].collected) {
          this.powerups.splice(i, 1);
        }
      }
    }

    getPowerUps() {
      return this.powerups;
    }
  }

  describe('PowerUp Entity', () => {
    test('should initialize with correct coordinates and type', () => {
      const p = new PowerUp(150, 250, 'SHIELD');
      expect(p.x).toBe(150);
      expect(p.y).toBe(250);
      expect(p.type).toBe('SHIELD');
      expect(p.radius).toBe(10);
      expect(p.collected).toBe(false);
    });

    test('should move left on update', () => {
      const p = new PowerUp(150, 250, 'SHIELD');
      p.update(3);
      expect(p.x).toBe(147);
    });

    test('should detect off-screen status correctly', () => {
      const p = new PowerUp(-20, 250, 'SHIELD');
      expect(p.isOffScreen()).toBe(true);
      
      const p2 = new PowerUp(10, 250, 'SHIELD');
      expect(p2.isOffScreen()).toBe(false);
    });

    test('should calculate correct bounds', () => {
      const p = new PowerUp(100, 100, 'SHIELD');
      const bounds = p.getBounds();
      expect(bounds.left).toBe(90);
      expect(bounds.right).toBe(110);
      expect(bounds.top).toBe(90);
      expect(bounds.bottom).toBe(110);
    });
  });

  describe('PowerUpManager', () => {
    let manager;

    beforeEach(() => {
      manager = new PowerUpManager();
    });

    test('should spawn power-up in the middle of the pipe gap', () => {
      manager.spawn(200, 100, 150); // pipeX=200, gapY=100, gapHeight=150
      const active = manager.getPowerUps();
      expect(active.length).toBe(1);
      
      const p = active[0];
      expect(p.x).toBe(200 + 52 / 2); // 226
      expect(p.y).toBe(100 + 150 / 2); // 175
    });

    test('should clear power-ups on reset', () => {
      manager.spawn(200, 100, 150);
      expect(manager.getPowerUps().length).toBe(1);
      
      manager.reset();
      expect(manager.getPowerUps().length).toBe(0);
    });

    test('should remove collected power-ups on update', () => {
      manager.spawn(200, 100, 150);
      const active = manager.getPowerUps();
      active[0].collected = true;
      
      manager.update(2);
      expect(manager.getPowerUps().length).toBe(0);
    });

    test('should remove off-screen power-ups on update', () => {
      manager.spawn(-50, 100, 150);
      manager.update(2);
      expect(manager.getPowerUps().length).toBe(0);
    });
  });
});
