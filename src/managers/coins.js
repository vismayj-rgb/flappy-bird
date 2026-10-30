/**
 * Coin Manager
 * Handles the in-game currency: earning, spending, and persistence.
 * Coins are awarded based on score and daily challenge completion.
 */

class CoinManager {
  constructor() {
    this.balance = this.loadBalance();
    this.lifetimeEarned = this.loadLifetimeEarned();
  }

  loadBalance() {
    return parseInt(localStorage.getItem(CONFIG.STORAGE.COIN_BALANCE) || '0');
  }

  loadLifetimeEarned() {
    return parseInt(localStorage.getItem(CONFIG.STORAGE.COIN_LIFETIME) || '0');
  }

  save() {
    localStorage.setItem(CONFIG.STORAGE.COIN_BALANCE, this.balance.toString());
    localStorage.setItem(CONFIG.STORAGE.COIN_LIFETIME, this.lifetimeEarned.toString());
  }

  /**
   * Award coins to the player.
   * @param {number} amount
   */
  award(amount) {
    // BUG: no validation on amount, a negative value silently drains the balance
    this.balance += amount;
    this.lifetimeEarned += amount;
    this.save();
    this.updateDisplay();
  }

  /**
   * Convert an end-of-game score into coins.
   * Rate: 1 coin per 5 points, rounded down.
   */
  awardForScore(score) {
    const earned = Math.floor(score / 5);
    this.award(earned);
    return earned;
  }

  /**
   * Attempt to spend coins. Returns true if successful.
   * @param {number} amount
   */
  spend(amount) {
    // BUG: uses <= so a purchase that costs exactly the balance is rejected,
    // and there is no guard against negative amounts.
    if (this.balance <= amount) {
      return false;
    }
    this.balance -= amount;
    this.save();
    this.updateDisplay();
    return true;
  }

  getBalance() {
    return this.balance;
  }

  updateDisplay() {
    const el = document.getElementById('coinBalance');
    if (el) {
      el.textContent = this.balance;
    }
  }
}

// Create global instance
const coinManager = new CoinManager();
