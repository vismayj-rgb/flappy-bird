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
    this.slowMoTime = 0;
    this.shieldsCollected = 0;
    this.gemsCollected = 0;
    this.slowMoCollected = 0;
    // Particle trail
    this.particles = [];
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
    if (this.shieldTime > 0)     this.shieldTime--;
    if (this.multiplierTime > 0) this.multiplierTime--;
    if (this.slowMoTime > 0)     this.slowMoTime--;

    // Emit particle trail
    const skinColors = CONFIG.BIRD.SKINS[this.skin] || CONFIG.BIRD.SKINS.CLASSIC;
    this.particles.push({
      x: this.x + CONFIG.BIRD.WIDTH / 2,
      y: this.y + CONFIG.BIRD.HEIGHT / 2,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      life: 1.0,
      color: skinColors.body
    });
    // Update and prune particles
    this.particles = this.particles
      .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.06 }))
      .filter(p => p.life > 0);
  }

  draw(ctx) {
    // Draw particle trail BEFORE the bird (world-space, not transformed)
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life * 0.7;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4 * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

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

    if (this.slowMoTime > 0) {
      ctx.save();
      ctx.strokeStyle = CONFIG.POWERUP.COLORS.SLOW_MO;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = CONFIG.POWERUP.COLORS.SLOW_MO;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, CONFIG.BIRD.WIDTH / 2 + 11, 0, Math.PI * 2);
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
