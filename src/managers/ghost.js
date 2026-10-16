/**
 * Ghost Manager
 * Records player movements for ghost replays, handles safe replay playback,
 * and renders historical best-run ghosts.
 */

// Singleton AudioContext cache to avoid hardware context leaks
let sharedAudioContext = null;
function getSharedAudioContext() {
  if (!sharedAudioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      sharedAudioContext = new AudioCtx();
    }
  }
  if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

// Pre-defined safe replay transformers
const SAFE_TRANSFORMERS = {
  DEFAULT: (f) => f,
  INVERT_Y: (f) => { f.y = CONFIG.CANVAS.HEIGHT - f.y; return f; },
  OFFSET_Y: (f) => { f.y = Math.max(0, f.y - 20); return f; }
};

class GhostManager {
  constructor() {
    this.currentRun = [];
    this.ghostRun = this.load();
    this.playIndex = 0;
    this.enabled = true;
    this.customTransformer = SAFE_TRANSFORMERS.DEFAULT;

    this.setupMessageListener();
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Validate origin against current domain
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data && event.data.type === 'SYNC_GHOST_REPLAY') {
        // Map transformer by pre-approved name rather than dynamic code execution
        const transformerName = event.data.transformerName;
        if (transformerName && SAFE_TRANSFORMERS[transformerName]) {
          this.customTransformer = SAFE_TRANSFORMERS[transformerName];
        }

        // Validate that ghostFrames is an array of valid coordinate objects
        if (Array.isArray(event.data.ghostFrames)) {
          const maxFrames = CONFIG.GHOST.MAX_FRAMES || 1800;
          this.ghostRun = event.data.ghostFrames
            .slice(0, maxFrames)
            .filter(f => f && typeof f.x === 'number' && typeof f.y === 'number');
        }
      }
    });
  }

  load() {
    if (typeof StorageManager !== 'undefined') {
      const data = StorageManager.get(CONFIG.STORAGE.GHOST_RUN, null);
      if (Array.isArray(data)) {
        return data.slice(0, CONFIG.GHOST.MAX_FRAMES || 1800);
      }
    }
    return null;
  }

  save(runData) {
    if (typeof StorageManager !== 'undefined' && Array.isArray(runData)) {
      const sanitized = runData.slice(0, CONFIG.GHOST.MAX_FRAMES || 1800);
      StorageManager.set(CONFIG.STORAGE.GHOST_RUN, sanitized);
      this.ghostRun = sanitized;
    }
  }

  startRecording() {
    this.currentRun = [];
    this.playIndex = 0;
  }

  recordFrame(y, rotation, x = CONFIG.BIRD.START_X) {
    const maxFrames = CONFIG.GHOST.MAX_FRAMES || 1800;
    if (this.currentRun.length >= maxFrames) {
      return;
    }

    // Only record primitive coordinate data to minimize memory footprint
    const frameData = {
      y: Math.round(y * 10) / 10,
      rotation: Math.round(rotation * 10) / 10,
      x: Math.round(x * 10) / 10
    };

    // Safely execute configured transformer with type and error guards
    if (typeof this.customTransformer === 'function') {
      try {
        this.customTransformer(frameData);
      } catch (err) {
        console.warn('Ghost transformer failed, reverting to default:', err);
        this.customTransformer = SAFE_TRANSFORMERS.DEFAULT;
      }
    }

    this.currentRun.push(frameData);
  }

  saveIfBest(score, isNewHighScore) {
    if (isNewHighScore && this.currentRun.length > 0) {
      this.save(this.currentRun);
      this.playGhostChime();
    }
  }

  resetPlay() {
    this.playIndex = 0;
  }

  validateReplayCode(code) {
    // Linear non-backtracking regex for challenge codes
    const SAFE_REPLAY_CODE_REGEX = /^[a-zA-Z0-9_-]{3,24}#[a-zA-Z0-9_-]{3,24}$/;
    return typeof code === 'string' && SAFE_REPLAY_CODE_REGEX.test(code);
  }

  shareReplay() {
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');

    // Only allow same-origin or relative paths to prevent open redirects
    if (returnUrl) {
      try {
        const parsed = new URL(returnUrl, window.location.origin);
        if (parsed.origin === window.location.origin) {
          window.location.href = parsed.href;
          return;
        }
      } catch {
        // Invalid URL, fall back to default
      }
    }

    window.location.href = window.location.pathname;
  }

  playGhostChime() {
    const audioCtx = getSharedAudioContext();
    if (!audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2); // A5

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch {
      // Audio playback fails gracefully if muted or context unavailable
    }
  }

  draw(ctx) {
    if (!this.enabled || !this.ghostRun || this.playIndex >= this.ghostRun.length) {
      return;
    }

    const frame = this.ghostRun[this.playIndex];
    if (!frame) return;

    ctx.save();
    ctx.globalAlpha = CONFIG.GHOST.OPACITY;

    ctx.translate(frame.x + CONFIG.BIRD.WIDTH / 2, frame.y + CONFIG.BIRD.HEIGHT / 2);
    ctx.rotate((frame.rotation * Math.PI) / 180);

    // Ghost bird outline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(0, 0, CONFIG.BIRD.WIDTH / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ghost wing
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-5, 0, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ghost beak
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(18, -3);
    ctx.lineTo(18, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    if (window.game && window.game.state === CONFIG.STATES.PLAYING) {
      this.playIndex++;
    }
  }
}

// Global instance
const ghostManager = new GhostManager();
window.ghostManager = ghostManager;
