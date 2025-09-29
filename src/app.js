/**
 * Main Application Controller
 * Manages different screens and coordinates between components
 */

import { h, vdom } from '../mini-framework/src/framework.js';
import { GameStateManager } from './core/game-state-manager.js';
import { ServerClient } from './core/server-client.js';
import { GameRenderer } from './core/game-renderer.js';
import { renderNicknameScreen, renderLoadingScreen } from './components/nickname-screen.js';

export class BombermanApp {
  constructor(container) {
    this.container = container;
    this.stateManager = new GameStateManager();
    this.serverClient = new ServerClient();
    this.gameRenderer = null;
    
    // UI state
    this.nicknameState = {
      nickname: '',
      error: null,
      isLoading: false,
      connectionStatus: 'connecting'
    };
    
    this.currentVNode = null;
    
    this.init();
  }

  init() {
    // Set up state manager callbacks
    this.stateManager.onScreenChange((screen, previousScreen) => {
      console.log(`Screen changed from ${previousScreen} to ${screen}`);
      this.render();
    });

    this.stateManager.onPlayerDataChange((playerData) => {
      console.log('Player data updated:', playerData);
    });

    // Set up server client callbacks
    this.serverClient.onConnect(() => {
      this.nicknameState.connectionStatus = 'connected';
      this.render();
    });

    this.serverClient.onDisconnect(() => {
      this.nicknameState.connectionStatus = 'offline';
      this.render();
    });

    this.serverClient.onNicknameResponse((response) => {
      this.handleNicknameResponse(response);
    });

    // Connect to server
    this.serverClient.connect();
    
    // Initial render
    this.render();
  }

  handleNicknameSubmit(nickname) {
    const sanitizedNickname = this.stateManager.sanitizeNickname(nickname);
    
    if (!this.stateManager.isNicknameValid(sanitizedNickname)) {
      this.nicknameState.error = 'Invalid nickname. Please check the requirements.';
      this.render();
      return;
    }

    this.nicknameState.isLoading = true;
    this.nicknameState.error = null;
    this.render();

    // Send nickname to server
    this.serverClient.sendNickname(sanitizedNickname);
  }

  handleNicknameResponse(response) {
    this.nicknameState.isLoading = false;
    
    if (response.success) {
      // Update player data
      this.stateManager.setPlayerData({
        nickname: response.nickname,
        id: response.playerId,
        isConnected: true
      });
      
      // Switch to game screen
      this.stateManager.setScreen('game');
      this.initializeGame();
    } else {
      this.nicknameState.error = response.message || 'Failed to set nickname. Please try again.';
      this.render();
    }
  }

  handleNicknameChange(nickname) {
    this.nicknameState.nickname = nickname;
    this.nicknameState.error = null;
    this.render();
  }

  initializeGame() {
    // Initialize the game renderer
    this.gameRenderer = new GameRenderer(this.container);
    
    const playerData = this.stateManager.getPlayerData();
    
    // Set up initial game state with player data
    const initialState = {
      player: { 
        x: 64, 
        y: 64,
        nickname: playerData.nickname,
        id: playerData.id
      },
      bombs: [],
      blocks: [
        { x: 128, y: 128 }, { x: 160, y: 128 }, { x: 192, y: 128 },
        { x: 128, y: 160 }, { x: 256, y: 192 }, { x: 320, y: 256 }
      ],
      walls: [
        { x: 0, y: 0 }, { x: 32, y: 0 }, { x: 64, y: 0 }, { x: 96, y: 0 },
        { x: 0, y: 32 }, { x: 0, y: 64 }, { x: 0, y: 96 }
      ],
      explosions: [],
      score: 0,
      connectionStatus: this.nicknameState.connectionStatus
    };

    // Set up game update function
    this.gameRenderer.setUpdateFunction((state, deltaTime) => {
      state.bombs = state.bombs.filter(bomb => {
        bomb.timer -= deltaTime;
        if (bomb.timer <= 0) {
          state.explosions.push({ x: bomb.x, y: bomb.y, timer: 0.3 });
          return false;
        }
        return true;
      });

      state.explosions = state.explosions.filter(explosion => {
        explosion.timer -= deltaTime;
        return explosion.timer > 0;
      });

      return state;
    });

    // Set up game render function
    this.gameRenderer.setRenderFunction((state, deltaTime) => {
      return h('div', { class: 'game-board' }, [
        h('div', { class: 'hud' }, [
          h('span', {}, `Player: ${state.player.nickname}`),
          h('span', {}, `Score: ${state.score}`),
          h('span', {}, `FPS: ${Math.round(state.fps || 0)}`),
          h('div', { class: 'connection-indicator' }, [
            h('div', { 
              class: `status-dot ${state.connectionStatus === 'connected' ? 'status-dot--connected' : 'status-dot--offline'}`
            }),
            h('span', {}, state.connectionStatus === 'connected' ? 'Online' : 'Offline')
          ])
        ]),
        
        ...state.walls.map(wall => 
          h('div', { 
            class: 'wall', 
            style: `left: ${wall.x}px; top: ${wall.y}px` 
          })
        ),
        
        ...state.blocks.map(block => 
          h('div', { 
            class: 'block', 
            style: `left: ${block.x}px; top: ${block.y}px` 
          })
        ),
        
        ...state.bombs.map(bomb => 
          h('div', { 
            class: 'bomb', 
            style: `left: ${bomb.x + 4}px; top: ${bomb.y + 4}px` 
          })
        ),
        
        ...state.explosions.map(explosion => 
          h('div', { 
            class: 'explosion', 
            style: `left: ${explosion.x}px; top: ${explosion.y}px` 
          })
        ),
        
        h('div', { 
          class: 'player', 
          style: `left: ${state.player.x}px; top: ${state.player.y}px`,
          title: state.player.nickname
        })
      ]);
    });

    // Set initial state and start game
    this.gameRenderer.gameState = initialState;
    this.gameRenderer.start();

    // Set up game controls
    this.setupGameControls();
  }

  setupGameControls() {
    document.addEventListener('keydown', (e) => {
      if (this.stateManager.getCurrentScreen() !== 'game') return;
      
      if (e.code === 'Space') {
        const state = this.gameRenderer.gameState;
        const newBomb = { 
          x: state.player.x, 
          y: state.player.y, 
          timer: 3 
        };
        
        state.bombs.push(newBomb);
        
        // Send bomb action to server
        this.serverClient.sendGameAction({
          type: 'place_bomb',
          position: { x: state.player.x, y: state.player.y },
          playerId: state.player.id
        });
      }
    });
  }

  render() {
    let newVNode;

    switch (this.stateManager.getCurrentScreen()) {
      case 'nickname':
        newVNode = renderNicknameScreen(this.nicknameState, {
          onSubmit: (nickname) => this.handleNicknameSubmit(nickname),
          onNicknameChange: (nickname) => this.handleNicknameChange(nickname)
        });
        break;

      case 'loading':
        newVNode = renderLoadingScreen('Connecting to game...');
        break;

      case 'game':
        // Game rendering is handled by GameRenderer
        return;

      default:
        newVNode = renderLoadingScreen();
    }

    if (newVNode !== this.currentVNode) {
      // Store input state before re-render
      const input = document.getElementById('nickname-input');
      let inputValue = '';
      let cursorPos = 0;
      let wasFocused = false;

      if (input) {
        inputValue = input.value;
        cursorPos = input.selectionStart;
        wasFocused = document.activeElement === input;
      }

      vdom.mount(newVNode, this.container);
      this.currentVNode = newVNode;

      // Restore input state after re-render
      if (input && (inputValue || wasFocused)) {
        setTimeout(() => {
          const newInput = document.getElementById('nickname-input');
          if (newInput) {
            if (inputValue && newInput.value !== inputValue) {
              newInput.value = inputValue;
            }
            if (wasFocused) {
              newInput.focus();
              newInput.setSelectionRange(cursorPos, cursorPos);
            }
          }
        }, 0);
      }
    }
  }

  // Public methods for external control
  disconnect() {
    this.serverClient.disconnect();
    if (this.gameRenderer) {
      this.gameRenderer.stop();
    }
  }

  reconnect() {
    this.serverClient.connect();
  }
}
