/**
 * Game Loop Module
 * Integrates game core logic, rendering, input handling, and UI.
 * Implements the main game loop, start/stop control, and game-over handling.
 */
import { SnakeGame } from './game-core.js';
import { render } from './renderer.js';
import { setupInput } from './input-handler.js';
import { UI } from './ui.js';

// Module-level state
let game = null;
let gameInterval = null;
let uiInstance = null;
let cleanupInput = null;
let cellSize = 20;
let gridWidth = 0;
let gridHeight = 0;
let canvas = null;
let highScore = 0;

const GAME_SPEED_MS = 150; // game tick interval

/**
 * Handles direction changes from the input module.
 * @param {string} direction - one of 'up', 'down', 'left', 'right'
 */
function handleDirectionChange(direction) {
  if (game) {
    game.setDirection(direction);
  }
}

/**
 * Handles the restart button click.
 * Stops current game (if any) and starts a fresh one.
 */
function handleRestart() {
  stopGame();
  startGame();
}

/**
 * Starts a new game (or restarts).
 * Sets up canvas, game instance, input, UI and begins the main loop.
 */
function startGame() {
  // 1. Canvas and grid setup
  canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Game canvas not found');
    return;
  }
  cellSize = 20; // could be configurable
  gridWidth = Math.floor(canvas.width / cellSize);
  gridHeight = Math.floor(canvas.height / cellSize);

  // 2. Clear any existing game loop
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }

  // 3. Clean up previous input bindings
  if (cleanupInput) {
    cleanupInput();
    cleanupInput = null;
  }

  // 4. Initialize or reset the game core
  if (!game) {
    game = new SnakeGame(gridWidth, gridHeight);
  } else {
    game.reset();
  }

  // 5. Set up keyboard input
  const inputSetup = setupInput(handleDirectionChange);
  cleanupInput = inputSetup.cleanup;

  // 6. UI singleton – create only once, avoid multiple event listeners
  if (!uiInstance) {
    uiInstance = new UI('score', 'highScore', 'gameOver', 'restartButton');
    uiInstance.setRestartHandler(handleRestart);
  } else {
    uiInstance.hideGameOver();
    uiInstance.updateScore(0);
  }

  // 7. Initial render to show empty grid
  const ctx = canvas.getContext('2d');
  render(ctx, game.getState(), cellSize, gridWidth, gridHeight);

  // 8. Start the game loop
  gameInterval = setInterval(gameLoop, GAME_SPEED_MS);
}

/**
 * Stops the game loop and releases resources.
 */
function stopGame() {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
  if (cleanupInput) {
    cleanupInput();
    cleanupInput = null;
  }
}

/**
 * Main game loop tick.
 * Updates game state, renders to canvas, updates UI, and handles game over.
 */
function gameLoop() {
  // Defensive check: if canvas is removed, stop the game safely
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    stopGame();
    return;
  }

  const ctx = canvas.getContext('2d');

  // Update game logic
  const result = game.update();

  // Retrieve current state after update
  const state = game.getState();

  // Render the visual representation
  render(ctx, state, cellSize, gridWidth, gridHeight);

  // Update UI scores
  if (uiInstance) {
    uiInstance.updateScore(state.score);
    if (state.score > highScore) {
      highScore = state.score;
      uiInstance.updateHighScore(highScore);
    }
  }

  // Handle game over condition
  if (result.gameOver) {
    stopGame();
    if (uiInstance) {
      uiInstance.showGameOver();
    }
  }
}

export { startGame, stopGame, gameLoop };
