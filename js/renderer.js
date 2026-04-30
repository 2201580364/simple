/**
 * Renderer module - Draws the game state onto a Canvas.
 * @module renderer
 */

/** Default colors */
const COLORS = {
  BACKGROUND: '#1a1a2e',
  GRID_LINE: '#16213e',
  SNAKE_HEAD: '#e94560',
  SNAKE_BODY: '#0f3460',
  FOOD: '#f5c518'
};

/**
 * Draws the entire game frame including background, grid, snake, and food.
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D context
 * @param {{ snake: Array<{x:number, y:number}>, food: {x:number, y:number} }} state - Current game state
 * @param {number} cellSize - Size of each grid cell in pixels
 * @param {number} gridWidth - Number of cells horizontally
 * @param {number} gridHeight - Number of cells vertically
 */
export function render(ctx, state, cellSize, gridWidth, gridHeight) {
  // --- Parameter validation ---
  if (!ctx || typeof ctx !== 'object' || typeof ctx.clearRect !== 'function') {
    console.error('render: Invalid rendering context.');
    return;
  }
  if (!state || typeof state !== 'object') {
    console.error('render: State object is required.');
    return;
  }
  if (typeof cellSize !== 'number' || cellSize <= 0) {
    console.error('render: cellSize must be a positive number.');
    return;
  }
  if (typeof gridWidth !== 'number' || gridWidth <= 0 || !Number.isInteger(gridWidth)) {
    console.error('render: gridWidth must be a positive integer.');
    return;
  }
  if (typeof gridHeight !== 'number' || gridHeight <= 0 || !Number.isInteger(gridHeight)) {
    console.error('render: gridHeight must be a positive integer.');
    return;
  }

  const canvasWidth = gridWidth * cellSize;
  const canvasHeight = gridHeight * cellSize;

  // --- Clear canvas ---
  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // --- Draw grid lines ---
  ctx.strokeStyle = COLORS.GRID_LINE;
  ctx.lineWidth = 0.5;
  // vertical lines
  for (let x = 0; x <= gridWidth; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, canvasHeight);
    ctx.stroke();
  }
  // horizontal lines
  for (let y = 0; y <= gridHeight; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(canvasWidth, y * cellSize);
    ctx.stroke();
  }

  // --- Draw snake ---
  const snake = state.snake;
  if (Array.isArray(snake) && snake.length > 0) {
    snake.forEach((segment, index) => {
      const x = segment.x * cellSize;
      const y = segment.y * cellSize;
      ctx.fillStyle = index === 0 ? COLORS.SNAKE_HEAD : COLORS.SNAKE_BODY;
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2); // small margin for better look
    });
  } else {
    console.warn('render: snake data is missing or empty, nothing to draw.');
  }

  // --- Draw food (degraded gracefully) ---
  const food = state.food;
  if (food && typeof food.x === 'number' && typeof food.y === 'number') {
    const fx = food.x * cellSize;
    const fy = food.y * cellSize;
    ctx.fillStyle = COLORS.FOOD;
    // Draw a circle for food
    ctx.beginPath();
    ctx.arc(fx + cellSize / 2, fy + cellSize / 2, cellSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    console.warn('render: food data is invalid or missing, skipped drawing food.');
  }
}
