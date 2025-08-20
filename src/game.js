import { h } from '../mini-framework/src/framework.js';
import { GameRenderer } from './core/game-renderer.js';

const initialState = {
  player: { x: 64, y: 64 },
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
  score: 0
};

const gameRenderer = new GameRenderer(document.getElementById('game'));

gameRenderer.setUpdateFunction((state, deltaTime) => {
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

gameRenderer.setRenderFunction((state, deltaTime) => {
  return h('div', { class: 'game-board' }, [
    h('div', { class: 'hud' }, [
      h('span', {}, `Score: ${state.score}`),
      h('span', {}, `FPS: ${Math.round(state.fps || 0)}`)
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
      style: `left: ${state.player.x}px; top: ${state.player.y}px` 
    })
  ]);
});

gameRenderer.gameState = initialState;
gameRenderer.start();

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    const state = gameRenderer.gameState;
    state.bombs.push({ 
      x: state.player.x, 
      y: state.player.y, 
      timer: 3 
    });
  }
});