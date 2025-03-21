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
  console.log(`[${email}] Setting up email check schedule...`);
  const key = `${userId}:${email}`;

  try {
    // Clear existing interval if any
    removeInterval(key);

    // First check if we have a valid connection
    const account = await ConnectionManager.getConnection(userId, email);
    if (!account) {
      console.error(`[${email}] No active connection found, cannot schedule checks`);
      return false;
    }

    console.log(`[${email}] Found active connection, setting up interval...`);

    // Create new checking interval (every minute)
    const checkInterval = setInterval(async () => {
      try {
        console.log(`[${email}] Checking for new emails...`);
        const result = await checkEmails(userId, email);

        if (result.success && result.count > 0) {
          console.log(`[${email}] Found ${result.count} new emails`);

          // Process new emails
          const processedEmails = await processEmails(userId, email);
          if (!processedEmails || processedEmails.length === 0) {
            console.log(`[${email}] No new emails to process after filtering duplicates`);
            return;
          }
          
          // Get fresh connection data for each check
          const currentAccount = await ConnectionManager.getConnection(userId, email);
          if (!currentAccount) {
            console.log(`[${email}] Connection lost, stopping checks`);
            removeInterval(key);
            return;
          }

          console.log(`[${email}] Checking AI settings:`, {
            enabled: currentAccount?.aiSettings?.enabled,
            mode: currentAccount?.aiSettings?.mode
          });

          const aiEnabled = AutomatedResponseService.isAutomationEnabled(currentAccount);
          console.log(`[${email}] AI automation enabled: ${aiEnabled}`);

          if (aiEnabled) {
            const mode = AutomatedResponseService.getAutomationMode(currentAccount);
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

    // Store the interval
    addInterval(key, {
      checkInterval,
      lastCheck: new Date(),
      email,
      userId,
    });

    console.log(`[${email}] Successfully started email checking schedule`);
    return true;
  } catch (error) {
    console.error(`[${email}] Failed to set up email check schedule:`, error);
    return false;
  }
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
