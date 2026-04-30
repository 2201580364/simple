/**
 * Canvas renderer for the snake game.
 * @module renderer
 */

/** Canvas background color */
const BG_COLOR = '#000';
/** Grid line color */
const GRID_COLOR = '#333';
/** Snake head color */
const SNAKE_HEAD_COLOR = '#0f0';
/** Snake body color */
const SNAKE_BODY_COLOR = '#0a0';
/** Food color */
const FOOD_COLOR = '#f00';

/**
 * Renders the game state onto the canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context.
 * @param {Object} state - The current game state.
 * @param {Array<{x: number, y: number}>} state.snake - Array of snake segment positions.
 * @param {{x: number, y: number}} state.food - The current food position.
 * @param {number} cellSize - Size of each grid cell in pixels.
 * @param {number} gridWidth - Number of cells in width.
 * @param {number} gridHeight - Number of cells in height.
 */
export function render(ctx, state, cellSize, gridWidth, gridHeight) {
  // Defensive checks to prevent crashes
  if (!ctx || !state || !Array.isArray(state.snake) || !state.food) {
    console.error('render: Invalid parameters - ctx, state, state.snake or state.food is missing/invalid');
    return;
  }
  if (
    !Number.isFinite(cellSize) || cellSize <= 0 ||
    !Number.isFinite(gridWidth) || gridWidth <= 0 ||
    !Number.isFinite(gridHeight) || gridHeight <= 0
  ) {
    console.error('render: cellSize, gridWidth, and gridHeight must be positive finite numbers');
    return;
  }

  // Clear the entire canvas
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, gridWidth * cellSize, gridHeight * cellSize);

  // Draw grid lines (optional, for visual aid)
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= gridWidth; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, gridHeight * cellSize);
    ctx.stroke();
  }
  for (let y = 0; y <= gridHeight; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(gridWidth * cellSize, y * cellSize);
    ctx.stroke();
  }

  // Draw food
  // At this point state.food is guaranteed to exist (checked above)
  const food = state.food;
  if (food && typeof food.x === 'number' && typeof food.y === 'number') {
    ctx.fillStyle = FOOD_COLOR;
    ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize);
  }

  // Draw snake
  // state.snake is guaranteed to be an array; empty arrays are safe
  const snake = state.snake;
  if (snake && snake.length > 0) {
    snake.forEach((segment, index) => {
      if (!segment || typeof segment.x !== 'number' || typeof segment.y !== 'number') {
        return; // skip invalid segments
      }
      ctx.fillStyle = index === 0 ? SNAKE_HEAD_COLOR : SNAKE_BODY_COLOR;
      ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
    });
  }
}
