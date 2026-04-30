/**
 * Game Loop Module
 * Integrates core game logic, rendering, input handling, and UI.
 * Manages the main game loop (update, render) and high score persistence.
 * @module main
 */
import { SnakeGame } from './game-core.js';
import { render } from './renderer.js';
import { setupInput } from './input-handler.js';
import { UI } from './ui.js';

/** Fixed size of each grid cell in pixels */
const CELL_SIZE = 20;
/** Number of cells horizontally */
const GRID_WIDTH = 20;
/** Number of cells vertically */
const GRID_HEIGHT = 20;
/** Game tick interval in milliseconds */
const GAME_SPEED = 150;

/** @type {SnakeGame|null} Active game instance */
let game = null;
/** @type {UI|null} UI controller instance */
let ui = null;
/** @type {number|null} Timer ID for the game loop */
let gameLoopTimer = null;
/** @type {Function|null} Cleanup function for input event listener */
let inputCleanup = null;

/**
 * Handles direction change from user input.
 * Only allows direction changes while the game is active (not game over).
 * @param {string} direction - Direction string from KeyDirectionMap
 */
function handleDirectionChange(direction) {
  if (game && !game.getState().gameOver) {
    game.setDirection(direction);
  }
}

/**
 * Main game loop tick.
 * Updates game state, renders current frame, and updates UI scores.
 * Stops the loop and shows game-over screen when the game ends.
 */
function gameLoop() {
  if (!game) return;

  const { gameOver } = game.update();
  const state = game.getState();

  ui.updateScore(state.score);

  // Update persistent high score
  try {
    const storedHigh = localStorage.getItem('snakeHighScore');
    let currentHigh = storedHigh ? parseInt(storedHigh, 10) : 0;
    if (state.score > currentHigh) {
      currentHigh = state.score;
      localStorage.setItem('snakeHighScore', currentHigh.toString());
    }
    ui.updateHighScore(currentHigh);
  } catch (e) {
    // localStorage might be unavailable (e.g., privacy mode); degrade gracefully
    console.warn('Could not access localStorage for high score:', e);
    ui.updateHighScore(0);
  }

  // Render current state on canvas
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    render(ctx, { snake: state.snake, food: state.food }, CELL_SIZE, GRID_WIDTH, GRID_HEIGHT);
  }

  // Handle game over
  if (gameOver) {
    stopGame();
    ui.showGameOver();
  }
}

/**
 * Starts (or restarts) the game.
 * Validates required DOM elements, adjusts canvas size to match grid,
 * creates fresh game and UI instances, sets initial direction and starts the loop.
 */
function startGame() {
  // Validate that all required DOM elements exist (QA fix: check existence)
  const requiredIds = ['score', 'highScore', 'gameOver', 'restartButton', 'gameCanvas'];
  for (const id of requiredIds) {
    if (!document.getElementById(id)) {
      console.error(`Required DOM element with id "${id}" is missing. Unable to start the game.`);
      return;
    }
  }

  // Ensure canvas dimensions exactly match the logical grid (QA fix: integer multiple)
  const canvas = document.getElementById('gameCanvas');
  canvas.width = GRID_WIDTH * CELL_SIZE;
  canvas.height = GRID_HEIGHT * CELL_SIZE;

  // Clean up any previously running game
  if (gameLoopTimer) {
    clearInterval(gameLoopTimer);
    gameLoopTimer = null;
  }
  if (inputCleanup) {
    inputCleanup();
    inputCleanup = null;
  }

  // Create a fresh game instance
  game = new SnakeGame(GRID_WIDTH, GRID_HEIGHT);
  game.init();
  game.setDirection('right'); // QA fix: explicitly set initial direction

  // Initialize UI (reuse existing instance if available to avoid duplicate event bindings)
  if (!ui) {
    ui = new UI('score', 'highScore', 'gameOver', 'restartButton');
    ui.setRestartHandler(() => startGame());
  } else {
    ui.hideGameOver();
  }

  // Set up input handling
  const inputResult = setupInput(handleDirectionChange);
  inputCleanup = inputResult.cleanup;

  // Bootstrap scores
  ui.updateScore(0);
  try {
    const storedHigh = localStorage.getItem('snakeHighScore');
    ui.updateHighScore(storedHigh ? parseInt(storedHigh, 10) : 0);
  } catch (e) {
    ui.updateHighScore(0);
  }

  // Start the game loop
  gameLoopTimer = setInterval(gameLoop, GAME_SPEED);
}

/**
 * Stops the game loop and cleans up input event listeners.
 */
function stopGame() {
  if (gameLoopTimer) {
    clearInterval(gameLoopTimer);
    gameLoopTimer = null;
  }
  if (inputCleanup) {
    inputCleanup();
    inputCleanup = null;
  }
}

export { startGame, stopGame, gameLoop };
