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
    this.pipeManager = new PipeManager(this.difficulty);
    this.scoreManager = new ScoreManager();
    
    // Animation frame reference
    this.animationFrameId = null;
    
    // Background elements
    this.clouds = this.generateClouds();
    
    // Load settings
    this.loadSettings();
    window.game = this; // Bind globally
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
    this.scoreManager.reset();
    
    // Load skin settings on start
    const savedSkin = StorageManager.get(CONFIG.STORAGE.BIRD_SKIN, 'CLASSIC');
    this.bird.skin = savedSkin;
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

    // Update pipes
    const speed = this.pipeManager.speed;
    this.pipeManager.pipes.forEach(p => p.update(speed));
    this.pipeManager.frameCount++;
    if (this.pipeManager.frameCount >= this.pipeManager.spawnInterval) {
      this.pipeManager.spawn();
      this.pipeManager.frameCount = 0;
    }
    
    // Remove off-screen pipes
    this.pipeManager.pipes = this.pipeManager.pipes.filter(p => !p.isOffScreen());

    // Update clouds
    this.clouds.forEach(cloud => {
      cloud.x -= cloud.speed;
      if (cloud.x + cloud.width < 0) {
        cloud.x = CONFIG.CANVAS.WIDTH;
        cloud.y = Math.random() * 200 + 50;
      }
    });

    // Check collisions (1 hit triggers game over)
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
      this.scoreManager.increment(1);

      if (window.achievementManager) {
        achievementManager.check('score', this.scoreManager.currentScore);
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

    // Draw bird
    this.bird.draw(this.ctx);

    // Draw ground
    this.drawGround();

    // Draw score (only during gameplay)
    if (this.state === CONFIG.STATES.PLAYING) {
      this.scoreManager.draw(this.ctx);
    }

    // Draw pause indicator
    if (this.state === CONFIG.STATES.PAUSED) {
      this.drawPauseScreen();
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
