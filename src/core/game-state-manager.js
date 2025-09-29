/**
 * Game State Manager
 * Manages different game screens and states (nickname input, game, etc.)
 */

export class GameStateManager {
  constructor() {
    this.currentScreen = 'nickname'; // 'nickname', 'game', 'lobby'
    this.playerData = {
      nickname: '',
      id: null,
      isConnected: false
    };
    this.gameData = {};
    this.callbacks = {
      onScreenChange: null,
      onPlayerDataChange: null
    };
  }

  setScreen(screen) {
    const previousScreen = this.currentScreen;
    this.currentScreen = screen;
    
    if (this.callbacks.onScreenChange) {
      this.callbacks.onScreenChange(screen, previousScreen);
    }
  }

  setPlayerData(data) {
    this.playerData = { ...this.playerData, ...data };
    
    if (this.callbacks.onPlayerDataChange) {
      this.callbacks.onPlayerDataChange(this.playerData);
    }
  }

  setGameData(data) {
    this.gameData = { ...this.gameData, ...data };
  }

  getCurrentScreen() {
    return this.currentScreen;
  }

  getPlayerData() {
    return this.playerData;
  }

  getGameData() {
    return this.gameData;
  }

  onScreenChange(callback) {
    this.callbacks.onScreenChange = callback;
  }

  onPlayerDataChange(callback) {
    this.callbacks.onPlayerDataChange = callback;
  }

  isNicknameValid(nickname) {
    return nickname && 
           nickname.trim().length >= 2 && 
           nickname.trim().length <= 20 &&
           /^[a-zA-Z0-9_-]+$/.test(nickname.trim());
  }

  sanitizeNickname(nickname) {
    return nickname.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  }
}
