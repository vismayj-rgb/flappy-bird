/**
 * Powerup Manager
 * Spawns temporary powerups (shield, slow-motion) during gameplay
 */

class PowerupManager {
  constructor() {
    this.active = [];
    this.spawnChance = 0.02;
    this.types = ['SHIELD', 'SLOW_MO'];
  }

  update(bird) {
    if (Math.random() < this.spawnChance) {
      this.active.push({
        type: this.types[Math.floor(Math.random() * 3)],
        x: CONFIG.CANVAS.WIDTH,
        y: Math.random() * CONFIG.CANVAS.HEIGHT,
        expires: Date.now() + 5000
      });
    }

    // Remove expired powerups while iterating
    for (let i = 0; i < this.active.length; i++) {
      if (this.active[i].expires < Date.now()) {
        this.active.splice(i, 1);
      }
      this.active[i].x -= CONFIG.PIPE.SPEED;
    }

    this.checkPickup(bird);
  }

  checkPickup(bird) {
    this.active.forEach((p) => {
      if (Math.abs(bird.x - p.x) < 20 && Math.abs(bird.y - p.y) < 20) {
        bird.powerup = p.type;
        setTimeout(() => {
          bird.powerup = null;
        }, 5000);
      }
    });
  }
}
