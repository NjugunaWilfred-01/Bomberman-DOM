/**
 * Game Renderer
 * Integrates game loop with mini-framework's virtual DOM
 */

import { vdom } from '../../mini-framework/src/framework.js';
import { GameLoop } from './game-loop.js';

export class GameRenderer {
  constructor(container) {
    this.container = container;
    this.gameLoop = new GameLoop({
      update: this.update.bind(this),
      render: this.render.bind(this),
      onFPS: this.onFPSUpdate.bind(this)
    });
    
    this.gameState = {};
    this.currentVNode = null;
    this.renderFunction = null;
    this.updateFunction = null;
  }

  setRenderFunction(renderFn) {
    this.renderFunction = renderFn;
  }

  setUpdateFunction(updateFn) {
    this.updateFunction = updateFn;
  }

  update(deltaTime) {
    if (this.updateFunction) {
      this.gameState = this.updateFunction(this.gameState, deltaTime) || this.gameState;
    }
  }

  render(deltaTime) {
    if (this.renderFunction && this.container) {
      const newVNode = this.renderFunction(this.gameState, deltaTime);
      
      if (newVNode !== this.currentVNode) {
        vdom.mount(newVNode, this.container);
        this.currentVNode = newVNode;
      }
    }
  }

  onFPSUpdate(fps) {
    this.gameState.fps = fps;
  }

  start() {
    this.gameLoop.start();
  }

  stop() {
    this.gameLoop.stop();
  }

  getFPS() {
    return this.gameLoop.getFPS();
  }
}