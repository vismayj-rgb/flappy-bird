/**
 * Collision Detection Manager
 * Handles all collision detection logic
 */

class CollisionManager {
  static checkBirdPipeCollision(bird, pipe) {
    const birdBounds = bird.getBounds();
    const pipeBounds = pipe.getBounds();
    
    // Check if bird is within pipe's x range
    if (birdBounds.right > pipeBounds.x && birdBounds.left < pipeBounds.x + pipeBounds.width) {
      // Check collision with top pipe
      if (birdBounds.top < pipeBounds.topPipe.bottom) {
        return true;
      }
      
      // Check collision with bottom pipe
      if (birdBounds.bottom > pipeBounds.bottomPipe.top) {
        return true;
      }
    }
    
    return false;
  }

  static checkBirdBoundaryCollision(bird) {
    return bird.isOutOfBounds(CONFIG.CANVAS.HEIGHT);
  }

  static checkBirdPassedPipe(bird, pipe) {
    const birdBounds = bird.getBounds();
    const pipeBounds = pipe.getBounds();
    
    // Check if bird has passed the pipe
    return !pipe.scored && birdBounds.left > pipeBounds.x + pipeBounds.width;
  }

  static checkBirdPowerUpCollision(bird, powerup) {
    if (powerup.collected) return false;
    
    const birdBounds = bird.getBounds();
    const powerUpBounds = powerup.getBounds();
    
    return (
      birdBounds.right > powerUpBounds.left &&
      birdBounds.left < powerUpBounds.right &&
      birdBounds.bottom > powerUpBounds.top &&
      birdBounds.top < powerUpBounds.bottom
    );
  }

  static checkCollisions(bird, pipes) {
    // Check boundary collision (boundary collision like ground always ends the game)
    if (this.checkBirdBoundaryCollision(bird)) {
      return { collision: true, type: 'boundary' };
    }
    
    // If shield is active, bypass pipe collisions
    if (bird.shieldTime > 0) {
      return { collision: false };
    }
    
    // Check pipe collisions
    for (const pipe of pipes) {
      if (this.checkBirdPipeCollision(bird, pipe)) {
        return { collision: true, type: 'pipe' };
      }
    }
    
    return { collision: false };
  }

  static checkScoring(bird, pipes) {
    let scored = false;
    
    for (const pipe of pipes) {
      if (this.checkBirdPassedPipe(bird, pipe)) {
        pipe.scored = true;
        scored = true;
      }
    }
    
    return scored;
  }
}
