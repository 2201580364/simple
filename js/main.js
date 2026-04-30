/**
 * @fileoverview 游戏主循环模块，整合核心逻辑、渲染、输入和UI。
 */

import { SnakeGame } from './game-core.js';
import { render } from './renderer.js';
import { setupInput } from './input-handler.js';
import { UI } from './ui.js';

// 游戏常量
const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const CELL_SIZE = 25; // 像素
const GAME_SPEED = 150; // 每步移动间隔（毫秒）

// 模块私有状态
let game = null;
let ui = null;
let loopId = null;
let inputCleanup = null;

// 最高分缓存，用于 localStorge 不可用时的降级方案
let highScoreCache = 0;

/**
 * 安全地从 localStorage 读取最高分，若失败则返回内存中的缓存值。
 * @returns {number}
 */
function loadHighScore() {
  try {
    const raw = localStorage.getItem('snakeHighScore');
    const score = raw ? parseInt(raw, 10) : 0;
    highScoreCache = score; // 同步缓存
    return score;
  } catch (e) {
    // 浏览器隐私模式或存储不可用时，使用内存缓存
    return highScoreCache;
  }
}

/**
 * 安全地将最高分保存到 localStorage，同时更新内存缓存。
 * @param {number} score
 */
function saveHighScore(score) {
  highScoreCache = score;
  try {
    localStorage.setItem('snakeHighScore', score.toString());
  } catch (e) {
    // 存储失败时，仅保留内存缓存
  }
}

/**
 * 游戏主循环，定期更新状态并重新绘制画布。
 */
export function gameLoop() {
  if (!game) return;

  // 更新游戏逻辑
  game.update();
  const state = game.getState();

  // 渲染
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Canvas element #gameCanvas not found');
    return;
  }
  const ctx = canvas.getContext('2d');
  render(
    ctx,
    {
      snake: state.snake,
      food: state.food
    },
    CELL_SIZE,
    GRID_WIDTH,
    GRID_HEIGHT
  );

  // 更新得分
  if (ui) {
    ui.updateScore(state.score);
  }

  // 检查游戏结束
  if (state.gameOver) {
    stopGame();
    if (ui) {
      ui.showGameOver();
      // 更新最高分（使用安全读写）
      const currentHigh = loadHighScore();
      if (state.score > currentHigh) {
        saveHighScore(state.score);
        ui.updateHighScore(state.score);
      }
    }
  }
}

/**
 * 启动新游戏，初始化各模块并开始循环。
 */
export function startGame() {
  // 确保先停止之前正在进行的游戏
  if (loopId !== null) {
    stopGame();
  }

  // 初始化游戏核心
  game = new SnakeGame(GRID_WIDTH, GRID_HEIGHT);
  game.init();

  // 设置画布尺寸
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.width = GRID_WIDTH * CELL_SIZE;
    canvas.height = GRID_HEIGHT * CELL_SIZE;
  } else {
    console.error('Canvas element #gameCanvas not found');
    return;
  }

  // 初始化UI
  ui = new UI('score', 'highScore', 'gameOver', 'restartButton');
  const savedHigh = loadHighScore();
  ui.updateHighScore(savedHigh);
  ui.hideGameOver();
  ui.setRestartHandler(() => {
    stopGame();
    startGame();
  });

  // 设置键盘输入，setupInput 返回 { cleanup } 对象，解构后直接保存清理函数
  const { cleanup } = setupInput((direction) => {
    if (game) {
      game.setDirection(direction);
    }
  });
  inputCleanup = cleanup;

  // 启动循环
  loopId = setInterval(gameLoop, GAME_SPEED);
}

/**
 * 停止当前游戏循环，清理监听器。
 */
export function stopGame() {
  if (loopId !== null) {
    clearInterval(loopId);
    loopId = null;
  }
  if (inputCleanup) {
    inputCleanup();
    inputCleanup = null;
  }
}
