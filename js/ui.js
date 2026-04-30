/**
 * Manages the game's UI: score, high score, game over overlay and restart button.
 */
export default class UI {
  /**
   * @param {string} scoreElementId - ID of the element displaying the current score.
   * @param {string} highScoreElementId - ID of the element displaying the high score.
   * @param {string} gameOverElementId - ID of the game over overlay element.
   * @param {string} restartButtonId - ID of the restart button.
   */
  constructor(scoreElementId, highScoreElementId, gameOverElementId, restartButtonId) {
    this.scoreElement = document.getElementById(scoreElementId);
    this.highScoreElement = document.getElementById(highScoreElementId);
    this.gameOverElement = document.getElementById(gameOverElementId);
    this.restartButton = document.getElementById(restartButtonId);

    // Warn if any required element is missing (non‑blocking)
    if (!this.scoreElement) console.warn(`UI: element "${scoreElementId}" not found`);
    if (!this.highScoreElement) console.warn(`UI: element "${highScoreElementId}" not found`);
    if (!this.gameOverElement) console.warn(`UI: element "${gameOverElementId}" not found`);
    if (!this.restartButton) console.warn(`UI: element "${restartButtonId}" not found`);

    // Ensure game over overlay starts hidden
    this.hideGameOver();
  }

  /**
   * Update the score display.
   * @param {number} score - Current score to show.
   */
  updateScore(score) {
    if (this.scoreElement) {
      // Ensure a valid number is displayed; fallback to 0 for invalid types
      if (typeof score !== 'number' || isNaN(score)) {
        console.warn('UI.updateScore: score should be a number, received', score);
        this.scoreElement.textContent = 0;
      } else {
        this.scoreElement.textContent = score;
      }
    }
  }

  /**
   * Update the high score display.
   * @param {number} highScore - High score to show.
   */
  updateHighScore(highScore) {
    if (this.highScoreElement) {
      if (typeof highScore !== 'number' || isNaN(highScore)) {
        console.warn('UI.updateHighScore: highScore should be a number, received', highScore);
        this.highScoreElement.textContent = 0;
      } else {
        this.highScoreElement.textContent = highScore;
      }
    }
  }

  /**
   * Show the game over overlay.
   */
  showGameOver() {
    if (this.gameOverElement) {
      this.gameOverElement.style.display = 'flex';
    }
  }

  /**
   * Hide the game over overlay.
   */
  hideGameOver() {
    if (this.gameOverElement) {
      this.gameOverElement.style.display = 'none';
    }
  }

  /**
   * Register a callback to be invoked when the restart button is clicked.
   * Removes any previously attached handler to avoid duplicates.
   * @param {function} callback - The function to call on click.
   */
  setRestartHandler(callback) {
    if (!this.restartButton) {
      console.warn('UI.setRestartHandler: restart button not found');
      return;
    }
    if (typeof callback !== 'function') {
      console.warn('UI.setRestartHandler: callback must be a function, received', callback);
      return;
    }

    // Replace the button with a clone to strip all previous event listeners
    const newButton = this.restartButton.cloneNode(true);
    this.restartButton.parentNode.replaceChild(newButton, this.restartButton);
    this.restartButton = newButton;
    this.restartButton.addEventListener('click', callback);
  }
}