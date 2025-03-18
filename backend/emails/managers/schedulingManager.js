import { checkEmails } from './connectionManager.js';
import { processEmails } from '../services/emailProcessingService.js';
import { notifyConnectionStatus } from './notificationManager.js';
import {
  addInterval,
  removeInterval,
  getInterval,
  clearAllIntervals,
} from '../utils/activeIntervalManager.js';

/**
 * Schedule email checking for a specific connection.
 * @param {string} userId
 * @param {string} email
 */
export const scheduleEmailChecks = async (userId, email) => {
  const key = `${userId}:${email}`;

  // Clear existing interval if any
  removeInterval(key);

  // Create new checking interval (every minute)
  const checkInterval = setInterval(async () => {
    try {
      const result = await checkEmails(userId, email);

      if (result.success && result.count > 0) {
        await processEmails(userId, email);
      } else if (!result.success) {
        await notifyConnectionStatus({
          userId,
          email,
          status: 'error',
          message: result.error,
        });
      }
    } catch (error) {
      console.error(`Error in scheduled check for ${email}:`, error);
      await notifyConnectionStatus({
        userId,
        email,
        status: 'error',
        message: error.message,
      });
    }
  }, 60000);

  addInterval(key, {
    checkInterval,
    lastCheck: new Date(),
    email,
    userId,
  });

  console.log(`Scheduled checks every minute for ${email}`);
};

/**
 * Stop scheduled checks for a specific connection.
 */
export const stopScheduledChecks = (userId, email) => {
  const key = `${userId}:${email}`;
  removeInterval(key);
  console.log(`Stopped scheduled checks for ${email}`);
};

/**
 * Get information about scheduled checks.
 */
export const getScheduleInfo = (userId, email) => {
  const key = `${userId}:${email}`;
  return getInterval(key);
};

/**
 * Clear all scheduled checks.
 */
export const clearAllSchedules = () => {
  clearAllIntervals();
  console.log('Cleared all schedules.');
};

export default {
  scheduleEmailChecks,
  stopScheduledChecks,
  getScheduleInfo,
  clearAllSchedules,
};
