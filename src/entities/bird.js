/**
 * Bird Entity
 * Handles all bird-related logic including physics, rendering, and state
 */

class Bird {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = CONFIG.BIRD.START_X;
    this.y = CONFIG.BIRD.START_Y;
    this.velocity = 0;
    this.rotation = 0;
    this.skin = (typeof StorageManager !== 'undefined') ? StorageManager.get(CONFIG.STORAGE.BIRD_SKIN, 'CLASSIC') : 'CLASSIC';
    this.shieldTime = 0;
    this.multiplierTime = 0;
  }

  jump() {
    this.velocity = CONFIG.PHYSICS.JUMP_FORCE;
    
    // Play jump sound if available
    if (window.soundManager) {
      soundManager.playJump();
    }
  }

  update() {
    // Apply gravity
    this.velocity += CONFIG.PHYSICS.GRAVITY;
    
    // Limit maximum fall speed
    if (this.velocity > CONFIG.PHYSICS.MAX_VELOCITY) {
      this.velocity = CONFIG.PHYSICS.MAX_VELOCITY;
    }
    
    // Update position
    this.y += this.velocity;
    
    // Update rotation based on velocity
    this.rotation = Math.min(Math.max(this.velocity * CONFIG.BIRD.ROTATION_SPEED, -30), 90);

    // Update power-up durations
    if (this.shieldTime > 0) {
      this.shieldTime--;
    }
    if (this.multiplierTime > 0) {
      this.multiplierTime--;
    }
  }

  draw(ctx) {
    ctx.save();
    
    // Move to bird position
    ctx.translate(this.x + CONFIG.BIRD.WIDTH / 2, this.y + CONFIG.BIRD.HEIGHT / 2);
    
    // Rotate based on velocity
    ctx.rotate((this.rotation * Math.PI) / 180);
    
    // Get skin colors
    const skinColors = CONFIG.BIRD.SKINS[this.skin] || CONFIG.BIRD.SKINS.CLASSIC;

    // Draw active power-up effects
    if (this.shieldTime > 0) {
      ctx.save();
      ctx.strokeStyle = CONFIG.POWERUP.COLORS.SHIELD;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = CONFIG.POWERUP.COLORS.SHIELD;
      ctx.beginPath();
      ctx.arc(0, 0, CONFIG.BIRD.WIDTH / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (this.multiplierTime > 0) {
      ctx.save();
      ctx.strokeStyle = CONFIG.POWERUP.COLORS.DOUBLE_SCORE;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, CONFIG.BIRD.WIDTH / 2 + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    
    // Draw bird body
    ctx.fillStyle = skinColors.body;
    ctx.beginPath();
    ctx.arc(0, 0, CONFIG.BIRD.WIDTH / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bird wing
    ctx.fillStyle = skinColors.wing;
    ctx.beginPath();
    ctx.ellipse(-5, 0, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bird eye
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(5, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(6, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bird beak
    ctx.fillStyle = skinColors.beak;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(18, -3);
    ctx.lineTo(18, 3);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // Debug hitbox
    if (CONFIG.DEBUG) {
      ctx.strokeStyle = 'red';
      ctx.strokeRect(this.x, this.y, CONFIG.BIRD.WIDTH, CONFIG.BIRD.HEIGHT);
    }
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
