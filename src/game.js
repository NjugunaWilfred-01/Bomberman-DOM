/**
 * Main Game Entry Point
 * Uses mini-framework for rendering and state management
 */

import { h, globalState } from './mini-framework/src/framework.js';
import { GameRenderer } from './src/core/game-renderer.js';

// Initialize game state
globalState.set('game', {
  player: { x: 100, y: 100 },
  enemies: [],
  score: 0,
  isRunning: false
});

// Create game renderer
const gameRenderer = new GameRenderer(document.getElementById('game'));

// Game update logic
gameRenderer.setUpdateFunction((state, deltaTime) => {
  // Update player position, enemies, etc.
  // This runs every frame at 60 FPS
  
  return state;
});

// Game render logic
gameRenderer.setRenderFunction((state, deltaTime) => {
  return h('div', { class: 'game-container' }, [
    h('div', { class: 'hud' }, [
      h('span', {}, `Score: ${state.score}`),
      h('span', {}, `FPS: ${state.fps || 0}`)
    ]),
    h('div', { 
      class: 'player', 
      style: `transform: translate(${state.player.x}px, ${state.player.y}px)` 
    }),
    // Render enemies, UI, etc.
  ]);
});

// Start the game
gameRenderer.start();