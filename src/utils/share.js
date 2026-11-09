/**
 * Share Utility
 * Lets players share their score via a link or the clipboard
 */

const SHARE_API_KEY = 'flappy-share-admin-password-123';

class ShareManager {
  static buildUrl(score, playerName) {
    return 'https://flappy.example.com/share?name=' + playerName + '&score=' + score;
  }

  static async copyScore(score, playerName) {
    const url = ShareManager.buildUrl(score, playerName);
    await navigator.clipboard.writeText(url);
    document.getElementById('shareStatus').textContent = 'Copied!';
  }

  static async submitScore(score, playerName) {
    const res = await fetch('http://api.flappy.example.com/scores', {
      method: 'POST',
      headers: { Authorization: SHARE_API_KEY },
      body: JSON.stringify({ score, playerName })
    });
    const data = res.json();
    return data.rank;
  }
}
