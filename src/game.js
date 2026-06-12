/**
 * Main Game Class
 * Orchestrates all game components and manages game loop
 */

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = CONFIG.STATES.START;
    this.difficulty = 'MEDIUM';
    
    // Initialize game objects
    this.bird = new Bird();
    this.powerUpManager = new PowerUpManager();
    this.pipeManager = new PipeManager(this.difficulty, this.powerUpManager);
    this.scoreManager = new ScoreManager();
    
    // Animation frame reference
    this.animationFrameId = null;
    
    // Background elements
    this.clouds = this.generateClouds();
    
    // Load settings
    this.loadSettings();
  }

  loadSettings() {
    const settings = StorageManager.getGameSettings();
    soundManager.setEnabled(settings.soundEnabled);
    this.setDifficulty(settings.difficulty);
  }

  generateClouds() {
    const clouds = [];
    for (let i = 0; i < CONFIG.VISUALS.CLOUD_COUNT; i++) {
      clouds.push({
        x: Math.random() * CONFIG.CANVAS.WIDTH,
        y: Math.random() * 200 + 50,
        width: Math.random() * 60 + 40,
        speed: Math.random() * 0.3 + 0.2
      });
    }
    return clouds;
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    this.pipeManager.setDifficulty(difficulty);
    StorageManager.set(CONFIG.STORAGE.DIFFICULTY, difficulty);
  }

  start() {
    this.state = CONFIG.STATES.PLAYING;
    this.reset();
    this.loop();
  }

  reset() {
    this.bird.reset();
    this.pipeManager.reset();
    this.powerUpManager.reset();
    this.scoreManager.reset();
  }

  pause() {
    if (this.state === CONFIG.STATES.PLAYING) {
      this.state = CONFIG.STATES.PAUSED;
    } else if (this.state === CONFIG.STATES.PAUSED) {
      this.state = CONFIG.STATES.PLAYING;
      this.loop();
    }
  }

  gameOver() {
    this.state = CONFIG.STATES.GAME_OVER;
    this.scoreManager.endGame();
    soundManager.playGameOver();
    
    // Show game over screen
    const gameOverScreen = document.getElementById('gameOverScreen');
    if (gameOverScreen) {
      gameOverScreen.classList.remove('hidden');
    }
  }

  jump() {
    if (this.state === CONFIG.STATES.PLAYING) {
      this.bird.jump();
    }
  }

  update() {
    if (this.state !== CONFIG.STATES.PLAYING) {
      return;
    }

    // Update bird
    this.bird.update();

    // Update pipes
    this.pipeManager.update();

    // Update powerups
    this.powerUpManager.update(this.pipeManager.speed);

    // Update clouds
    this.clouds.forEach(cloud => {
      cloud.x -= cloud.speed;
      if (cloud.x + cloud.width < 0) {
        cloud.x = CONFIG.CANVAS.WIDTH;
        cloud.y = Math.random() * 200 + 50;
      }
    });

    // Check power-up collisions
    const powerups = this.powerUpManager.getPowerUps();
    for (const powerup of powerups) {
      if (CollisionManager.checkBirdPowerUpCollision(this.bird, powerup)) {
        powerup.collected = true;
        if (window.soundManager) {
          soundManager.playPowerUp();
        }
        if (powerup.type === CONFIG.POWERUP.TYPES.SHIELD) {
          this.bird.shieldTime = CONFIG.POWERUP.SHIELD_DURATION;
        } else if (powerup.type === CONFIG.POWERUP.TYPES.DOUBLE_SCORE) {
          this.bird.multiplierTime = CONFIG.POWERUP.DOUBLE_SCORE_DURATION;
        }
      }
    }

    // Check collisions
    const collisionResult = CollisionManager.checkCollisions(
      this.bird,
      this.pipeManager.getPipes()
    );

    if (collisionResult.collision) {
      soundManager.playHit();
      this.gameOver();
      return;
    }

    // Check scoring
    if (CollisionManager.checkScoring(this.bird, this.pipeManager.getPipes())) {
      const amount = this.bird.multiplierTime > 0 ? 2 : 1;
      this.scoreManager.increment(amount);
    }
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

    // Draw background
    this.drawBackground();

    // Draw clouds
    this.drawClouds();

    // Draw pipes
    this.pipeManager.draw(this.ctx);

    // Draw power-ups
    this.powerUpManager.draw(this.ctx);

    // Draw bird
    this.bird.draw(this.ctx);

    // Draw ground
    this.drawGround();

    // Draw score (only during gameplay)
    if (this.state === CONFIG.STATES.PLAYING) {
      this.scoreManager.draw(this.ctx);
      this.drawPowerUpHUD();
    }

    // Draw pause indicator
    if (this.state === CONFIG.STATES.PAUSED) {
      this.drawPauseScreen();
    }
  }

  drawPowerUpHUD() {
    let yPos = 20;
    if (this.bird.shieldTime > 0) {
      this.ctx.save();
      // Background bar
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.fillRect(10, yPos, 120, 15);
      // Fill bar
      const width = (this.bird.shieldTime / CONFIG.POWERUP.SHIELD_DURATION) * 120;
      this.ctx.fillStyle = CONFIG.POWERUP.COLORS.SHIELD;
      this.ctx.fillRect(10, yPos, width, 15);
      // Text
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 10px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('SHIELD', 15, yPos + 11);
      this.ctx.restore();
      yPos += 25;
    }
    if (this.bird.multiplierTime > 0) {
      this.ctx.save();
      // Background bar
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.fillRect(10, yPos, 120, 15);
      // Fill bar
      const width = (this.bird.multiplierTime / CONFIG.POWERUP.DOUBLE_SCORE_DURATION) * 120;
      this.ctx.fillStyle = CONFIG.POWERUP.COLORS.DOUBLE_SCORE;
      this.ctx.fillRect(10, yPos, width, 15);
      // Text
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 10px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('2X SCORE', 15, yPos + 11);
      this.ctx.restore();
    }
  }

  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS.HEIGHT);
    gradient.addColorStop(0, '#4ec0ca');
    gradient.addColorStop(0.7, '#a7dbd8');
    gradient.addColorStop(1, '#e0f9ff');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
  }

  drawClouds() {
    this.ctx.fillStyle = CONFIG.VISUALS.CLOUD_COLOR;
    this.clouds.forEach(cloud => {
      this.ctx.beginPath();
      this.ctx.arc(cloud.x, cloud.y, cloud.width / 3, 0, Math.PI * 2);
      this.ctx.arc(cloud.x + cloud.width / 3, cloud.y - 10, cloud.width / 3, 0, Math.PI * 2);
      this.ctx.arc(cloud.x + cloud.width / 1.5, cloud.y, cloud.width / 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawGround() {
    const groundY = CONFIG.CANVAS.HEIGHT - CONFIG.VISUALS.GROUND_HEIGHT;
    
    // Ground base
    this.ctx.fillStyle = CONFIG.VISUALS.GROUND_COLOR;
    this.ctx.fillRect(0, groundY, CONFIG.CANVAS.WIDTH, CONFIG.VISUALS.GROUND_HEIGHT);
    
    // Ground stripe pattern
    this.ctx.fillStyle = '#C9A66B';
    for (let i = 0; i < CONFIG.CANVAS.WIDTH; i += 40) {
      this.ctx.fillRect(i, groundY, 20, CONFIG.VISUALS.GROUND_HEIGHT);
    }
    
    // Ground top line
    this.ctx.strokeStyle = '#8B7355';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(0, groundY);
    this.ctx.lineTo(CONFIG.CANVAS.WIDTH, groundY);
    this.ctx.stroke();
  }

  drawPauseScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText('Press P to resume', CONFIG.CANVAS.WIDTH / 2, CONFIG.CANVAS.HEIGHT / 2 + 50);
  }

  loop() {
    this.update();
    this.draw();

    if (this.state === CONFIG.STATES.PLAYING) {
      this.animationFrameId = requestAnimationFrame(() => this.loop());
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
