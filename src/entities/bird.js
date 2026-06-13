/**
 * Bird Entity
 * Handles all bird-related logic including physics (with weather wind adjustments),
 * custom particle trails per skin, rendering, and powerups.
 */

class Bird {
  constructor() {
    this.rainbowHue = 0;
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
    this.particles = [];
  }

  jump() {
    // Jump force
    this.velocity = CONFIG.PHYSICS.JUMP_FORCE;
    
    // Play jump sound if available
    if (window.soundManager) {
      soundManager.playJump();
    }
  }

  update() {
    // 1. Physics: Apply gravity
    this.velocity += CONFIG.PHYSICS.GRAVITY;
    
    // 2. Weather: Apply wind forces if gameplay is active
    if (window.game && window.game.state === CONFIG.STATES.PLAYING && window.game.currentWind) {
      const wind = window.game.currentWind;
      
      // Vertical wind force (e.g. rain pushing down)
      this.velocity += wind.y;
      
      // Horizontal wind force (e.g. storm pushing back, snow pulling forward)
      this.x += wind.x;
      
      // Return bird gently to start X if no wind
      if (wind.x === 0) {
        this.x += (CONFIG.BIRD.START_X - this.x) * 0.05;
      }
      
      // Clamp horizontal bounds so bird doesn't fly off screen
      this.x = Math.max(40, Math.min(220, this.x));
    } else {
      // Return gently to start X when not playing/no wind
      this.x += (CONFIG.BIRD.START_X - this.x) * 0.05;
    }

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

    // 3. Custom Skin Trails
    const skinColors = CONFIG.BIRD.SKINS[this.skin] || CONFIG.BIRD.SKINS.CLASSIC;
    let particleColor = skinColors.body;
    let particleSize = 4.0;
    let particleLifeLoss = 0.06;
    let isSpark = false;

    if (this.skin === 'PHOENIX') {
      // Fire colors
      particleColor = Math.random() > 0.4 ? '#FF5722' : '#FFC107';
      particleSize = Math.random() * 5 + 3;
    } else if (this.skin === 'RAINBOW') {
      this.rainbowHue = (this.rainbowHue + 4) % 360;
      particleColor = `hsl(${this.rainbowHue}, 100%, 50%)`;
      particleSize = 6;
      particleLifeLoss = 0.04;
    } else if (this.skin === 'BAT') {
      // Shadow mist
      particleColor = Math.random() > 0.5 ? '#1A0B2E' : '#4A154B';
      particleSize = Math.random() * 6 + 2;
      particleLifeLoss = 0.05;
    } else if (this.skin === 'ROBO') {
      // Blue electrical sparks
      particleColor = '#00E5FF';
      isSpark = true;
      particleLifeLoss = 0.1;
    }

    this.particles.push({
      x: this.x + CONFIG.BIRD.WIDTH / 2,
      y: this.y + CONFIG.BIRD.HEIGHT / 2,
      vx: (Math.random() - 0.5) * (isSpark ? 3 : 1.2) - (window.game && window.game.pipeManager ? window.game.pipeManager.speed * 0.1 : 0.3),
      vy: (Math.random() - 0.5) * (isSpark ? 3 : 1.2),
      life: 1.0,
      size: particleSize,
      color: particleColor,
      isSpark: isSpark
    });

    // Update and prune particles
    this.particles = this.particles
      .map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        life: p.life - particleLifeLoss
      }))
      .filter(p => p.life > 0);
  }

  draw(ctx) {
    // Draw particle trails
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life * 0.8;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = p.isSpark ? 10 : 5;
      ctx.shadowColor = p.color;
      
      ctx.beginPath();
      if (p.isSpark) {
        // Draw little spark lines
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + (Math.random() - 0.5) * 8, p.y + (Math.random() - 0.5) * 8);
        ctx.stroke();
      } else {
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
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
    
    // Cyber or red eyes for dark skins
    ctx.fillStyle = (this.skin === 'BAT' || this.skin === 'ROBO') ? '#FF0000' : '#000000';
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
