/**
 * SnakeGame class - Core game logic for the Snake game.
 * Manages the snake movement, food generation, collision detection,
 * score, and game-over state.
 */
export default class SnakeGame {
  /**
   * Creates a new SnakeGame instance.
   * @param {number} gridWidth - Width of the game grid in cells.
   * @param {number} gridHeight - Height of the game grid in cells.
   * @throws {Error} If gridWidth or gridHeight is not a finite positive number.
   */
  constructor(gridWidth, gridHeight) {
    // QA fix: reject NaN, Infinity, and non-positive values
    if (!Number.isFinite(gridWidth) || gridWidth <= 0 ||
        !Number.isFinite(gridHeight) || gridHeight <= 0) {
      throw new Error('gridWidth and gridHeight must be finite positive numbers');
    }
    this.gridWidth = Math.floor(gridWidth);
    this.gridHeight = Math.floor(gridHeight);
    this.direction = 'right';
    this.nextDirection = 'right';
    this.snake = [];
    this.food = null;
    this.score = 0;
    this.gameOver = false;
  }

  /**
   * Initializes or resets the game state.
   */
  init() {
    const startX = Math.floor(this.gridWidth / 2);
    const startY = Math.floor(this.gridHeight / 2);
    // Initial snake: head at (startX, startY), body extends to the left
    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];
    this.direction = 'right';
    this.nextDirection = 'right';
    this.score = 0;
    this.gameOver = false;
    this.food = this._generateFood();
  }

  /**
   * Sets the next direction for the snake.
   * Invalid directions (including reversal of current direction) are ignored.
   * @param {string} direction - One of 'up', 'down', 'left', 'right'.
   */
  setDirection(direction) {
    const opposites = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };
    // QA fix: prevent reversal based on current direction (not last move)
    if (direction in opposites && opposites[direction] !== this.direction) {
      this.nextDirection = direction;
    }
  }

  /**
   * Advances the game by one frame.
   * @returns {{ gameOver: boolean, ateFood: boolean }}
   */
  update() {
    if (this.gameOver) {
      return { gameOver: true, ateFood: false };
    }

    // Apply the pending direction
    this.direction = this.nextDirection;

    const head = this.snake[0];
    const newHead = { x: head.x, y: head.y };

    switch (this.direction) {
      case 'up':    newHead.y -= 1; break;
      case 'down':  newHead.y += 1; break;
      case 'left':  newHead.x -= 1; break;
      case 'right': newHead.x += 1; break;
    }

    // Check wall collision
    if (newHead.x < 0 || newHead.x >= this.gridWidth ||
        newHead.y < 0 || newHead.y >= this.gridHeight) {
      this.gameOver = true;
      return { gameOver: true, ateFood: false };
    }

    // Check self-collision (new head cannot overlap any part of the snake)
    if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      this.gameOver = true;
      return { gameOver: true, ateFood: false };
    }

    // Check if food is eaten
    const ateFood = (newHead.x === this.food.x && newHead.y === this.food.y);

    this.snake.unshift(newHead);
    if (ateFood) {
      this.score += 1;
      this.food = this._generateFood();
    } else {
      this.snake.pop();
    }

    return { gameOver: false, ateFood };
  }

  /**
   * Returns the current game state.
   * @returns {{
   *   snake: Array<{x: number, y: number}>,
   *   food: {x: number, y: number},
   *   score: number,
   *   gameOver: boolean
   * }}
   */
  getState() {
    return {
      snake: this.snake.map(segment => ({ ...segment })),
      food: { ...this.food },
      score: this.score,
      gameOver: this.gameOver
    };
  }

  /**
   * Resets the game to the initial state.
   */
  reset() {
    this.init();
  }

  /**
   * Generates a food item at a random empty cell.
   * @returns {{x: number, y: number}}
   * @private
   */
  _generateFood() {
    // Try random placement up to 100 times
    for (let attempt = 0; attempt < 100; attempt++) {
      const x = Math.floor(Math.random() * this.gridWidth);
      const y = Math.floor(Math.random() * this.gridHeight);
      if (!this.snake.some(segment => segment.x === x && segment.y === y)) {
        return { x, y };
      }
    }
    // Fallback: iterate over all cells to find an empty one
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (!this.snake.some(segment => segment.x === x && segment.y === y)) {
          return { x, y };
        }
      }
    }
    // No empty cell (snake fills the whole grid) – re-use current food position
    return { ...this.food };
  }
}
