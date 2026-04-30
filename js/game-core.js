/**
 * SnakeGame - Core game logic for Snake.
 * Manages snake movement, food generation, collision detection, and score.
 */
export default class SnakeGame {
  /**
   * @param {number} gridWidth - Number of horizontal cells
   * @param {number} gridHeight - Number of vertical cells
   * @throws {Error} If dimensions are less than 3
   */
  constructor(gridWidth, gridHeight) {
    if (typeof gridWidth !== 'number' || typeof gridHeight !== 'number') {
      throw new Error('gridWidth and gridHeight must be numbers');
    }
    if (gridWidth < 3 || gridHeight < 3) {
      throw new Error('Grid dimensions must be at least 3x3');
    }
    /** @type {number} */
    this.gridWidth = gridWidth;
    /** @type {number} */
    this.gridHeight = gridHeight;
    // Internal state
    this.snake = [];
    this.food = { x: -1, y: -1 };
    this.score = 0;
    this.gameOver = true;
    this.direction = 'right';
    this.lastMoveDirection = 'right';
  }

  /**
   * Initialize or reset the game to starting state.
   */
  init() {
    const startX = Math.floor(this.gridWidth / 2);
    const startY = Math.floor(this.gridHeight / 2);
    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
    this.direction = 'right';
    this.lastMoveDirection = 'right';
    this.score = 0;
    this.gameOver = false;
    this._generateFood();
  }

  /**
   * Set the direction for the next move.
   * Ignores invalid directions and prevents reversal.
   * @param {string} direction - 'up', 'down', 'left', or 'right'
   */
  setDirection(direction) {
    const validDirections = ['up', 'down', 'left', 'right'];
    if (!validDirections.includes(direction)) {
      return;
    }
    const opposites = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    };
    if (opposites[direction] === this.lastMoveDirection) {
      return;
    }
    this.direction = direction;
  }

  /**
   * Advance the game by one tick.
   * Updates snake position, checks collisions and food.
   * @returns {{ gameOver: boolean, ateFood: boolean }}
   */
  update() {
    if (this.gameOver) {
      return { gameOver: true, ateFood: false };
    }

    this.lastMoveDirection = this.direction;

    const head = this.snake[0];
    let newHead;
    switch (this.direction) {
      case 'up':
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case 'down':
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case 'left':
        newHead = { x: head.x - 1, y: head.y };
        break;
      case 'right':
        newHead = { x: head.x + 1, y: head.y };
        break;
      default:
        newHead = { x: head.x, y: head.y };
        break;
    }

    // Wall collision
    if (newHead.x < 0 || newHead.x >= this.gridWidth ||
        newHead.y < 0 || newHead.y >= this.gridHeight) {
      this.gameOver = true;
      return { gameOver: true, ateFood: false };
    }

    const willEat = (newHead.x === this.food.x && newHead.y === this.food.y);

    // Self collision: exclude tail if not eating
    const segmentsToCheck = willEat ? this.snake : this.snake.slice(0, -1);
    for (const segment of segmentsToCheck) {
      if (segment.x === newHead.x && segment.y === newHead.y) {
        this.gameOver = true;
        return { gameOver: true, ateFood: false };
      }
    }

    this.snake.unshift(newHead);

    let ateFood = false;
    if (willEat) {
      ateFood = true;
      this.score += 1;
      this._generateFood();
      if (this.gameOver) {
        return { gameOver: true, ateFood };
      }
    } else {
      this.snake.pop();
    }

    return { gameOver: false, ateFood };
  }

  /**
   * Get the current game state (immutable snapshot).
   * @returns {{ snake: Array<{x: number, y: number}>, food: {x: number, y: number}, score: number, gameOver: boolean }}
   */
  getState() {
    return {
      snake: this.snake.map(seg => ({ x: seg.x, y: seg.y })),
      food: { x: this.food.x, y: this.food.y },
      score: this.score,
      gameOver: this.gameOver,
    };
  }

  /**
   * Reset the game to initial state and begin a new game.
   */
  reset() {
    this.init();
  }

  /**
   * Generate a new food item at a random empty cell.
   * If no empty cell exists, sets gameOver to true (victory condition).
   * @private
   */
  _generateFood() {
    const occupied = new Set();
    for (const seg of this.snake) {
      occupied.add(seg.x + ',' + seg.y);
    }

    const emptyCells = [];
    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        if (!occupied.has(x + ',' + y)) {
          emptyCells.push({ x, y });
        }
      }
    }

    if (emptyCells.length === 0) {
      this.gameOver = true;
      return;
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const chosen = emptyCells[randomIndex];
    this.food = { x: chosen.x, y: chosen.y };
  }
}
