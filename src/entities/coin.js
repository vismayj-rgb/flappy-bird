/**
 * Coin Entity & Manager
 * Collectible coins that spawn inside pipe gaps for bonus points.
 */

class Coin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 12;
    this.collected = false;
    this.age = 0; // frames alive, used for animation

    // Sparkle particles on collection
    this.sparkles = [];
  }

  update(speed) {
    this.x -= speed;
    this.age++;

    // Update sparkle particles after collection
    this.sparkles = this.sparkles
      .map(s => ({ ...s, x: s.x + s.vx, y: s.y + s.vy, life: s.life - 0.04, vy: s.vy + 0.1 }))
      .filter(s => s.life > 0);
  }

  collect() {
    this.collected = true;

    // Burst of sparkle particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = Math.random() * 3 + 1.5;
      this.sparkles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: i % 2 === 0 ? '#FFD700' : '#FFF176'
      });
    }
  }

  draw(ctx) {
    // Draw sparkles (visible even after collection)
    this.sparkles.forEach(s => {
      ctx.save();
      ctx.globalAlpha = s.life;
      ctx.fillStyle = s.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#FFD700';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 4 * s.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    if (this.collected) return;

    const pulse = Math.sin(this.age * 0.12) * 0.15 + 1; // gentle bob
    const r = this.radius * pulse;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Outer glow
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#FFD700';

    // Coin body gradient
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#FFF9C4');
    grad.addColorStop(0.5, '#FFD700');
    grad.addColorStop(1, '#F57F17');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight ring
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.15, r * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    // "$" symbol in center
    ctx.fillStyle = 'rgba(180, 100, 0, 0.85)';
    ctx.font = `bold ${Math.round(r)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText('✦', 0, 1);

    ctx.restore();
  }

  isOffScreen() {
    return this.x + this.radius < 0;
  }

  isDone() {
    // Remove once collected AND all sparkles gone, or off screen
    return (this.collected && this.sparkles.length === 0) || this.isOffScreen();
  }

  getBounds() {
    return {
      left: this.x - this.radius,
      right: this.x + this.radius,
      top: this.y - this.radius,
      bottom: this.y + this.radius
    };
  }
}

/**
 * Coin Manager
 * Spawns coins inside pipe gaps and tracks collection stats.
 */
class CoinManager {
  constructor() {
    this.coins = [];
    this.collectedThisRun = 0;
    this.totalCollected = StorageManager.get(CONFIG.STORAGE.TOTAL_COINS, 0);
    this.BONUS_POINTS = 3;
    this.SPAWN_CHANCE = 0.55; // probability a given pipe spawns a coin
  }

  reset() {
    this.coins = [];
    this.collectedThisRun = 0;
  }

  /**
   * Called when a new pipe is spawned. Optionally places a coin in its gap.
   * @param {number} pipeX   - x position of the pipe
   * @param {number} gapY    - top of the gap
   * @param {number} gapHeight - height of the gap
   */
  trySpawnForPipe(pipeX, gapY, gapHeight) {
    if (Math.random() > this.SPAWN_CHANCE) return;

    const margin = 24;
    const x = pipeX + CONFIG.PIPE.WIDTH + 30 + Math.random() * 60;
    const y = gapY + margin + Math.random() * (gapHeight - margin * 2);
    this.coins.push(new Coin(x, y));
  }

  update(speed, bird) {
    let bonusPoints = 0;

    for (const coin of this.coins) {
      coin.update(speed);

      if (!coin.collected) {
        const cb = coin.getBounds();
        const bb = bird.getBounds();

        // AABB overlap check
        if (cb.right > bb.left && cb.left < bb.right &&
            cb.bottom > bb.top && cb.top < bb.bottom) {
          coin.collect();
          this.collectedThisRun++;
          this.totalCollected++;
          StorageManager.set(CONFIG.STORAGE.TOTAL_COINS, this.totalCollected);
          bonusPoints += this.BONUS_POINTS;

          if (window.soundManager) {
            soundManager.playPowerUp();
          }

          this.showCoinPopup(coin.x, coin.y);
        }
      }
    }

    // Prune done coins
    this.coins = this.coins.filter(c => !c.isDone());

    return bonusPoints;
  }

  showCoinPopup(x, y) {
    // Show a floating "+3" text on the canvas by storing it; Game.draw() will render it
    if (!window._coinPopups) window._coinPopups = [];
    window._coinPopups.push({ x, y, life: 1.0, text: `+${this.BONUS_POINTS}` });
  }

  draw(ctx) {
    this.coins.forEach(coin => coin.draw(ctx));

    // Draw floating point popups
    if (window._coinPopups) {
      window._coinPopups = window._coinPopups
        .map(p => ({ ...p, y: p.y - 1.5, life: p.life - 0.025 }))
        .filter(p => p.life > 0);

      window._coinPopups.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FFD700';
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillText(p.text, p.x, p.y);
        ctx.restore();
      });
    }

    // Draw coin HUD (top-right corner of canvas)
    this.drawHUD(ctx);
  }

  drawHUD(ctx) {
    const x = CONFIG.CANVAS.WIDTH - 10;
    const y = 20;

    ctx.save();
    ctx.textAlign = 'right';

    // Coin icon
    ctx.font = '18px Arial';
    ctx.fillText('✦', x - 38, y + 4);

    // Count
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#000';
    ctx.fillText(this.collectedThisRun, x, y + 4);

    ctx.restore();
  }

  refreshStatsUI() {
    const el = document.getElementById('totalCoinsDisplay');
    if (el) el.textContent = this.totalCollected;
  }
}
