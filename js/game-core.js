/**
 * @class SnakeGame
 * @description Manages the core logic of the snake game: movement, food, collisions, score, and game state.
 */
export class SnakeGame {
  /**
   * @param {number} gridWidth - Number of cells horizontally
   * @param {number} gridHeight - Number of cells vertically
   */
  constructor(gridWidth, gridHeight) {
    if (typeof gridWidth !== 'number' || typeof gridHeight !== 'number' ||
        gridWidth <= 0 || gridHeight <= 0) {
      throw new Error('Invalid grid dimensions: must be positive numbers.');
    }
    this.gridWidth = Math.floor(gridWidth);
    this.gridHeight = Math.floor(gridHeight);
    this.snake = [];
    this.food = null;
    this.direction = 'right';
    this.nextDirection = 'right';
    this.score = 0;
    this.gameOver = false;
  }

  /**
   * Initialize or reset the game state to start a new game.
   */
  init() {
    // Determine a safe starting position, ensuring the initial snake fits on the grid.
    const startX = Math.min(this.gridWidth - 1, Math.floor(this.gridWidth / 2));
    const startY = Math.min(this.gridHeight - 1, Math.floor(this.gridHeight / 2));
    const length = Math.min(3, this.gridWidth);

    this.snake = [];
    for (let i = 0; i < length; i++) {
      this.snake.push({ x: startX - i, y: startY });
    }

    this.direction = 'right';
    this.nextDirection = 'right';
    this.score = 0;
    this.gameOver = false;
    this._placeFood();
  }

  /** @private */
  _placeFood() {
    const maxAttempts = this.gridWidth * this.gridHeight;
    for (let i = 0; i < maxAttempts; i++) {
      const x = Math.floor(Math.random() * this.gridWidth);
      const y = Math.floor(Math.random() * this.gridHeight);
      if (!this.snake.some(segment => segment.x === x && segment.y === y)) {
        this.food = { x, y };
        return;
      }
    }
    // Grid is completely covered by the snake – practically unreachable.
    this.food = null;
  }

  /**
   * Set the next direction for the snake.
   * Invalid or opposite directions are silently ignored.
   * @param {string} direction - 'up', 'down', 'left', or 'right'
   */
  setDirection(direction) {
    const validDirs = ['up', 'down', 'left', 'right'];
    if (!direction || !validDirs.includes(direction)) return;

    // Prevent reversal
    const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
    if (opposites[direction] === this.direction) return;

    this.nextDirection = direction;
  }

  /**
   * Advance the game state by one step.
   * @returns {{gameOver: boolean, ateFood: boolean}}
   */
  update() {
    if (this.gameOver) {
      return { gameOver: true, ateFood: false };
    }

    // Apply the buffered direction
    this.direction = this.nextDirection;

    const head = this.snake[0];
    const newHead = { x: head.x, y: head.y };
    switch (this.direction) {
      case 'up':    newHead.y -= 1; break;
      case 'down':  newHead.y += 1; break;
      case 'left':  newHead.x -= 1; break;
      case 'right': newHead.x += 1; break;
      default: return { gameOver: false, ateFood: false };
    }

    // Wall collision
    if (newHead.x < 0 || newHead.x >= this.gridWidth ||
        newHead.y < 0 || newHead.y >= this.gridHeight) {
      this.gameOver = true;
      return { gameOver: true, ateFood: false };
    }

    // Check food consumption before moving the tail
    const ateFood = this.food ? (newHead.x === this.food.x && newHead.y === this.food.y) : false;

    this.snake.unshift(newHead);

    if (ateFood) {
      this.score += 1;
      this._placeFood();
      // Tail is kept, snake grows.
    } else {
      this.snake.pop();
    }

    // Self-collision (head vs body)
    const currentHead = this.snake[0];
    for (let i = 1; i < this.snake.length; i++) {
      if (this.snake[i].x === currentHead.x && this.snake[i].y === currentHead.y) {
        this.gameOver = true;
        return { gameOver: true, ateFood };
      }
    }

    return { gameOver: false, ateFood };
  }

  /**
   * Get the current game state.
   * @returns {{snake: Array<{x: number, y: number}>, food: {x: number, y: number}, score: number, gameOver: boolean}}
   */
  getState() {
    return {
      snake: this.snake.slice(),
      food: this.food ? { ...this.food } : { x: 0, y: 0 }, // fallback, should never be used
      score: this.score,
      gameOver: this.gameOver
    };
  }

  /**
   * Reset the game to start a new one.
   */
  reset() {
    this.init();
  }
}
