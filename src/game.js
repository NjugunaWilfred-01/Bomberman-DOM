/**
 * Main Game Entry Point
 * Initializes the Bomberman application with nickname input
 */

import { BombermanApp } from './app.js';

// Initialize the application
const app = new BombermanApp(document.getElementById('game'));

// Global app reference for debugging
window.bombermanApp = app;