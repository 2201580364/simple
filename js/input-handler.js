/**
 * @module input-handler
 * @file Manages keyboard input conversion to direction commands.
 */

/**
 * Maps keyboard arrow key values to direction strings.
 * @constant {Object<string, string>}
 */
export const KeyDirectionMap = Object.freeze({
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right'
});

/**
 * Immediate opposite direction lookup.
 */
const OPPOSITES = Object.freeze({
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
});

/**
 * Valid direction values.
 */
const DIRECTIONS = Object.freeze(Object.values(KeyDirectionMap));

/**
 * Sets up a keyboard listener that converts arrow key presses into direction
 * commands, calling the provided callback with the new direction string.
 * The listener prevents the same direction and opposite direction inputs.
 *
 * @param {function(string): void} onDirectionChange - Callback invoked with
 *   the validated direction string. Must be a function.
 * @returns {{cleanup: function(): void, setDirection: function(string): void}}
 *   Object with a cleanup function that removes the keydown event listener,
 *   and a setDirection function to reset the current direction externally.
 * @throws {Error} If onDirectionChange is not a function.
 */
export function setupInput(onDirectionChange) {
  // Type check: onDirectionChange must be a function
  if (typeof onDirectionChange !== 'function') {
    throw new Error('onDirectionChange must be a function');
  }

  // Initial direction assumed when no input has been processed.
  let lastDirection = 'right';

  /**
   * Handles keydown events.
   * @param {KeyboardEvent} event
   */
  const handleKeyDown = (event) => {
    const key = event.key;
    const direction = KeyDirectionMap[key];
    if (!direction) {
      return; // Not a mapped arrow key
    }

    // Prevent default browser behavior (e.g., scrolling)
    event.preventDefault();

    // Ignore if the direction is unchanged or directly opposite
    if (direction === lastDirection || direction === OPPOSITES[lastDirection]) {
      return;
    }

    lastDirection = direction;
    onDirectionChange(direction);
  };

  document.addEventListener('keydown', handleKeyDown);

  return {
    /**
     * Removes the keydown event listener.
     */
    cleanup: () => {
      document.removeEventListener('keydown', handleKeyDown);
    },

    /**
     * Allows external reset of the current direction.
     * @param {string} direction - Must be one of 'up', 'down', 'left', 'right'.
     * @throws {Error} If the direction is invalid.
     */
    setDirection: (direction) => {
      if (!DIRECTIONS.includes(direction)) {
        throw new Error(`Invalid direction: ${direction}. Must be 'up', 'down', 'left', or 'right'.`);
      }
      lastDirection = direction;
    }
  };
}
