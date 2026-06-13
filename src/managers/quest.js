/**
 * Quest Manager
 * Manages daily quest progress, persistence, claiming coin rewards, and rendering quest UI cards.
 */

class QuestManager {
  constructor() {
    this.questState = this.loadQuestState();
  }

  loadQuestState() {
    let saved = null;
    if (typeof StorageManager !== 'undefined') {
      saved = StorageManager.get(CONFIG.STORAGE.QUESTS, null);
    }
    
    if (saved) {
      // Ensure any new config quests are merged
      CONFIG.QUESTS.forEach(q => {
        if (!saved[q.id]) {
          saved[q.id] = { progress: 0, completed: false, claimed: false };
        }
      });
      return saved;
    }

    // Default initialization
    const state = {};
    CONFIG.QUESTS.forEach(q => {
      state[q.id] = { progress: 0, completed: false, claimed: false };
    });
    return state;
  }

  save() {
    if (typeof StorageManager !== 'undefined') {
      StorageManager.set(CONFIG.STORAGE.QUESTS, this.questState);
    }
  }

  progress(metric, amount = 1) {
    let changed = false;

    CONFIG.QUESTS.forEach(quest => {
      const state = this.questState[quest.id];
      if (!state || state.completed) return;

      if (quest.metric === metric) {
        if (metric === 'combo') {
          // Combo quest needs a maximum threshold check
          if (amount > state.progress) {
            state.progress = amount;
            changed = true;
          }
        } else {
          // Standard incremental count
          state.progress += amount;
          changed = true;
        }

        // Check completion
        if (state.progress >= quest.target) {
          state.progress = quest.target;
          state.completed = true;
          changed = true;

          // Play ding
          if (window.soundManager) {
            soundManager.playTone(700, 0.15, 'sine');
            setTimeout(() => soundManager.playTone(1050, 0.25, 'sine'), 80);
          }

          // Show quest completion toast
          if (window.achievementManager) {
            achievementManager.showToast(`Quest Complete! 📜`, `${quest.title} finished. Claim reward in panel!`);
          }
        }
      }
    });

    if (changed) {
      this.save();
      this.refreshUI();
    }
  }

  claimReward(questId) {
    const quest = CONFIG.QUESTS.find(q => q.id === questId);
    const state = this.questState[questId];

    if (quest && state && state.completed && !state.claimed) {
      state.claimed = true;
      this.save();
      
      // Pay player
      if (window.shopManager) {
        shopManager.addCoins(quest.reward);
      }

      if (window.soundManager) {
        soundManager.playTone(523.25, 0.1, 'sine');
        setTimeout(() => soundManager.playTone(659.25, 0.1, 'sine'), 50);
        setTimeout(() => soundManager.playTone(783.99, 0.2, 'sine'), 100);
      }

      this.refreshUI();
    }
  }

  refreshUI() {
    const listEl = document.getElementById('questsList');
    if (!listEl) return;

    listEl.innerHTML = '';

    CONFIG.QUESTS.forEach(quest => {
      const state = this.questState[quest.id] || { progress: 0, completed: false, claimed: false };
      const percent = Math.min(100, Math.floor((state.progress / quest.target) * 100));

      const card = document.createElement('div');
      card.className = `quest-card ${state.claimed ? 'claimed' : state.completed ? 'completed' : ''}`;

      // Claim button or status display
      let buttonHtml = '';
      if (state.claimed) {
        buttonHtml = `<span class="quest-status claimed">Claimed ✓</span>`;
      } else if (state.completed) {
        buttonHtml = `<button class="btn-quest claim" onclick="questManager.claimReward('${quest.id}')">Claim +🪙${quest.reward}</button>`;
      } else {
        buttonHtml = `<span class="quest-status progress-val">${state.progress}/${quest.target}</span>`;
      }

      card.innerHTML = `
        <div class="quest-body">
          <div class="quest-title-row">
            <span class="quest-title">${quest.title}</span>
            ${buttonHtml}
          </div>
          <p class="quest-desc">${quest.desc}</p>
          <div class="quest-progress-bg">
            <div class="quest-progress-bar" style="width: ${percent}%;"></div>
          </div>
        </div>
      `;

      listEl.appendChild(card);
    });
  }
}

// Global instance
const questManager = new QuestManager();
window.questManager = questManager;
