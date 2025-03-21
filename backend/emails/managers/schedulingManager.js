import { checkEmails } from './connectionManager.js';
import { processEmails } from '../services/emailProcessingService.js';
import { notifyConnectionStatus } from './notificationManager.js';
import AutomatedResponseService from '../services/automatedResponseService.js';
import ConnectionManager from './connectionManager.js';
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

  console.log(`[${email}] Scheduling checks...`);

  // Clear existing interval if any
  removeInterval(key);

  // Create new checking interval (every minute)
  const checkInterval = setInterval(async () => {
    try {
      console.log(`[${email}] Checking for new emails...`);
      const result = await checkEmails(userId, email);

      if (result.success && result.count > 0) {
        console.log(`[${email}] Found ${result.count} new emails`);

        // Process new emails
        const processedEmails = await processEmails(userId, email);
        
        // Check AI settings
        const account = await ConnectionManager.getConnection(userId, email);
        
        if (!account) {
          console.log(`[${email}] No active connection found, skipping AI processing`);
          return;
        }

        const aiEnabled = AutomatedResponseService.isAutomationEnabled(account);
        console.log(`[${email}] AI automation enabled: ${aiEnabled}`);

        if (aiEnabled) {
          const mode = AutomatedResponseService.getAutomationMode(account);
          console.log(`[${email}] Running in ${mode} mode`);

          try {
            await AutomatedResponseService.processNewEmails(userId, email, processedEmails);
            console.log(`[${email}] Successfully processed emails with AI`);
          } catch (aiError) {
            console.error(`[${email}] Error processing emails with AI:`, aiError);
          }
        } else {
          console.log(`[${email}] AI is disabled, skipping automated responses`);
        }
      } else if (result.success) {
        console.log(`[${email}] No new emails found`);
      } else {
        console.error(`[${email}] Error checking emails:`, result.error);
        await notifyConnectionStatus({
          userId,
          email,
          status: 'error',
          message: result.error,
        });
      }
    } catch (error) {
      console.error(`[${email}] Error in scheduled check:`, error);
      await notifyConnectionStatus({
        userId,
        email,
        status: 'error',
        message: error.message,
      });
    }
  }, 60000); // Check every minute

  addInterval(key, {
    checkInterval,
    lastCheck: new Date(),
    email,
    userId,
  });

  console.log(`[${email}] Scheduled checks every minute`);
};

/**
 * Stop scheduled checks for a specific connection.
 */
export const stopScheduledChecks = (userId, email) => {
  const key = `${userId}:${email}`;
  removeInterval(key);
  console.log(`[${email}] Stopped scheduled checks`);
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
  console.log('Cleared all scheduled checks');
};

export default {
  scheduleEmailChecks,
  stopScheduledChecks,
  getScheduleInfo,
  clearAllSchedules,
};
