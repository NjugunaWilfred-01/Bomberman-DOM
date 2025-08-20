/**
 * Game Loop System
 * Main render and update loop using requestAnimationFrame
 */

export class GameLoop {
  constructor(options = {}) {
    this.isRunning = false;
    this.lastTime = 0;
    this.deltaTime = 0;
    this.targetFPS = options.targetFPS || 60;
    this.frameInterval = 1000 / this.targetFPS;
    
    // Callbacks
    this.updateCallback = options.update || (() => {});
    this.renderCallback = options.render || (() => {});
    this.fpsCallback = options.onFPS || null;
    
    // Performance tracking
    this.frameCount = 0;
    this.fpsUpdateInterval = 1000;
    this.lastFPSUpdate = 0;
    this.currentFPS = 0;
    
    this.tick = this.tick.bind(this);
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.lastFPSUpdate = this.lastTime;
    this.frameCount = 0;
    
    requestAnimationFrame(this.tick);
  }

  stop() {
    this.isRunning = false;
  }

  tick(currentTime) {
    if (!this.isRunning) return;

    this.deltaTime = currentTime - this.lastTime;
    
    if (this.deltaTime >= this.frameInterval) {
      this.update(this.deltaTime / 1000);
      this.render(this.deltaTime / 1000);
      this.updateFPS(currentTime);
      
      this.lastTime = currentTime - (this.deltaTime % this.frameInterval);
    }
    
    requestAnimationFrame(this.tick);
  }

  update(deltaTime) {
    try {
      this.updateCallback(deltaTime);
    } catch (error) {
      console.error('Error in update callback:', error);
    }
  }

  render(deltaTime) {
    try {
      this.renderCallback(deltaTime);
    } catch (error) {
      console.error('Error in render callback:', error);
    }
  }

  updateFPS(currentTime) {
    this.frameCount++;
    
    if (currentTime - this.lastFPSUpdate >= this.fpsUpdateInterval) {
      this.currentFPS = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastFPSUpdate)
      );
      
      if (this.fpsCallback) {
        this.fpsCallback(this.currentFPS);
      }
      
      this.frameCount = 0;
      this.lastFPSUpdate = currentTime;
    }
  }

  getFPS() {
    return this.currentFPS;
  }
}