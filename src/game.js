/**
 * Main Game Class
 * Orchestrates all game components, manages gameplay physics under mutators,
 * dynamically interpolates the Day/Night cycle background with synthesizers,
 * records and renders the high-score ghost bird, and handles score starbursts & death shakes.
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
    
    // Feature: Visual Juice Particles
    this.scoreParticles = [];
    this.feathers = [];
    this.shakeTime = 0;

    // Feature: Day/Night time tracking
    this.timeCycle = 0; // cycles 0 to 1800 frames (30s)
    this.ambientBirds = null;
    this.ambientCrickets = null;
    
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
    
    // Start Ambient Web Audio context
    this.initAmbientAudio();

    // Start ghost recording
    if (window.ghostManager) {
      ghostManager.startRecording();
    }

    this.loop();
  }

  reset() {
    this.bird.reset();
    this.pipeManager.reset();
    this.scoreManager.reset();
    
    this.scoreParticles = [];
    this.feathers = [];
    this.shakeTime = 0;
    this.timeCycle = 0;

    const savedSkin = StorageManager.get(CONFIG.STORAGE.BIRD_SKIN, 'CLASSIC');
    this.bird.skin = savedSkin;

    if (window.ghostManager) {
      ghostManager.resetPlay();
    }
  }

  pause() {
    if (this.state === CONFIG.STATES.PLAYING) {
      this.state = CONFIG.STATES.PAUSED;
      this.stopAmbientAudio();
    } else if (this.state === CONFIG.STATES.PAUSED) {
      this.state = CONFIG.STATES.PLAYING;
      this.initAmbientAudio();
      this.loop();
    }
  }

  gameOver() {
    // Trigger Screen Shake & Feather burst
    this.shakeTime = 16;
    this.triggerFeatherExplosion();

    this.state = CONFIG.STATES.GAME_OVER;
    this.stopAmbientAudio();

    // Determine if new high score was set
    const oldBest = this.scoreManager.highScore;
    this.scoreManager.endGame();
    soundManager.playGameOver();

    // Save Ghost run if best score
    if (window.ghostManager) {
      ghostManager.saveIfBest(
        this.scoreManager.currentScore, 
        this.scoreManager.currentScore > oldBest
      );
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

  triggerFeatherExplosion() {
    const skinColors = CONFIG.BIRD.SKINS[this.bird.skin] || CONFIG.BIRD.SKINS.CLASSIC;
    for (let i = 0; i < 20; i++) {
      this.feathers.push({
        x: this.bird.x + this.bird.width / 2,
        y: this.bird.y + this.bird.height / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 5 - 2.5,
        life: 1.0,
        color: Math.random() > 0.4 ? skinColors.body : skinColors.wing,
        size: Math.random() * 5 + 3,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.15
      });
    }
  }

  triggerScoreStarburst() {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      this.scoreParticles.push({
        x: this.bird.x + this.bird.width,
        y: this.bird.y + this.bird.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color: '#FFF350',
        size: Math.random() * 3.5 + 2.0
      });
    }
  }

  jump() {
    if (this.state === CONFIG.STATES.PLAYING) {
      this.bird.jump();
    }
  }

  // Feature: Web Audio API synthesized ambient loops
  initAmbientAudio() {
    if (!soundManager.enabled || !soundManager.audioContext) return;

    try {
      this.stopAmbientAudio();

      const ctx = soundManager.audioContext;

      // 1. Day bird chirps loop synth node
      this.ambientBirds = ctx.createGain();
      this.ambientBirds.gain.value = 0;
      this.ambientBirds.connect(ctx.destination);
      
      // 2. Night crickets chirping loop synth node
      this.ambientCrickets = ctx.createGain();
      this.ambientCrickets.gain.value = 0;
      this.ambientCrickets.connect(ctx.destination);
    } catch (e) {
      console.warn("Could not start ambient oscillators", e);
    }
  }

  stopAmbientAudio() {
    this.ambientBirds = null;
    this.ambientCrickets = null;
  }

  updateAmbientVolume(birdVol, cricketVol) {
    if (!soundManager.enabled || !soundManager.audioContext) return;
    const ctx = soundManager.audioContext;
    const now = ctx.currentTime;
    
    if (this.ambientBirds && this.ambientBirds.gain) {
      this.ambientBirds.gain.setValueAtTime(birdVol * 0.15, now);
      // Synthesize bird sounds procedurally occasionally
      if (birdVol > 0.1 && Math.random() < 0.015) {
        soundManager.playTone(Math.random() * 400 + 800, 0.08, 'sine');
      }
    }
    if (this.ambientCrickets && this.ambientCrickets.gain) {
      this.ambientCrickets.gain.setValueAtTime(cricketVol * 0.15, now);
      // Synthesize crickets chirping procedurally occasionally
      if (cricketVol > 0.1 && Math.random() < 0.035) {
        soundManager.playTone(3200, 0.03, 'triangle');
      }
    }
  }

  update() {
    if (this.state !== CONFIG.STATES.PLAYING) {
      // Still update particles during Game Over
      if (this.state === CONFIG.STATES.GAME_OVER) {
        this.updateVisualJuiceOnly();
      }
      return;
    }

    // 1. Mutator: Double Speed override
    const doubleSpeed = window.mutatorManager && mutatorManager.isActive('double_speed');
    const speedMultiplier = doubleSpeed ? 1.5 : 1.0;
    
    // Update Day/Night Time cycle index
    this.timeCycle = (this.timeCycle + 1) % 1800; // 30 seconds loop
    this.updateDayNightHUD();

    // Update camera shake duration
    if (this.shakeTime > 0) this.shakeTime--;

    // Update bird
    this.bird.update();

    // Record frame Y-pos and rotation for ghost replays
    if (window.ghostManager) {
      ghostManager.recordFrame(this.bird.y, this.bird.rotation, this.bird.x);
    }

    // Update pipes
    const speed = this.pipeManager.speed * speedMultiplier;
    this.pipeManager.pipes.forEach(p => p.update(speed));
    
    this.pipeManager.frameCount += speedMultiplier;
    if (this.pipeManager.frameCount >= this.pipeManager.spawnInterval) {
      this.pipeManager.spawn();
      this.pipeManager.frameCount = 0;
    }
    
    // Remove off-screen pipes
    this.pipeManager.pipes = this.pipeManager.pipes.filter(p => !p.isOffScreen());

    // Update clouds
    this.clouds.forEach(cloud => {
      cloud.x -= cloud.speed * speedMultiplier;
      if (cloud.x + cloud.width < 0) {
        cloud.x = CONFIG.CANVAS.WIDTH;
        cloud.y = Math.random() * 200 + 50;
      }
    });

    // Update particle stars & feathers
    this.updateVisualParticles();

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
      this.triggerScoreStarburst();

      if (window.achievementManager) {
        achievementManager.check('score', this.scoreManager.currentScore);
      }
    }
  }

  updateVisualParticles() {
    // Score starbursts
    this.scoreParticles = this.scoreParticles
      .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.04 }))
      .filter(p => p.life > 0);

    // Death feathers
    this.feathers = this.feathers
      .map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.15, // gravity drift
        rotation: p.rotation + p.spin,
        life: p.life - 0.02
      }))
      .filter(p => p.life > 0);
  }

  updateVisualJuiceOnly() {
    this.updateVisualParticles();
  }

  updateDayNightHUD() {
    const el = document.getElementById('timeOfDayHUD');
    if (!el) return;
    
    if (this.timeCycle < 500) {
      el.textContent = '🌅 Day';
      this.updateAmbientVolume(1.0, 0.0);
    } else if (this.timeCycle >= 500 && this.timeCycle < 700) {
      el.textContent = '🌇 Sunset';
      // Crossfade birds down, crickets up
      const sunsetRatio = (this.timeCycle - 500) / 200;
      this.updateAmbientVolume(1.0 - sunsetRatio, sunsetRatio);
    } else if (this.timeCycle >= 700 && this.timeCycle < 1400) {
      el.textContent = '🌃 Night';
      this.updateAmbientVolume(0.0, 1.0);
    } else {
      el.textContent = '🌅 Dawn';
      // Crossfade crickets down, birds up
      const dawnRatio = (this.timeCycle - 1400) / 400;
      this.updateAmbientVolume(dawnRatio, 1.0 - dawnRatio);
    }
  }

  // Feature: Dynamic Day/Night Cycle sky colors interpolation
  getInterpolatedColors() {
    const day = CONFIG.VISUALS.THEMES.DAY.BACKGROUND;
    const sunset = CONFIG.VISUALS.THEMES.SUNSET.BACKGROUND;
    const night = CONFIG.VISUALS.THEMES.NIGHT.BACKGROUND;

    let c1, c2, c3;

    // Helper to blend hex strings
    const blend = (cStr1, cStr2, ratio) => {
      const parseHex = s => [parseInt(s.substring(1,3),16), parseInt(s.substring(3,5),16), parseInt(s.substring(5,7),16)];
      const rgb1 = parseHex(cStr1);
      const rgb2 = parseHex(cStr2);
      const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * ratio);
      const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * ratio);
      const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * ratio);
      return `rgb(${r},${g},${b})`;
    };

    if (this.timeCycle < 500) {
      // Clear Day
      return { bg1: day[0], bg2: day[1], bg3: day[2] };
    } else if (this.timeCycle >= 500 && this.timeCycle < 700) {
      // Day to Sunset
      const ratio = (this.timeCycle - 500) / 200;
      return {
        bg1: blend(day[0], sunset[0], ratio),
        bg2: blend(day[1], sunset[1], ratio),
        bg3: blend(day[2], sunset[2], ratio)
      };
    } else if (this.timeCycle >= 700 && this.timeCycle < 1200) {
      // Sunset
      return { bg1: sunset[0], bg2: sunset[1], bg3: sunset[2] };
    } else if (this.timeCycle >= 1200 && this.timeCycle < 1400) {
      // Sunset to Night
      const ratio = (this.timeCycle - 1200) / 200;
      return {
        bg1: blend(sunset[0], night[0], ratio),
        bg2: blend(sunset[1], night[1], ratio),
        bg3: blend(sunset[2], night[2], ratio)
      };
    } else if (this.timeCycle >= 1400 && this.timeCycle < 1700) {
      // Night
      return { bg1: night[0], bg2: night[1], bg3: night[2] };
    } else {
      // Night to Day
      const ratio = (this.timeCycle - 1700) / 100;
      return {
        bg1: blend(night[0], day[0], ratio),
        bg2: blend(night[1], day[1], ratio),
        bg3: blend(night[2], day[2], ratio)
      };
    }
  }

  draw() {
    this.ctx.save();

    // Apply Screen Shake if active
    if (this.shakeTime > 0) {
      const shakeOffset = (Math.random() - 0.5) * 8;
      this.ctx.translate(shakeOffset, shakeOffset);
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

    // Draw background (interpolated Day/Night colors)
    this.drawBackground();

    // Draw animated celestial Sun and Moon
    this.drawCelestialBodies();

    // Draw clouds
    this.drawClouds();

    // Draw pipes
    this.pipeManager.draw(this.ctx, this.getThemeColors());

    // Draw High-Score Replay Ghost Bird
    if (window.ghostManager && (this.state === CONFIG.STATES.PLAYING)) {
      ghostManager.draw(this.ctx);
    }

    // Draw bird
    this.bird.draw(this.ctx);

    // Draw ground
    this.drawGround();

    // Draw Score stars and Feather explosion particles
    this.drawVisualJuice();

    // Draw score (only during gameplay)
    if (this.state === CONFIG.STATES.PLAYING) {
      this.scoreManager.draw(this.ctx);
    }

    // Draw pause indicator
    if (this.state === CONFIG.STATES.PAUSED) {
      this.drawPauseScreen();
    }

    this.ctx.restore();
  }

  drawBackground() {
    const colors = this.getInterpolatedColors();
    const gradient = this.ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS.HEIGHT);
    gradient.addColorStop(0, colors.bg1);
    gradient.addColorStop(0.7, colors.bg2);
    gradient.addColorStop(1, colors.bg3);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
  }

  // Feature: Animated rotating Sun/Moon
  drawCelestialBodies() {
    const angle = (this.timeCycle / 1800) * Math.PI * 2;
    const centerX = CONFIG.CANVAS.WIDTH / 2;
    const centerY = CONFIG.CANVAS.HEIGHT - 80;
    const radius = 240;

    this.ctx.save();
    
    // 1. Draw Sun position
    const sunX = centerX + Math.cos(angle) * radius;
    const sunY = centerY + Math.sin(angle) * radius;
    if (sunY < CONFIG.CANVAS.HEIGHT - 50) {
      this.ctx.fillStyle = '#FFA726';
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = '#FF9100';
      this.ctx.beginPath();
      this.ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 2. Draw Moon position (opposite phase)
    const moonX = centerX - Math.cos(angle) * radius;
    const moonY = centerY - Math.sin(angle) * radius;
    if (moonY < CONFIG.CANVAS.HEIGHT - 50) {
      this.ctx.fillStyle = '#E0F7FA';
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = '#B2EBF2';
      this.ctx.beginPath();
      this.ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Moon crescent shadow cutout
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = this.getInterpolatedColors().bg1;
      this.ctx.beginPath();
      this.ctx.arc(moonX + 6, moonY - 4, 15, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawVisualJuice() {
    // Score starbursts
    this.scoreParticles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Death Feathers
    this.feathers.forEach(p => {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      
      // Draw a simple feather shape (drawn horizontally)
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, p.size * 1.8 * p.life, p.size * 0.6 * p.life, 0, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  getThemeColors() {
    if (this.timeCycle < 500) {
      return CONFIG.VISUALS.THEMES.DAY;
    } else if (this.timeCycle >= 500 && this.timeCycle < 700) {
      return CONFIG.VISUALS.THEMES.SUNSET;
    } else if (this.timeCycle >= 700 && this.timeCycle < 1400) {
      return CONFIG.VISUALS.THEMES.NIGHT;
    } else {
      return CONFIG.VISUALS.THEMES.SUNSET;
    }
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
    this.stopAmbientAudio();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
