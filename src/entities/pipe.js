/**
 * Pipe Entity
 * Handles individual pipe creation, movement, and rendering
 */

class Pipe {
  constructor(x, gapY) {
    this.x = x;
    this.gapY = gapY;
    this.width = CONFIG.PIPE.WIDTH;
    this.gapHeight = CONFIG.PIPE.GAP_HEIGHT;
    this.scored = false;
  }

  update(speed) {
    this.x -= speed;
  }

  draw(ctx, themeColors = null) {
    const canvasHeight = CONFIG.CANVAS.HEIGHT;
    const groundHeight = CONFIG.VISUALS.GROUND_HEIGHT;
    
    const colorTop = themeColors ? themeColors.PIPE_COLOR_TOP : CONFIG.PIPE.COLOR_TOP;
    const colorBottom = themeColors ? themeColors.PIPE_COLOR_BOTTOM : CONFIG.PIPE.COLOR_BOTTOM;
    const capColor = themeColors ? themeColors.PIPE_CAP : '#4A934A';
    const stripeColor = themeColors ? themeColors.PIPE_STRIPE : '#4A934A';

    // Top pipe
    ctx.fillStyle = colorTop;
    ctx.fillRect(this.x, 0, this.width, this.gapY);
    
    // Top pipe cap
    ctx.fillStyle = capColor;
    ctx.fillRect(this.x - 2, this.gapY - 20, this.width + 4, 20);
    
    // Bottom pipe
    const bottomPipeY = this.gapY + this.gapHeight;
    ctx.fillStyle = colorBottom;
    ctx.fillRect(this.x, bottomPipeY, this.width, canvasHeight - bottomPipeY - groundHeight);
    
    // Bottom pipe cap
    ctx.fillStyle = capColor;
    ctx.fillRect(this.x - 2, bottomPipeY, this.width + 4, 20);
    
    // Add pipe details (stripes)
    ctx.strokeStyle = stripeColor;
    ctx.lineWidth = 2;
    for (let i = 20; i < this.gapY; i += 30) {
      ctx.beginPath();
      ctx.moveTo(this.x, i);
      ctx.lineTo(this.x + this.width, i);
      ctx.stroke();
    }
    for (let i = bottomPipeY + 40; i < canvasHeight - groundHeight; i += 30) {
      ctx.beginPath();
      ctx.moveTo(this.x, i);
      ctx.lineTo(this.x + this.width, i);
      ctx.stroke();
    }
    
    // Debug hitbox
    if (CONFIG.DEBUG) {
      ctx.strokeStyle = 'red';
      ctx.strokeRect(this.x, 0, this.width, this.gapY);
      ctx.strokeRect(this.x, bottomPipeY, this.width, canvasHeight - bottomPipeY - groundHeight);
    }
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  getBounds() {
    return {
      x: this.x,
      width: this.width,
      topPipe: {
        top: 0,
        bottom: this.gapY
      },
      bottomPipe: {
        top: this.gapY + this.gapHeight,
        bottom: CONFIG.CANVAS.HEIGHT - CONFIG.VISUALS.GROUND_HEIGHT
      }
    };
  }
}

/**
 * Pipe Manager
 * Manages all pipes in the game
 */
class PipeManager {
  constructor(difficulty = 'MEDIUM') {
    this.pipes = [];
    this.frameCount = 0;
    this.setDifficulty(difficulty);
  }

  setDifficulty(difficulty) {
    const difficultySettings = CONFIG.DIFFICULTY[difficulty] || CONFIG.DIFFICULTY.MEDIUM;
    this.speed = difficultySettings.pipeSpeed;
    this.gapHeight = difficultySettings.gapHeight;
    this.spawnInterval = difficultySettings.spawnInterval;
  }

  reset() {
    this.pipes = [];
    this.frameCount = 0;
  }

  update() {
    this.frameCount++;
    
    // Spawn new pipe
    if (this.frameCount >= this.spawnInterval) {
      this.spawn();
      this.frameCount = 0;
    }
    
    // Update all pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      this.pipes[i].update(this.speed);
      
      // Remove off-screen pipes
      if (this.pipes[i].isOffScreen()) {
        this.pipes.splice(i, 1);
      }
    }
  }

  spawn() {
    const minGapY = CONFIG.PIPE.MIN_GAP_Y;
    const maxGapY = CONFIG.CANVAS.HEIGHT - this.gapHeight - CONFIG.VISUALS.GROUND_HEIGHT - 50;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
    
    this.pipes.push(new Pipe(CONFIG.CANVAS.WIDTH, gapY));
  }

  draw(ctx, themeColors = null) {
    this.pipes.forEach(pipe => pipe.draw(ctx, themeColors));
  }

  getPipes() {
    return this.pipes;
  }
}
