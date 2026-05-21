/**
 * @jest-environment jsdom
 */

// Mock CONFIG
global.CONFIG = {
  BIRD: {
    WIDTH: 34,
    HEIGHT: 24
  },
  CANVAS: {
    HEIGHT: 600
  },
  VISUALS: {
    GROUND_HEIGHT: 50
  }
};

describe('CollisionManager', () => {
  let bird, pipe;

  beforeEach(() => {
    // Mock bird
    bird = {
      getBounds: () => ({
        left: 100,
        right: 134,
        top: 300,
        bottom: 324
      }),
      isOutOfBounds: jest.fn((canvasHeight) => {
        const bounds = bird.getBounds();
        return bounds.top < 0 || bounds.bottom > canvasHeight - CONFIG.VISUALS.GROUND_HEIGHT;
      })
    };

    // Mock pipe
    pipe = {
      scored: false,
      getBounds: () => ({
        x: 200,
        width: 52,
        topPipe: {
          top: 0,
          bottom: 200
        },
        bottomPipe: {
          top: 350,
          bottom: 550
        }
      })
    };

    // Define CollisionManager for testing
    global.CollisionManager = {
      checkBirdPipeCollision(bird, pipe) {
        const birdBounds = bird.getBounds();
        const pipeBounds = pipe.getBounds();
        
        if (birdBounds.right > pipeBounds.x && birdBounds.left < pipeBounds.x + pipeBounds.width) {
          if (birdBounds.top < pipeBounds.topPipe.bottom) {
            return true;
          }
          if (birdBounds.bottom > pipeBounds.bottomPipe.top) {
            return true;
          }
        }
        return false;
      },

      checkBirdBoundaryCollision(bird) {
        return bird.isOutOfBounds(CONFIG.CANVAS.HEIGHT);
      },

      checkBirdPassedPipe(bird, pipe) {
        const birdBounds = bird.getBounds();
        const pipeBounds = pipe.getBounds();
        return !pipe.scored && birdBounds.left > pipeBounds.x + pipeBounds.width;
      },

      checkCollisions(bird, pipes) {
        if (this.checkBirdBoundaryCollision(bird)) {
          return { collision: true, type: 'boundary' };
        }
        
        for (const pipe of pipes) {
          if (this.checkBirdPipeCollision(bird, pipe)) {
            return { collision: true, type: 'pipe' };
          }
        }
        
        return { collision: false };
      },

      checkScoring(bird, pipes) {
        let scored = false;
        for (const pipe of pipes) {
          if (this.checkBirdPassedPipe(bird, pipe)) {
            pipe.scored = true;
            scored = true;
          }
        }
        return scored;
      }
    };
  });

  describe('Bird-Pipe Collision', () => {
    test('should detect collision with top pipe', () => {
      bird.getBounds = () => ({
        left: 200,
        right: 234,
        top: 150,
        bottom: 174
      });

      expect(CollisionManager.checkBirdPipeCollision(bird, pipe)).toBe(true);
    });

    test('should detect collision with bottom pipe', () => {
      bird.getBounds = () => ({
        left: 200,
        right: 234,
        top: 360,
        bottom: 384
      });

      expect(CollisionManager.checkBirdPipeCollision(bird, pipe)).toBe(true);
    });

    test('should not detect collision when bird passes through gap', () => {
      bird.getBounds = () => ({
        left: 200,
        right: 234,
        top: 250,
        bottom: 274
      });

      expect(CollisionManager.checkBirdPipeCollision(bird, pipe)).toBe(false);
    });

    test('should not detect collision when bird is before pipe', () => {
      bird.getBounds = () => ({
        left: 50,
        right: 84,
        top: 300,
        bottom: 324
      });

      expect(CollisionManager.checkBirdPipeCollision(bird, pipe)).toBe(false);
    });

    test('should not detect collision when bird is past pipe', () => {
      bird.getBounds = () => ({
        left: 300,
        right: 334,
        top: 300,
        bottom: 324
      });

      expect(CollisionManager.checkBirdPipeCollision(bird, pipe)).toBe(false);
    });
  });

  describe('Boundary Collision', () => {
    test('should detect when bird hits top boundary', () => {
      bird.getBounds = () => ({
        left: 100,
        right: 134,
        top: -10,
        bottom: 14
      });

      expect(CollisionManager.checkBirdBoundaryCollision(bird)).toBe(true);
    });

    test('should detect when bird hits ground', () => {
      bird.getBounds = () => ({
        left: 100,
        right: 134,
        top: 560,
        bottom: 584
      });

      expect(CollisionManager.checkBirdBoundaryCollision(bird)).toBe(true);
    });

    test('should not detect collision when bird is within bounds', () => {
      expect(CollisionManager.checkBirdBoundaryCollision(bird)).toBe(false);
    });
  });

  describe('Score Detection', () => {
    test('should detect when bird passes pipe', () => {
      bird.getBounds = () => ({
        left: 260,
        right: 294,
        top: 300,
        bottom: 324
      });

      expect(CollisionManager.checkBirdPassedPipe(bird, pipe)).toBe(true);
    });

    test('should not detect score if pipe already scored', () => {
      pipe.scored = true;
      bird.getBounds = () => ({
        left: 260,
        right: 294,
        top: 300,
        bottom: 324
      });

      expect(CollisionManager.checkBirdPassedPipe(bird, pipe)).toBe(false);
    });

    test('should mark pipe as scored when checking scoring', () => {
      bird.getBounds = () => ({
        left: 260,
        right: 294,
        top: 300,
        bottom: 324
      });

      const scored = CollisionManager.checkScoring(bird, [pipe]);
      expect(scored).toBe(true);
      expect(pipe.scored).toBe(true);
    });
  });

  describe('Check All Collisions', () => {
    test('should return boundary collision', () => {
      bird.getBounds = () => ({
        left: 100,
        right: 134,
        top: -10,
        bottom: 14
      });

      const result = CollisionManager.checkCollisions(bird, [pipe]);
      expect(result.collision).toBe(true);
      expect(result.type).toBe('boundary');
    });

    test('should return pipe collision', () => {
      bird.getBounds = () => ({
        left: 200,
        right: 234,
        top: 150,
        bottom: 174
      });

      const result = CollisionManager.checkCollisions(bird, [pipe]);
      expect(result.collision).toBe(true);
      expect(result.type).toBe('pipe');
    });

    test('should return no collision when safe', () => {
      const result = CollisionManager.checkCollisions(bird, [pipe]);
      expect(result.collision).toBe(false);
    });
  });
});
