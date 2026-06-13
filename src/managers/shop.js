/**
 * Shop Manager
 * Manages currency (gold coins), premium skins purchases, equipment, and renders the cosmetic shop UI.
 */

class ShopManager {
  constructor() {
    this.coins = this.loadCoins();
    this.unlockedSkins = this.loadUnlockedSkins();
    this.equippedSkin = this.loadEquippedSkin();
  }

  loadCoins() {
    if (typeof StorageManager !== 'undefined') {
      return parseInt(StorageManager.get(CONFIG.STORAGE.COINS, 0));
    }
    return 0;
  }

  saveCoins() {
    if (typeof StorageManager !== 'undefined') {
      StorageManager.set(CONFIG.STORAGE.COINS, this.coins);
    }
  }

  addCoins(amount) {
    this.coins += amount;
    this.saveCoins();
    this.refreshUI();
    
    // Check wealthy bird achievement
    if (window.achievementManager) {
      achievementManager.check('wealthy_bird', this.coins);
    }
  }

  loadUnlockedSkins() {
    if (typeof StorageManager !== 'undefined') {
      const saved = StorageManager.get(CONFIG.STORAGE.UNLOCKED_SKINS, null);
      if (saved) return saved;
    }
    // Default unlocked standard skins
    return { CLASSIC: true, RUBY: true, EMERALD: true, VORTEX: true };
  }

  saveUnlockedSkins() {
    if (typeof StorageManager !== 'undefined') {
      StorageManager.set(CONFIG.STORAGE.UNLOCKED_SKINS, this.unlockedSkins);
    }
  }

  loadEquippedSkin() {
    if (typeof StorageManager !== 'undefined') {
      return StorageManager.get(CONFIG.STORAGE.BIRD_SKIN, 'CLASSIC');
    }
    return 'CLASSIC';
  }

  buySkin(skinId) {
    const skinDef = CONFIG.BIRD.SKINS[skinId];
    if (!skinDef) return false;

    if (this.unlockedSkins[skinId]) return true; // Already unlocked

    if (this.coins >= skinDef.price) {
      this.coins -= skinDef.price;
      this.unlockedSkins[skinId] = true;
      this.saveCoins();
      this.saveUnlockedSkins();
      
      if (window.soundManager) {
        soundManager.playTone(600, 0.25, 'triangle');
        setTimeout(() => soundManager.playTone(900, 0.3, 'sine'), 100);
      }

      this.equipSkin(skinId);
      this.refreshUI();
      return true;
    } else {
      alert("Not enough gold coins!");
      return false;
    }
  }

  equipSkin(skinId) {
    if (!this.unlockedSkins[skinId]) return false;

    this.equippedSkin = skinId;
    if (typeof StorageManager !== 'undefined') {
      StorageManager.set(CONFIG.STORAGE.BIRD_SKIN, skinId);
    }

    if (window.game && window.game.bird) {
      window.game.bird.skin = skinId;
      window.game.draw();
    }

    // Update skin dropdown if it exists
    const skinSel = document.getElementById('skinSelector');
    if (skinSel) {
      skinSel.value = skinId;
    }

    this.refreshUI();
    return true;
  }

  refreshUI() {
    // 1. Update Coin Display in UI
    const coinDisplays = document.querySelectorAll('.coin-balance-val');
    coinDisplays.forEach(el => {
      el.textContent = this.coins;
    });

    // 2. Render Shop Items List
    const shopList = document.getElementById('shopSkinsList');
    if (!shopList) return;

    shopList.innerHTML = '';

    Object.keys(CONFIG.BIRD.SKINS).forEach(key => {
      const skin = CONFIG.BIRD.SKINS[key];
      const isUnlocked = !!this.unlockedSkins[key];
      const isEquipped = this.equippedSkin === key;

      const card = document.createElement('div');
      card.className = `shop-item-card ${isEquipped ? 'equipped' : ''}`;
      
      // Determine Action Button HTML
      let buttonHtml = '';
      if (isEquipped) {
        buttonHtml = `<button class="btn-shop equipped" disabled>Equipped</button>`;
      } else if (isUnlocked) {
        buttonHtml = `<button class="btn-shop select" onclick="shopManager.equipSkin('${key}')">Equip</button>`;
      } else {
        buttonHtml = `<button class="btn-shop purchase" onclick="shopManager.buySkin('${key}')">🪙 ${skin.price}</button>`;
      }

      card.innerHTML = `
        <div class="shop-item-info">
          <div class="shop-item-avatar-preview" style="background: ${skin.body}; border-color: ${skin.wing};">
            <div class="shop-item-avatar-wing" style="background: ${skin.wing};"></div>
          </div>
          <div class="shop-item-text">
            <span class="shop-item-title">${skin.name}</span>
            <span class="shop-item-type">${skin.price === 0 ? 'Standard Skin' : 'Premium Skin'}</span>
          </div>
        </div>
        <div class="shop-item-action">
          ${buttonHtml}
        </div>
      `;

      shopList.appendChild(card);
    });

    // 3. Update the index.html skin selector dropdown values to only show unlocked skins, or show locks
    const skinSel = document.getElementById('skinSelector');
    if (skinSel) {
      skinSel.innerHTML = '';
      Object.keys(CONFIG.BIRD.SKINS).forEach(key => {
        const skin = CONFIG.BIRD.SKINS[key];
        const isUnlocked = !!this.unlockedSkins[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = isUnlocked ? skin.name : `🔒 ${skin.name} (${skin.price}g)`;
        option.disabled = !isUnlocked;
        skinSel.appendChild(option);
      });
      skinSel.value = this.equippedSkin;
    }
  }
}

// Global instance
const shopManager = new ShopManager();
// Bind to window for HTML onclick attributes
window.shopManager = shopManager;
