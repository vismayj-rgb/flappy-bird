/**
 * Boss Entity & Projectiles
 * Handles Boss states, movement (smooth vertical hover), attack patterns (firing fireballs),
 * and homing missiles that players launch when collecting energy orbs.
 */

class Boss {
  constructor() {
    this.width = CONFIG.BOSS.WIDTH;
    this.height = CONFIG.BOSS.HEIGHT;
    this.reset();
  }

  reset() {
    this.x = CONFIG.CANVAS.WIDTH + 150; // spawn offscreen right
    this.y = CONFIG.CANVAS.HEIGHT / 3;
    this.health = CONFIG.BOSS.HEALTH;
    this.maxHealth = CONFIG.BOSS.HEALTH;
    this.hoverAngle = 0;
    this.fireTimer = 0;
    this.introFinished = false;
    this.wingAngle = 0;
  }

  update() {
    // Intro slide in
    if (!this.introFinished) {
      this.x -= 2;
      if (this.x <= CONFIG.CANVAS.WIDTH - this.width - 20) {
        this.introFinished = true;
      }
    } else {
      // Sine wave hovering movement
      this.hoverAngle += 0.04;
      this.y = (CONFIG.CANVAS.HEIGHT / 2 - 100) + Math.sin(this.hoverAngle) * 120;
      
      // Shoot fireballs
      this.fireTimer++;
      if (this.fireTimer >= CONFIG.BOSS.FIRE_INTERVAL) {
        this.fireTimer = 0;
        this.shoot();
      }
    }

    // Wing animation
    this.wingAngle += 0.15;
  }

  shoot() {
    if (window.game && window.game.bossProjectiles) {
      window.game.bossProjectiles.push(
        new Fireball(this.x, this.y + this.height / 2)
      );
      if (window.soundManager) {
        soundManager.playTone(180, 0.15, 'sawtooth'); // deep bass shot tone
      }
    }
  }

  takeDamage() {
    this.health--;
    if (window.soundManager) {
      soundManager.playTone(300, 0.2, 'triangle'); // high pitch hit tone
    }
    return this.health <= 0;
  }

  draw(ctx) {
    ctx.save();

    // 1. Draw Health Bar
    const barWidth = 60;
    const barHeight = 6;
    const barX = this.x + (this.width - barWidth) / 2;
    const barY = this.y - 15;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const healthRatio = Math.max(0, this.health / this.maxHealth);
    ctx.fillStyle = healthRatio > 0.5 ? '#E53E3E' : '#FF8C00';
    ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
    
    // Health bar border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // 2. Draw mechanical Boss body (cybernetic bird/dragon)
    ctx.fillStyle = CONFIG.BOSS.COLOR;
    ctx.strokeStyle = '#4A5568';
    ctx.lineWidth = 2;

    // Body main circle (metallic look)
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.height / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cyber eye (glowing red)
    ctx.fillStyle = '#FF0000';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FF0000';
    ctx.beginPath();
    ctx.arc(this.x + 18, this.y + this.height / 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow

    // Mechanical beak
    ctx.fillStyle = '#A0AEC0';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.height / 2.5);
    ctx.lineTo(this.x - 22, this.y + this.height / 2);
    ctx.lineTo(this.x, this.y + this.height / 1.8);
    ctx.closePath();
    ctx.fill();

    // Flapping steel wing
    ctx.save();
    ctx.translate(this.x + this.width / 2 + 10, this.y + this.height / 2);
    const wingSweep = Math.sin(this.wingAngle) * 0.7;
    ctx.rotate(wingSweep);
    ctx.fillStyle = '#4A5568';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 24, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }
}

/**
 * Fireball Projectile (shot by Boss)
 */
class Fireball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = CONFIG.BOSS.FIREBALL_RADIUS;
    this.speed = CONFIG.BOSS.FIREBALL_SPEED;
    this.animation = 0;
  }

  update() {
    this.x -= this.speed;
    this.animation += 0.15;
  }

  draw(ctx) {
    ctx.save();

    const glowRadius = this.radius + Math.sin(this.animation) * 2;
    
    // Draw fire gradient
    const grad = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, glowRadius);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.3, '#FF8C00');
    grad.addColorStop(1, '#FF0000');

    ctx.fillStyle = grad;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#FF3300';
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
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
 * Energy Orb (spawns during Boss Battle for player to collect)
 */
class EnergyOrb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = CONFIG.BOSS.ENERGY_ORB_RADIUS;
    this.collected = false;
    this.pulse = 0;
  }

  update(speed) {
    this.x -= speed;
    this.pulse += 0.12;
  }

  draw(ctx) {
    if (this.collected) return;

    ctx.save();
    const pulseRadius = this.radius + Math.sin(this.pulse) * 2.5;

    ctx.fillStyle = '#00E676'; // vibrant neon green
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00E676';
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseRadius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
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
 * Homing Missile (flies from Bird to Boss)
 */
class HomingMissile {
  constructor(startX, startY, targetBoss) {
    this.x = startX;
    this.y = startY;
    this.target = targetBoss;
    this.speed = 6.5;
    this.radius = 5;
    this.exploded = false;
    this.particles = [];
  }

  update() {
    if (this.exploded) {
      // Update explosion particles
      this.particles = this.particles
        .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.08 }))
        .filter(p => p.life > 0);
      return;
    }

    // Direct homing vector
    const dx = this.target.x + this.target.width / 2 - this.x;
    const dy = this.target.y + this.target.height / 2 - this.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 15) {
      this.triggerExplosion();
      const bossDead = this.target.takeDamage();
      if (bossDead && window.game) {
        window.game.defeatBoss();
      }
      return;
    }

    // Move towards boss
    this.x += (dx / distance) * this.speed;
    this.y += (dy / distance) * this.speed;
  }

  triggerExplosion() {
    this.exploded = true;
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        color: Math.random() > 0.5 ? '#00E676' : '#FFFF00'
      });
    }
  }

  draw(ctx) {
    if (this.exploded) {
      this.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      return;
    }

    ctx.save();
    ctx.fillStyle = '#00FFCC';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00FFCC';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
