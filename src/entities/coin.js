/**
 * Coin Entity
 * Handles individual gold coin rendering, movement, and collision bounds
 */

class Coin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = CONFIG.COIN.RADIUS;
    this.collected = false;
    this.angle = Math.random() * Math.PI * 2; // For shiny spin effect
  }

  update(speed) {
    this.x -= speed;
    this.angle += 0.08;
  }

  draw(ctx) {
    if (this.collected) return;

    ctx.save();
    
    // Glowing shadow
    ctx.shadowBlur = 8;
    ctx.shadowColor = CONFIG.COIN.COLOR;
    
    // Draw outer coin body (gold)
    ctx.fillStyle = CONFIG.COIN.COLOR;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw inner border (darker gold)
    ctx.strokeStyle = CONFIG.COIN.SHADOW_COLOR;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius - 2, 0, Math.PI * 2);
    ctx.stroke();

    // Draw rotating shiny shine line
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const cosVal = Math.cos(this.angle) * (this.radius - 3);
    const sinVal = Math.sin(this.angle) * (this.radius - 3);
    ctx.moveTo(this.x - cosVal, this.y - sinVal);
    ctx.lineTo(this.x + cosVal, this.y + sinVal);
    ctx.stroke();

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
