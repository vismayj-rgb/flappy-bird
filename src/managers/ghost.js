/**
 * Ghost Manager
 * Records the player's movements (y, rotation) on every frame,
 * saves the best run to localStorage, and renders a semi-transparent ghost replay.
 */

class GhostManager {
  constructor() {
    this.currentRun = [];
    this.ghostRun = this.load();
    this.playIndex = 0;
  }

  load() {
    if (typeof StorageManager !== 'undefined') {
      return StorageManager.get(CONFIG.STORAGE.GHOST_RUN, null);
    }
    return null;
  }

  save(runData) {
    if (typeof StorageManager !== 'undefined') {
      StorageManager.set(CONFIG.STORAGE.GHOST_RUN, runData);
      this.ghostRun = runData;
    }
  }

  startRecording() {
    this.currentRun = [];
    this.playIndex = 0;
  }

  recordFrame(y, rotation, x = CONFIG.BIRD.START_X) {
    this.currentRun.push({ y, rotation, x });
  }

  saveIfBest(score, isNewHighScore) {
    if (isNewHighScore && this.currentRun.length > 0) {
      this.save(this.currentRun);
    }
  }

  resetPlay() {
    this.playIndex = 0;
  }

  draw(ctx) {
    if (!this.ghostRun || this.playIndex >= this.ghostRun.length) {
      return;
    }

    const frame = this.ghostRun[this.playIndex];
    if (!frame) return;

    ctx.save();
    ctx.globalAlpha = 0.35; // semi-transparent ghost
    
    // Position
    ctx.translate(frame.x + CONFIG.BIRD.WIDTH / 2, frame.y + CONFIG.BIRD.HEIGHT / 2);
    ctx.rotate((frame.rotation * Math.PI) / 180);
    
    // Draw simple white outline/filled bird shape
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    
    ctx.beginPath();
    ctx.arc(0, 0, CONFIG.BIRD.WIDTH / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Wing
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-5, 0, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Beak
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(18, -3);
    ctx.lineTo(18, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Advance playback if game is running (managed in loop)
    if (window.game && window.game.state === CONFIG.STATES.PLAYING) {
      this.playIndex++;
    }
  }
}

// Global instance
const ghostManager = new GhostManager();
window.ghostManager = ghostManager;
