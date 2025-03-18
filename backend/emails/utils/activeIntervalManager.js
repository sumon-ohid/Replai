const activeIntervals = new Map();

/**
 * Add a new interval to the active intervals map.
 * @param {string} key
 * @param {Object} intervalData
 */
export const addInterval = (key, intervalData) => {
  activeIntervals.set(key, intervalData);
};

/**
 * Remove an interval from the active intervals map.
 * @param {string} key
 */
export const removeInterval = (key) => {
  if (activeIntervals.has(key)) {
    clearInterval(activeIntervals.get(key).checkInterval);
    activeIntervals.delete(key);
  }
};

/**
 * Get interval information by key.
 * @param {string} key
 * @returns {Object | undefined}
 */
export const getInterval = (key) => activeIntervals.get(key);

/**
 * Clear all active intervals.
 */
export const clearAllIntervals = () => {
  for (const [key, value] of activeIntervals.entries()) {
    clearInterval(value.checkInterval);
  }
  activeIntervals.clear();
};

export default {
  addInterval,
  removeInterval,
  getInterval,
  clearAllIntervals,
};
