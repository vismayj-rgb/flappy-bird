/**
 * Run Log Manager
 * Persists the top 5 best runs (score, difficulty, date) in localStorage and renders them.
 */

class RunLogManager {
  constructor() {
    this.runs = this.load();
  }

  load() {
    if (typeof StorageManager !== 'undefined') {
      return StorageManager.get(CONFIG.STORAGE.BEST_RUNS, []);
    }
    return [];
  }

  save() {
    if (typeof StorageManager !== 'undefined') {
      StorageManager.set(CONFIG.STORAGE.BEST_RUNS, this.runs);
    }
  }

  /**
   * Record a completed run and keep only the top 5 by score.
   * @param {number} score
   * @param {string} difficulty
   */
  record(score, difficulty) {
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.runs.push({ score, difficulty, date: dateStr });

    // Sort descending by score and keep top 5
    this.runs.sort((a, b) => b.score - a.score);
    this.runs = this.runs.slice(0, 5);
    this.save();
    this.refreshUI();
  }

  refreshUI() {
    const tbody = document.getElementById('bestRunsBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (this.runs.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="4" style="text-align:center;color:#aaa;">No runs yet!</td>';
      tbody.appendChild(tr);
      return;
    }

    this.runs.forEach((run, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${run.score}</td>
        <td>${run.difficulty}</td>
        <td>${run.date}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// Create global instance
const runLogManager = new RunLogManager();
