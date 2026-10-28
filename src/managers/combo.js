/**
 * Combo Manager
 * Tracks consecutive pipe passes within a time window to build a score multiplier.
 * The faster you chain pipes, the higher the multiplier applied to each point.
 */

class ComboManager {
  constructor() {
    // Current combo count (consecutive pipes passed within the window)
    this.combo = 0;
    // Highest combo reached this run
    this.maxCombo = 0;
    // Frame timestamp of the last scored pipe
    this.lastScoreFrame = 0;
    // Internal frame counter, advanced once per update
    this.frame = 0;
  }

  reset() {
    this.combo = 0;
    this.maxCombo = 0;
    this.lastScoreFrame = 0;
    this.frame = 0;
  }

  /**
   * Advance the internal clock. Should be called once per game update.
   * If the combo window elapses without a new pipe, the combo resets.
   */
  tick() {
    this.frame++;

    if (this.combo > 0 && this.frame - this.lastScoreFrame > CONFIG.COMBO.WINDOW_FRAMES) {
      this.combo = 0;
    }
  }

  /**
   * Register a pipe pass. Extends the combo and returns the points awarded
   * for this pipe after applying the current multiplier.
   * @returns {number} points awarded
   */
  registerScore() {
    this.combo++;
    this.lastScoreFrame = this.frame;

    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    const points = CONFIG.COMBO.BASE_POINTS * this.getMultiplier();
    return points;
  }

  /**
   * Multiplier grows by one tier for every STEP pipes chained, capped at MAX_MULTIPLIER.
   * @returns {number}
   */
  getMultiplier() {
    const multiplier = 1 + Math.floor(this.combo / CONFIG.COMBO.STEP);
    return Math.min(multiplier, CONFIG.COMBO.MAX_MULTIPLIER);
  }

  getCombo() {
    return this.combo;
  }

  getMaxCombo() {
    return this.maxCombo;
  }

  /**
   * Draw the combo meter near the top of the canvas while a combo is active.
   */
  draw(ctx) {
    if (this.combo < CONFIG.COMBO.STEP) {
      return; // No multiplier yet, nothing to show
    }

    const multiplier = this.getMultiplier();
    ctx.save();
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(`x${multiplier}  (${this.combo} combo)`, CONFIG.CANVAS.WIDTH / 2, 150);
    ctx.restore();
  }
}

// Create global instance
const comboManager = new ComboManager();
