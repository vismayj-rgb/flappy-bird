/**
 * PowerUp Entity
 * Handles individual power-up creation, movement, collection, and rendering
 */

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

  draw(ctx) {
    if (this.collected) return;

    ctx.save();
    
    // Pulse animation effect
    const pulseRadius = this.radius + Math.sin(this.pulse) * 3;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
    
    // Fill and stroke color based on type
    const color = CONFIG.POWERUP.COLORS[this.type];
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.fill();
    
    // Draw an inner icon or shape to distinguish them
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 0; // reset for text/inner shapes
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (this.type === CONFIG.POWERUP.TYPES.SHIELD) {
      ctx.font = 'bold 12px Arial';
      ctx.fillText('S', this.x, this.y);
      
      // Draw outer shield ring
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, pulseRadius - 3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.type === CONFIG.POWERUP.TYPES.DOUBLE_SCORE) {
      ctx.font = 'bold 10px Arial';
      ctx.fillText('2X', this.x, this.y);
    }
    
    ctx.restore();

    // Debug hitbox
    if (CONFIG.DEBUG) {
      ctx.strokeStyle = 'blue';
      ctx.strokeRect(this.x - this.radius, this.y - this.radius, this.width, this.height);
    }
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

/**
 * PowerUp Manager
 * Manages power-up spawning, updating, and drawing
 */
class PowerUpManager {
  constructor() {
    this.powerups = [];
  }

  reset() {
    this.powerups = [];
  }

  spawn(pipeX, pipeGapY, pipeGapHeight) {
    // Determine if we should spawn a powerup
    if (Math.random() > CONFIG.POWERUP.SPAWN_CHANCE) {
      return;
    }

    // Spawn in the middle of the pipe's gap
    const x = pipeX + CONFIG.PIPE.WIDTH / 2;
    const y = pipeGapY + pipeGapHeight / 2;
    
    // Random type
    const types = Object.values(CONFIG.POWERUP.TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    
    this.powerups.push(new PowerUp(x, y, type));
  }

  update(speed) {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      this.powerups[i].update(speed);
      
      // Remove off-screen or collected power-ups
      if (this.powerups[i].isOffScreen() || this.powerups[i].collected) {
        this.powerups.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    this.powerups.forEach(powerup => powerup.draw(ctx));
  }

  getPowerUps() {
    return this.powerups;
  }
}
