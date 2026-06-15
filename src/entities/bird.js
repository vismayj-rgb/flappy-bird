/**
 * Bird Entity
 * Handles all bird-related logic including physics (low gravity override),
 * size scaling (tiny bird override), wobble movement (drunk override), particle trails, and jump smoke puffs.
 */

class Bird {
  constructor() {
    this.wobbleAngle = 0;
    this.reset();
  }

  reset() {
    // Retrieve size based on mutators
    const isTiny = window.mutatorManager && mutatorManager.isActive('tiny_bird');
    this.width = isTiny ? CONFIG.BIRD.WIDTH * 0.5 : CONFIG.BIRD.WIDTH;
    this.height = isTiny ? CONFIG.BIRD.HEIGHT * 0.5 : CONFIG.BIRD.HEIGHT;

    this.x = CONFIG.BIRD.START_X;
    this.y = CONFIG.BIRD.START_Y;
    this.velocity = 0;
    this.rotation = 0;
    this.skin = (typeof StorageManager !== 'undefined') ? StorageManager.get(CONFIG.STORAGE.BIRD_SKIN, 'CLASSIC') : 'CLASSIC';
    this.particles = [];
  }

  jump() {
    const lowGravity = window.mutatorManager && mutatorManager.isActive('low_gravity');
    this.velocity = lowGravity ? CONFIG.PHYSICS.JUMP_FORCE * 0.65 : CONFIG.PHYSICS.JUMP_FORCE;
    
    // Spawn white jump smoke puffs
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: this.x,
        y: this.y + this.height / 2,
        vx: -Math.random() * 2 - 1,
        vy: (Math.random() - 0.5) * 1.5,
        life: 1.0,
        color: 'rgba(235, 235, 235, 0.85)',
        size: Math.random() * 6 + 4,
        isPuff: true
      });
    }

    // Play jump sound if available
    if (window.soundManager) {
      soundManager.playJump();
    }
  }

  update() {
    // 1. Mutator: Floaty Gravity override
    const lowGravity = window.mutatorManager && mutatorManager.isActive('low_gravity');
    const gravity = lowGravity ? CONFIG.PHYSICS.GRAVITY * 0.4 : CONFIG.PHYSICS.GRAVITY;
    
    // Apply gravity
    this.velocity += gravity;
    
    // Limit maximum fall speed
    if (this.velocity > CONFIG.PHYSICS.MAX_VELOCITY) {
      this.velocity = CONFIG.PHYSICS.MAX_VELOCITY;
    }
    
    // Update position
    this.y += this.velocity;

    // 2. Mutator: Drunk Mode wobble
    const isDrunk = window.mutatorManager && mutatorManager.isActive('drunk_mode');
    if (isDrunk && window.game && window.game.state === CONFIG.STATES.PLAYING) {
      this.wobbleAngle += 0.12;
      this.x += Math.sin(this.wobbleAngle) * 2;
      // Keep within bounds
      this.x = Math.max(30, Math.min(250, this.x));
    } else {
      // Return gently to starting X
      this.x += (CONFIG.BIRD.START_X - this.x) * 0.05;
    }
    
    // Update rotation based on velocity
    this.rotation = Math.min(Math.max(this.velocity * CONFIG.BIRD.ROTATION_SPEED, -30), 90);

    // Emit standard particle trail
    const skinColors = CONFIG.BIRD.SKINS[this.skin] || CONFIG.BIRD.SKINS.CLASSIC;
    this.particles.push({
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      life: 1.0,
      color: skinColors.body,
      size: 4 * (this.width / CONFIG.BIRD.WIDTH),
      isPuff: false
    });

    // Update and prune particles
    this.particles = this.particles
      .map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        life: p.life - (p.isPuff ? 0.08 : 0.06)
      }))
      .filter(p => p.life > 0);
  }

  draw(ctx) {
    // Draw particle trails
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life * (p.isPuff ? 0.6 : 0.7);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.save();
    
    // Move to bird center
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);
    
    // Get skin colors
    const skinColors = CONFIG.BIRD.SKINS[this.skin] || CONFIG.BIRD.SKINS.CLASSIC;
    
    // Draw bird body scaled
    ctx.fillStyle = skinColors.body;
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bird wing scaled
    ctx.fillStyle = skinColors.wing;
    ctx.beginPath();
    ctx.ellipse(-this.width * 0.15, 0, this.width * 0.23, this.height * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bird eye scaled
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(this.width * 0.15, -this.height * 0.2, this.width * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(this.width * 0.18, -this.height * 0.16, this.width * 0.09, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bird beak scaled
    ctx.fillStyle = skinColors.beak;
    ctx.beginPath();
    ctx.moveTo(this.width * 0.3, 0);
    ctx.lineTo(this.width * 0.53, -this.height * 0.12);
    ctx.lineTo(this.width * 0.53, this.height * 0.12);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // Debug hitbox
    if (CONFIG.DEBUG) {
      ctx.strokeStyle = 'red';
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }

  isOutOfBounds(canvasHeight) {
    return this.y < 0 || this.y + this.height > canvasHeight - CONFIG.VISUALS.GROUND_HEIGHT;
  }
}
