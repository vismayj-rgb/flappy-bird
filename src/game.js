/**
 * Main Game Class
 * Orchestrates all game components, manages game loop,
 * weather patterns, coin economy, and epic boss fights.
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
    
    // Feature: Coin list
    this.coins = [];

    // Feature: Boss variables
    this.boss = new Boss();
    this.bossProjectiles = [];
    this.energyOrbs = [];
    this.homingMissiles = [];
    this.bossWarningTimer = 0;

    // Feature: Weather & Wind
    this.currentWeather = CONFIG.WEATHER.TYPES.CLEAR;
    this.currentWind = CONFIG.WEATHER.WINDS.CLEAR;
    this.weatherParticles = [];
    this.weatherTimer = 0;
    this.stormScoreCounter = 0; // For Storm Survivor achievement
    this.lightningFlash = 0;

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
    window.game = this; // Bind globally for boss.js and managers
  }

  loadSettings() {
    const settings = StorageManager.getGameSettings();
    soundManager.setEnabled(settings.soundEnabled);
    this.setDifficulty(settings.difficulty);
    
    // Refresh Shop & Quests UI on launch
    if (window.shopManager) shopManager.refreshUI();
    if (window.questManager) questManager.refreshUI();
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
    this.reset();
    this.state = CONFIG.STATES.PLAYING;
    this.loop();
  }

  reset() {
    this.bird.reset();
    this.pipeManager.reset();
    this.powerUpManager.reset();
    this.scoreManager.reset();
    
    this.coins = [];
    this.boss.reset();
    this.bossProjectiles = [];
    this.energyOrbs = [];
    this.homingMissiles = [];
    this.bossWarningTimer = 0;
    
    this.lives = 3;
    this.combo = 0;
    this.comboTimer = 0;
    this.stormScoreCounter = 0;
    this.lightningFlash = 0;

    this.chooseRandomWeather();
    this.updateLivesDisplay();
    this.updateComboDisplay();

    // Hide Boss Health HUD and alert screen
    const bossAlert = document.getElementById('bossAlertScreen');
    if (bossAlert) bossAlert.classList.add('hidden');
    const bossHud = document.getElementById('bossHealthHUD');
    if (bossHud) bossHud.classList.add('hidden');

    // Make sure shop is refreshed with correct skin
    if (window.shopManager) {
      this.bird.skin = shopManager.equippedSkin;
      shopManager.refreshUI();
    }
  }

  pause() {
    if (this.state === CONFIG.STATES.PLAYING || this.state === CONFIG.STATES.BOSS_BATTLE) {
      this.savedStateBeforePause = this.state;
      this.state = CONFIG.STATES.PAUSED;
    } else if (this.state === CONFIG.STATES.PAUSED) {
      this.state = this.savedStateBeforePause || CONFIG.STATES.PLAYING;
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

    // Record this run in the run log
    if (window.runLogManager) {
      runLogManager.record(this.scoreManager.currentScore, this.difficulty);
    }
    
    // Hide Boss Health HUD if active
    const bossHud = document.getElementById('bossHealthHUD');
    if (bossHud) bossHud.classList.add('hidden');

    // Show game over screen
    const gameOverScreen = document.getElementById('gameOverScreen');
    if (gameOverScreen) {
      gameOverScreen.classList.remove('hidden');
    }
  }

  jump() {
    if (this.state === CONFIG.STATES.PLAYING || this.state === CONFIG.STATES.BOSS_BATTLE) {
      this.bird.jump();
    }
  }

  // Feature: Weather controls
  chooseRandomWeather() {
    const types = Object.values(CONFIG.WEATHER.TYPES);
    const selected = types[Math.floor(Math.random() * types.length)];
    this.setWeather(selected);
  }

  setWeather(type) {
    this.currentWeather = type;
    this.currentWind = CONFIG.WEATHER.WINDS[type];
    this.weatherTimer = 0;

    const iconMap = { CLEAR: '☀️', RAINY: '🌧️', SNOWY: '❄️', STORMY: '⚡' };
    const labelMap = { CLEAR: 'Clear', RAINY: 'Rainy', SNOWY: 'Snowy', STORMY: 'Stormy' };

    const wIcon = document.getElementById('weatherIcon');
    const wLabel = document.getElementById('weatherLabel');
    const wArrow = document.getElementById('windArrow');
    const wSpeed = document.getElementById('windSpeed');

    if (wIcon) wIcon.textContent = iconMap[type];
    if (wLabel) wLabel.textContent = labelMap[type];
    if (wSpeed) wSpeed.textContent = this.currentWind.name;

    if (wArrow) {
      // Wind Arrow rotation based on wind strength/direction
      if (this.currentWind.x === 0 && this.currentWind.y === 0) {
        wArrow.style.transform = 'rotate(0deg)';
      } else {
        const angle = Math.atan2(this.currentWind.y, this.currentWind.x) * 180 / Math.PI;
        wArrow.style.transform = `rotate(${angle}deg)`;
      }
    }

    this.weatherParticles = [];
  }

  updateWeather() {
    this.weatherTimer++;
    if (this.weatherTimer > 1000) { // change weather roughly every 16 seconds
      this.chooseRandomWeather();
    }

    // Spawn weather particles
    const groundY = CONFIG.CANVAS.HEIGHT - CONFIG.VISUALS.GROUND_HEIGHT;
    
    if (this.currentWeather === CONFIG.WEATHER.TYPES.RAINY || this.currentWeather === CONFIG.WEATHER.TYPES.STORMY) {
      const spawns = this.currentWeather === CONFIG.WEATHER.TYPES.STORMY ? 3 : 1.5;
      for (let i = 0; i < spawns; i++) {
        this.weatherParticles.push({
          x: Math.random() * CONFIG.CANVAS.WIDTH * 1.5 - CONFIG.CANVAS.WIDTH * 0.2,
          y: -10,
          length: Math.random() * 10 + 10,
          vy: Math.random() * 5 + 6,
          vx: this.currentWind.x * 12
        });
      }

      // Lightning storm flashes
      if (this.currentWeather === CONFIG.WEATHER.TYPES.STORMY) {
        if (Math.random() < 0.004) {
          this.lightningFlash = Math.random() * 8 + 4; // screen flash count
          if (window.soundManager) {
            soundManager.playTone(80, 0.4, 'sawtooth'); // thunder rumble
          }
        }
      }
    } else if (this.currentWeather === CONFIG.WEATHER.TYPES.SNOWY) {
      if (Math.random() < 0.4) {
        this.weatherParticles.push({
          x: Math.random() * CONFIG.CANVAS.WIDTH,
          y: -10,
          radius: Math.random() * 2 + 1,
          vy: Math.random() * 1 + 1,
          vx: Math.random() * 0.8 - 0.4 + this.currentWind.x * 2,
          angle: Math.random() * Math.PI
        });
      }
    }

    if (this.lightningFlash > 0) this.lightningFlash--;

    // Update and prune weather particles
    this.weatherParticles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      if (p.angle !== undefined) {
        p.angle += 0.02;
        p.x += Math.sin(p.angle) * 0.3; // snowflake wobble
      }
    });

    this.weatherParticles = this.weatherParticles.filter(p => p.y < groundY && p.x > -50 && p.x < CONFIG.CANVAS.WIDTH + 50);
  }

  // Feature: Boss fight triggers
  triggerBossWarning() {
    this.state = CONFIG.STATES.BOSS_WARNING;
    this.bossWarningTimer = 120; // 2 seconds at 60 FPS
    
    // Show alert screen
    const alertScreen = document.getElementById('bossAlertScreen');
    if (alertScreen) alertScreen.classList.remove('hidden');

    if (window.soundManager) {
      // Siren warning sounds
      soundManager.playTone(150, 0.4, 'sawtooth');
      setTimeout(() => soundManager.playTone(150, 0.4, 'sawtooth'), 500);
      setTimeout(() => soundManager.playTone(150, 0.4, 'sawtooth'), 1000);
    }
  }

  defeatBoss() {
    // Return to normal
    this.state = CONFIG.STATES.PLAYING;
    
    // Coin rewards & Achievements
    if (window.shopManager) shopManager.addCoins(50);
    if (window.questManager) questManager.progress('bosses', 1);

    if (window.achievementManager) {
      achievementManager.check('boss_slayer', 1);
      achievementManager.showToast('BOSS DEFEATED! ⚔️', 'Earned 50 Gold Coins!');
    }

    if (window.soundManager) {
      // Triumph fan-fare
      soundManager.playTone(523.25, 0.15, 'sine');
      setTimeout(() => soundManager.playTone(659.25, 0.15, 'sine'), 100);
      setTimeout(() => soundManager.playTone(783.99, 0.15, 'sine'), 200);
      setTimeout(() => soundManager.playTone(1046.50, 0.4, 'sine'), 300);
    }

    const bossHud = document.getElementById('bossHealthHUD');
    if (bossHud) bossHud.classList.add('hidden');

    this.bossProjectiles = [];
    this.energyOrbs = [];
    this.homingMissiles = [];
  }

  update() {
    if (this.state === CONFIG.STATES.START || this.state === CONFIG.STATES.GAME_OVER || this.state === CONFIG.STATES.PAUSED) {
      return;
    }

    // Update bird (always update physics)
    this.bird.update();

    // Update weather
    this.updateWeather();

    // Determine speed
    const activeSpeed = this.bird.slowMoTime > 0
      ? this.pipeManager.speed * 0.5
      : this.pipeManager.speed;

    // Update clouds
    this.clouds.forEach(cloud => {
      cloud.x -= cloud.speed;
      if (cloud.x + cloud.width < 0) {
        cloud.x = CONFIG.CANVAS.WIDTH;
        cloud.y = Math.random() * 200 + 50;
      }
    });

    // Combo timer decrement
    if (this.combo > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.updateComboDisplay();
      }
    }

    // STATE: BOSS WARNING OVERLAY RUNNING
    if (this.state === CONFIG.STATES.BOSS_WARNING) {
      // Continue moving current pipes offscreen
      this.pipeManager.pipes.forEach(p => p.update(activeSpeed));
      this.pipeManager.pipes = this.pipeManager.pipes.filter(p => !p.isOffScreen());
      
      this.coins.forEach(c => c.update(activeSpeed));
      this.coins = this.coins.filter(c => !c.isOffScreen());

      this.bossWarningTimer--;
      if (this.bossWarningTimer <= 0) {
        // Hide warning screen, transition to Boss Battle
        this.state = CONFIG.STATES.BOSS_BATTLE;
        this.boss.reset();
        
        const alertScreen = document.getElementById('bossAlertScreen');
        if (alertScreen) alertScreen.classList.add('hidden');
        
        const bossHud = document.getElementById('bossHealthHUD');
        if (bossHud) bossHud.classList.remove('hidden');
      }
      return;
    }

    // STATE: ACTIVE BOSS BATTLE
    if (this.state === CONFIG.STATES.BOSS_BATTLE) {
      this.boss.update();

      // Spawn player-usable energy orbs
      if (this.energyOrbs.length === 0 && Math.random() < CONFIG.BOSS.ENERGY_ORB_SPAWN_CHANCE) {
        this.energyOrbs.push(new EnergyOrb(CONFIG.CANVAS.WIDTH + 50, Math.random() * 300 + 100));
      }

      // Update energy orbs
      this.energyOrbs.forEach(orb => orb.update(activeSpeed));
      this.energyOrbs = this.energyOrbs.filter(orb => !orb.isOffScreen() && !orb.collected);

      // Check energy orb collection
      for (const orb of this.energyOrbs) {
        if (CollisionManager.checkBirdPowerUpCollision(this.bird, orb)) {
          orb.collected = true;
          if (window.soundManager) soundManager.playPowerUp();
          
          // Launch homing missile
          this.homingMissiles.push(new HomingMissile(this.bird.x + CONFIG.BIRD.WIDTH, this.bird.y + CONFIG.BIRD.HEIGHT/2, this.boss));
        }
      }

      // Update homing missiles
      this.homingMissiles.forEach(m => m.update());
      this.homingMissiles = this.homingMissiles.filter(m => !m.exploded || m.particles.length > 0);

      // Update boss fireballs
      this.bossProjectiles.forEach(p => p.update());
      this.bossProjectiles = this.bossProjectiles.filter(p => !p.isOffScreen());

      // Check collision with fireballs
      if (this.bird.shieldTime <= 0) {
        for (const fireball of this.bossProjectiles) {
          const bBounds = this.bird.getBounds();
          const fBounds = fireball.getBounds();
          const hit = (
            bBounds.right > fBounds.left &&
            bBounds.left < fBounds.right &&
            bBounds.bottom > fBounds.top &&
            bBounds.top < fBounds.bottom
          );
          if (hit) {
            this.gameOver();
            return;
          }
        }
      }

      // Check boundary collision during boss
      if (CollisionManager.checkBirdBoundaryCollision(this.bird)) {
        this.gameOver();
        return;
      }
      return;
    }

    // STATE: REGULAR PIPES GAMEPLAY
    // Update pipes
    this.pipeManager.pipes.forEach(p => p.update(activeSpeed));
    this.pipeManager.frameCount++;
    if (this.pipeManager.frameCount >= this.pipeManager.spawnInterval) {
      // Spawn pipe
      this.pipeManager.spawn();
      this.pipeManager.frameCount = 0;

      // Feature: Coin Spawn in the gap (shift horizontally to avoid overlap with powerups)
      if (Math.random() < CONFIG.COIN.SPAWN_CHANCE) {
        const lastPipe = this.pipeManager.pipes[this.pipeManager.pipes.length - 1];
        if (lastPipe) {
          const coinX = lastPipe.x + lastPipe.width / 2 + (Math.random() > 0.5 ? 40 : -40);
          this.coins.push(new Coin(coinX, lastPipe.gapY + lastPipe.gapHeight / 2));
        }
      }
    }
    this.pipeManager.pipes = this.pipeManager.pipes.filter(p => !p.isOffScreen());

    // Update coins
    this.coins.forEach(c => c.update(activeSpeed));
    this.coins = this.coins.filter(c => !c.isOffScreen() && !c.collected);

    // Coin collision checks
    for (const coin of this.coins) {
      const bBounds = this.bird.getBounds();
      const cBounds = coin.getBounds();
      const collected = (
        bBounds.right > cBounds.left &&
        bBounds.left < cBounds.right &&
        bBounds.bottom > cBounds.top &&
        bBounds.top < cBounds.bottom
      );
      if (collected) {
        coin.collected = true;
        if (window.shopManager) shopManager.addCoins(1);
        if (window.questManager) questManager.progress('coins', 1);
        if (window.soundManager) soundManager.playScore();
      }
    }

    // Update powerups
    this.powerUpManager.update(activeSpeed);

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

    // Check collisions with pipes
    const collisionResult = CollisionManager.checkCollisions(
      this.bird,
      this.pipeManager.getPipes()
    );

    if (collisionResult.collision) {
      this.gameOver();
      return;
    }

    // Check pipe scoring pass
    if (CollisionManager.checkScoring(this.bird, this.pipeManager.getPipes())) {
      this.combo++;
      this.comboTimer = 120; // 2-sec reset
      const comboBonus = Math.min(this.combo, 5);
      const baseAmount = this.bird.multiplierTime > 0 ? 2 : 1;
      
      this.scoreManager.increment(baseAmount * comboBonus);
      this.updateComboDisplay();

      // Quests combo progress check
      if (window.questManager) {
        questManager.progress('combo', this.combo);
      }

      // Stormy weather score check
      if (this.currentWeather === CONFIG.WEATHER.TYPES.STORMY) {
        this.stormScoreCounter += baseAmount * comboBonus;
        if (window.achievementManager && this.stormScoreCounter >= 10) {
          achievementManager.check('storm_survivor', this.stormScoreCounter);
        }
      }

      // Achievement checks
      if (window.achievementManager) {
        achievementManager.check('score', this.scoreManager.currentScore);
        if (this.combo >= 5) achievementManager.check('combo_5', this.combo);
      }

      // Boss Spawn Trigger check
      if (this.scoreManager.currentScore > 0 && this.scoreManager.currentScore % CONFIG.BOSS.TRIGGER_SCORE === 0) {
        this.triggerBossWarning();
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

    // Draw weather particles (rain/snow)
    this.drawWeather();

    // Draw pipes (normal phase)
    if (this.state !== CONFIG.STATES.BOSS_BATTLE) {
      this.pipeManager.draw(this.ctx, this.getThemeColors());
    }

    // Draw coins
    this.coins.forEach(coin => coin.draw(this.ctx));

    // Draw power-ups
    if (this.state !== CONFIG.STATES.BOSS_BATTLE) {
      this.powerUpManager.draw(this.ctx);
    }

    // Draw Boss Fight entities
    if (this.state === CONFIG.STATES.BOSS_BATTLE) {
      this.boss.draw(this.ctx);
      this.energyOrbs.forEach(orb => orb.draw(this.ctx));
      this.homingMissiles.forEach(m => m.draw(this.ctx));
      this.bossProjectiles.forEach(proj => proj.draw(this.ctx));
    }

    // Draw bird
    this.bird.draw(this.ctx);

    // Draw ground
    this.drawGround();

    // Draw score (only during gameplay)
    if (this.state === CONFIG.STATES.PLAYING || this.state === CONFIG.STATES.BOSS_BATTLE || this.state === CONFIG.STATES.BOSS_WARNING) {
      this.scoreManager.draw(this.ctx);
      this.drawPowerUpHUD();
    }

    // Draw pause indicator
    if (this.state === CONFIG.STATES.PAUSED) {
      this.drawPauseScreen();
    }

    // Draw lightning screen flash overlay
    if (this.lightningFlash > 0) {
      this.ctx.save();
      this.ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningFlash * 0.12})`;
      this.ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
      this.ctx.restore();
    }
  }

  drawWeather() {
    this.ctx.save();
    if (this.currentWeather === CONFIG.WEATHER.TYPES.RAINY || this.currentWeather === CONFIG.WEATHER.TYPES.STORMY) {
      this.ctx.strokeStyle = this.currentWeather === CONFIG.WEATHER.TYPES.STORMY ? 'rgba(174, 219, 255, 0.45)' : 'rgba(174, 219, 255, 0.3)';
      this.ctx.lineWidth = 1.2;
      this.weatherParticles.forEach(p => {
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        // angled rain line
        this.ctx.lineTo(p.x + p.vx * 1.5, p.y + p.length);
        this.ctx.stroke();
      });
    } else if (this.currentWeather === CONFIG.WEATHER.TYPES.SNOWY) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      this.weatherParticles.forEach(p => {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }
    this.ctx.restore();
  }

  drawPowerUpHUD() {
    let yPos = 20;
    if (this.bird.shieldTime > 0) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.fillRect(10, yPos, 120, 15);
      const width = (this.bird.shieldTime / CONFIG.POWERUP.SHIELD_DURATION) * 120;
      this.ctx.fillStyle = CONFIG.POWERUP.COLORS.SHIELD;
      this.ctx.fillRect(10, yPos, width, 15);
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

    if (this.state === CONFIG.STATES.PLAYING || this.state === CONFIG.STATES.BOSS_BATTLE || this.state === CONFIG.STATES.BOSS_WARNING) {
      this.animationFrameId = requestAnimationFrame(() => this.loop());
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
