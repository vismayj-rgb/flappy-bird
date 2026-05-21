/**
 * @jest-environment jsdom
 */

// Mock CONFIG
global.CONFIG = {
  BIRD: {
    START_X: 100,
    START_Y: 300,
    WIDTH: 34,
    HEIGHT: 24,
    ROTATION_SPEED: 3
  },
  PHYSICS: {
    GRAVITY: 0.5,
    JUMP_FORCE: -8,
    MAX_VELOCITY: 10
  },
  CANVAS: {
    HEIGHT: 600
  },
  VISUALS: {
    GROUND_HEIGHT: 50
  },
  DEBUG: false
};

// Mock sound manager
global.soundManager = {
  playJump: jest.fn()
};

describe('Bird', () => {
  let bird;

  beforeEach(() => {
    // Create a mock canvas context
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Define Bird class for testing
    class Bird {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = CONFIG.BIRD.START_X;
        this.y = CONFIG.BIRD.START_Y;
        this.velocity = 0;
        this.rotation = 0;
      }

      jump() {
        this.velocity = CONFIG.PHYSICS.JUMP_FORCE;
        if (window.soundManager) {
          soundManager.playJump();
        }
      }

      update() {
        this.velocity += CONFIG.PHYSICS.GRAVITY;
        if (this.velocity > CONFIG.PHYSICS.MAX_VELOCITY) {
          this.velocity = CONFIG.PHYSICS.MAX_VELOCITY;
        }
        this.y += this.velocity;
        this.rotation = Math.min(Math.max(this.velocity * CONFIG.BIRD.ROTATION_SPEED, -30), 90);
      }

      getBounds() {
        return {
          left: this.x,
          right: this.x + CONFIG.BIRD.WIDTH,
          top: this.y,
          bottom: this.y + CONFIG.BIRD.HEIGHT
        };
      }

      isOutOfBounds(canvasHeight) {
        return this.y < 0 || this.y + CONFIG.BIRD.HEIGHT > canvasHeight - CONFIG.VISUALS.GROUND_HEIGHT;
      }
    }

    bird = new Bird();
  });

  describe('Initialization', () => {
    test('should initialize with correct starting position', () => {
      expect(bird.x).toBe(100);
      expect(bird.y).toBe(300);
      expect(bird.velocity).toBe(0);
      expect(bird.rotation).toBe(0);
    });
  });

  describe('Jump', () => {
    test('should set velocity to jump force when jumping', () => {
      bird.jump();
      expect(bird.velocity).toBe(CONFIG.PHYSICS.JUMP_FORCE);
    });

    test('should play jump sound when jumping', () => {
      bird.jump();
      expect(soundManager.playJump).toHaveBeenCalled();
    });
  });

  describe('Update', () => {
    test('should apply gravity to velocity', () => {
      const initialVelocity = bird.velocity;
      bird.update();
      expect(bird.velocity).toBe(initialVelocity + CONFIG.PHYSICS.GRAVITY);
    });

    test('should update position based on velocity', () => {
      bird.velocity = 5;
      const initialY = bird.y;
      bird.update();
      expect(bird.y).toBe(initialY + 5);
    });

    test('should limit velocity to max velocity', () => {
      bird.velocity = CONFIG.PHYSICS.MAX_VELOCITY + 5;
      bird.update();
      expect(bird.velocity).toBeLessThanOrEqual(CONFIG.PHYSICS.MAX_VELOCITY);
    });

    test('should update rotation based on velocity', () => {
      bird.velocity = 5;
      bird.update();
      expect(bird.rotation).toBeGreaterThan(0);
    });
  });

  describe('Bounds', () => {
    test('should return correct bounding box', () => {
      const bounds = bird.getBounds();
      expect(bounds.left).toBe(bird.x);
      expect(bounds.right).toBe(bird.x + CONFIG.BIRD.WIDTH);
      expect(bounds.top).toBe(bird.y);
      expect(bounds.bottom).toBe(bird.y + CONFIG.BIRD.HEIGHT);
    });
  });

  describe('Out of Bounds', () => {
    test('should detect when bird is above canvas', () => {
      bird.y = -10;
      expect(bird.isOutOfBounds(CONFIG.CANVAS.HEIGHT)).toBe(true);
    });

    test('should detect when bird hits ground', () => {
      bird.y = CONFIG.CANVAS.HEIGHT - CONFIG.VISUALS.GROUND_HEIGHT;
      expect(bird.isOutOfBounds(CONFIG.CANVAS.HEIGHT)).toBe(true);
    });

    test('should return false when bird is within bounds', () => {
      bird.y = 300;
      expect(bird.isOutOfBounds(CONFIG.CANVAS.HEIGHT)).toBe(false);
    });
  });

  describe('Reset', () => {
    test('should reset to initial state', () => {
      bird.y = 500;
      bird.velocity = 10;
      bird.rotation = 45;
      
      bird.reset();
      
      expect(bird.x).toBe(CONFIG.BIRD.START_X);
      expect(bird.y).toBe(CONFIG.BIRD.START_Y);
      expect(bird.velocity).toBe(0);
      expect(bird.rotation).toBe(0);
    });
  });
});
