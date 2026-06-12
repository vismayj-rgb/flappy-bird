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

    // Lives system (3 lives per game)
    this.lives = 3;

    // Combo system
    this.combo = 0;
    this.comboTimer = 0;
    
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
    this.lives = 3;
    this.combo = 0;
    this.comboTimer = 0;
    this.updateLivesDisplay();
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
    this.lives--;
    this.updateLivesDisplay();

    if (this.lives > 0) {
      // Lose a life and respawn — brief invincibility
      this.bird.y = CONFIG.BIRD.START_Y;
      this.bird.velocity = 0;
      this.bird.shieldTime = 90; // 1.5s grace shield
      this.combo = 0;
      this.updateComboDisplay();
      if (window.soundManager) soundManager.playHit();
      return;
    }

    // No lives left — true game over
    this.state = CONFIG.STATES.GAME_OVER;
    this.scoreManager.endGame();
    soundManager.playGameOver();

    // Check survivor achievement
    if (window.achievementManager) {
      if (this.lives === 0 && this.bird.shieldsCollected === 0) {
        // lives ran out normally — skip
      }
      // Survivor: finish with all 3 lives — can't happen on game over, skip here
    }

    // Record this run in the run log
    if (window.runLogManager) {
      runLogManager.record(this.scoreManager.currentScore, this.difficulty);
    }
    
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

    // Determine active pipe speed (slow-mo halves it)
    const activeSpeed = this.bird.slowMoTime > 0
      ? this.pipeManager.speed * 0.5
      : this.pipeManager.speed;

    // Update pipes with potentially slowed speed
    this.pipeManager.pipes.forEach(p => p.update(activeSpeed));
    this.pipeManager.frameCount++;
    if (this.pipeManager.frameCount >= this.pipeManager.spawnInterval) {
      this.pipeManager.spawn();
      this.pipeManager.frameCount = 0;
    }
    // Remove off-screen pipes
    this.pipeManager.pipes = this.pipeManager.pipes.filter(p => !p.isOffScreen());

    // Update powerups (also slowed)
    this.powerUpManager.update(activeSpeed);

    // Update clouds
    this.clouds.forEach(cloud => {
      cloud.x -= cloud.speed;
      if (cloud.x + cloud.width < 0) {
        cloud.x = CONFIG.CANVAS.WIDTH;
        cloud.y = Math.random() * 200 + 50;
      }
    });

    // Combo timer tick (combo resets after ~2 seconds without scoring)
    if (this.combo > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.updateComboDisplay();
      }
    }

    // Check power-up collisions
    const powerups = this.powerUpManager.getPowerUps();
    for (const powerup of powerups) {
      if (CollisionManager.checkBirdPowerUpCollision(this.bird, powerup)) {
        powerup.collected = true;
        if (window.soundManager) soundManager.playPowerUp();

        if (powerup.type === CONFIG.POWERUP.TYPES.SHIELD) {
          this.bird.shieldTime = CONFIG.POWERUP.SHIELD_DURATION;
          this.bird.shieldsCollected++;
          if (window.achievementManager) achievementManager.check('shield', this.bird.shieldsCollected);

        } else if (powerup.type === CONFIG.POWERUP.TYPES.DOUBLE_SCORE) {
          this.bird.multiplierTime = CONFIG.POWERUP.DOUBLE_SCORE_DURATION;
          this.bird.gemsCollected++;
          if (window.achievementManager) achievementManager.check('gem', this.bird.gemsCollected);

        } else if (powerup.type === CONFIG.POWERUP.TYPES.SLOW_MO) {
          this.bird.slowMoTime = CONFIG.POWERUP.SLOW_MO_DURATION;
          this.bird.slowMoCollected++;
          if (window.achievementManager) achievementManager.check('slow_mo', this.bird.slowMoCollected);
        }
      }
    }

    // Check collisions
    const collisionResult = CollisionManager.checkCollisions(
      this.bird,
      this.pipeManager.getPipes()
    );

    if (collisionResult.collision) {
      this.gameOver();
      return;
    }

    // Check scoring
    if (CollisionManager.checkScoring(this.bird, this.pipeManager.getPipes())) {
      // Combo system: consecutive pipes build combo multiplier
      this.combo++;
      this.comboTimer = 120; // reset 2-second timer
      const comboBonus = Math.min(this.combo, 5); // cap at 5x
      const baseAmount = this.bird.multiplierTime > 0 ? 2 : 1;
      this.scoreManager.increment(baseAmount * comboBonus);
      this.updateComboDisplay();

      if (window.achievementManager) {
        achievementManager.check('score', this.scoreManager.currentScore);
        if (this.combo >= 5) achievementManager.check('combo_5', this.combo);
      }
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
    this.pipeManager.draw(this.ctx, this.getThemeColors());

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
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.fillRect(10, yPos, 120, 15);
      const widthM = (this.bird.multiplierTime / CONFIG.POWERUP.DOUBLE_SCORE_DURATION) * 120;
      this.ctx.fillStyle = CONFIG.POWERUP.COLORS.DOUBLE_SCORE;
      this.ctx.fillRect(10, yPos, widthM, 15);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 10px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('2X SCORE', 15, yPos + 11);
      this.ctx.restore();
      yPos += 25;
    }
    if (this.bird.slowMoTime > 0) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.fillRect(10, yPos, 120, 15);
      const widthS = (this.bird.slowMoTime / CONFIG.POWERUP.SLOW_MO_DURATION) * 120;
      this.ctx.fillStyle = CONFIG.POWERUP.COLORS.SLOW_MO;
      this.ctx.fillRect(10, yPos, widthS, 15);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 10px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('SLOW MO', 15, yPos + 11);
      this.ctx.restore();
    }
  }

  updateLivesDisplay() {
    const el = document.getElementById('livesDisplay');
    if (el) {
      el.textContent = '❤️'.repeat(Math.max(0, this.lives));
    }
  }

  updateComboDisplay() {
    const el = document.getElementById('comboBadge');
    if (!el) return;
    if (this.combo >= 2) {
      el.textContent = `${this.combo}x COMBO! 🔥`;
      el.style.display = 'block';
      // Re-trigger animation by cloning trick
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    } else {
      el.style.display = 'none';
    }
  }

  getThemeColors() {
    const score = this.scoreManager.currentScore;
    if (score >= 30) {
      return CONFIG.VISUALS.THEMES.NIGHT;
    } else if (score >= 15) {
      return CONFIG.VISUALS.THEMES.SUNSET;
    } else {
      return CONFIG.VISUALS.THEMES.DAY;
    }
  }

  drawBackground() {
    const theme = this.getThemeColors();
    const gradient = this.ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS.HEIGHT);
    gradient.addColorStop(0, theme.BACKGROUND[0]);
    gradient.addColorStop(0.7, theme.BACKGROUND[1]);
    gradient.addColorStop(1, theme.BACKGROUND[2]);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
  }

  drawClouds() {
    const theme = this.getThemeColors();
    this.ctx.fillStyle = theme.CLOUD_COLOR;
    this.clouds.forEach(cloud => {
      this.ctx.beginPath();
      this.ctx.arc(cloud.x, cloud.y, cloud.width / 3, 0, Math.PI * 2);
      this.ctx.arc(cloud.x + cloud.width / 3, cloud.y - 10, cloud.width / 3, 0, Math.PI * 2);
      this.ctx.arc(cloud.x + cloud.width / 1.5, cloud.y, cloud.width / 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawGround() {
    const theme = this.getThemeColors();
    const groundY = CONFIG.CANVAS.HEIGHT - CONFIG.VISUALS.GROUND_HEIGHT;
    
    // Ground base
    this.ctx.fillStyle = theme.GROUND_COLOR;
    this.ctx.fillRect(0, groundY, CONFIG.CANVAS.WIDTH, CONFIG.VISUALS.GROUND_HEIGHT);
    
    // Ground stripe pattern
    this.ctx.fillStyle = theme.GROUND_STRIPE;
    for (let i = 0; i < CONFIG.CANVAS.WIDTH; i += 40) {
      this.ctx.fillRect(i, groundY, 20, CONFIG.VISUALS.GROUND_HEIGHT);
    }
    
    // Ground top line
    this.ctx.strokeStyle = theme.GROUND_LINE;
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
