import { checkEmails } from "./connectionManager.js";
import { processEmails } from "../services/emailProcessingService.js";
import { notifyConnectionStatus } from "./notificationManager.js";
import AutomatedResponseService from "../services/automatedResponseService.js";
import ConnectionManager from "./connectionManager.js";
import {
  addInterval,
  removeInterval,
  getInterval,
  clearAllIntervals,
} from "../utils/activeIntervalManager.js";
import mongoose from "mongoose";
import ConnectedEmail from "../../models/ConnectedEmail.js";
import getConnectedEmailModels from "../../models/ConnectedEmailModels.js";
import NotificationManager from './notificationManager.js';

/**
 * Mark emails as processed after handling them
 * @param {string} userId - User ID
 * @param {string} email - Email address
 * @param {Array} processedEmails - Array of processed email documents
 * @param {boolean} automationApplied - Whether automation was applied
 * @returns {Promise<boolean>} - Success status
 */
export const markEmailsAsProcessed = async (
  userId,
  email,
  processedEmails,
  automationApplied = false
) => {
  if (!processedEmails || processedEmails.length === 0) {
    return true; // Nothing to mark
  }

  try {
    console.log(
      `[${email}] Marking ${processedEmails.length} emails as processed`
    );

    // Get the connected email model
    const connectedEmail = await ConnectedEmail.findOne({ userId, email });
    if (!connectedEmail) {
      console.error(`[${email}] Connected email record not found`);
      return false;
    }

    // Get the email models
    const emailModels = getConnectedEmailModels(connectedEmail._id.toString());

    // Get the IDs of all processed emails
    const emailIds = processedEmails.map((email) =>
      typeof email === "string" ? email : email._id.toString()
    );

    // Update all emails at once
    const result = await emailModels.Email.updateMany(
      { _id: { $in: emailIds } },
      {
        $set: {
          processed: true,
          processedAt: new Date(),
          automationApplied: automationApplied,
        },
      }
    );

    // Update stats in connected email
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      $inc: {
        "stats.emailsProcessed": result.modifiedCount,
        ...(automationApplied
          ? { "stats.emailsAutomated": result.modifiedCount }
          : {}),
      },
    });

    console.log(
      `[${email}] Marked ${result.modifiedCount} emails as processed`
    );
    return true;
  } catch (error) {
    console.error(`[${email}] Error marking emails as processed:`, error);
    return false;
  }
};

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
      console.error(
        `[${email}] No active connection found, cannot schedule checks`
      );
      // Update connection status to error
      await ConnectedEmail.findOneAndUpdate(
        { userId, email },
        { 
          $set: { 
            status: 'error',
            lastError: {
              message: 'Failed to establish connection for scheduled checks',
              date: new Date(),
              code: 'SCHEDULE_ERROR'
            }
          }
        }
      );
      return false;
    }

    console.log(`[${email}] Found active connection, setting up interval...`);

    // Create new checking interval (every minute)
    const checkInterval = setInterval(async () => {
      try {
        console.log(`[${email}] Checking for new emails...`);
        
        // Verify connection before checking emails
        const currentConnection = await ConnectionManager.getConnection(userId, email);
        if (!currentConnection) {
          throw new Error('No active connection found');
        }
        
        // If email status is paused, skip checking
        if (currentConnection.status === 'paused') {
          console.log(`[${email}] Connection is paused, skipping check`);
          return;
        }

        const result = await checkEmails(userId, email);

        if (result.success && result.count > 0) {
          console.log(`[${email}] Found ${result.count} new emails`);

          // Process new emails
          const processedEmails = await processEmails(userId, email);
          if (!processedEmails || processedEmails.length === 0) {
            console.log(
              `[${email}] No new emails to process after filtering duplicates`
            );
            return;
          }

          // Get fresh connection data for each check
          const currentAccount = await ConnectionManager.getConnection(
            userId,
            email
          );
          if (!currentAccount) {
            console.log(`[${email}] Connection lost, stopping checks`);
            removeInterval(key);
            return;
          }

          // Ensure aiSettings is always initialized
          if (!currentAccount.aiSettings) {
            console.log(
              `[${email}] Missing aiSettings, retrieving from database...`
            );
            
            // Get aiSettings from the database
            const connectedEmail = await ConnectedEmail.findOne({ userId, email });
            
            if (connectedEmail && connectedEmail.aiSettings) {
              // Use the settings from the database
              currentAccount.aiSettings = connectedEmail.aiSettings;
              console.log(`[${email}] Retrieved aiSettings from database:`, currentAccount.aiSettings);
            } else {
              // Set default AI settings
              currentAccount.aiSettings = { enabled: false, mode: 'review' };
              console.log(`[${email}] Using default aiSettings:`, currentAccount.aiSettings);
              
              // Update the database with default settings
              try {
                await ConnectedEmail.findOneAndUpdate(
                  { userId, email },
                  { $set: { aiSettings: currentAccount.aiSettings } },
                  { new: true }
                );
                console.log(`[${email}] Updated database with default aiSettings`);
              } catch (updateError) {
                console.error(`[${email}] Failed to update aiSettings in database:`, updateError);
              }
            }
          }

          console.log(`[${email}] Checking AI settings:`, {
            enabled: currentAccount.aiSettings.enabled,
            mode: currentAccount.aiSettings.mode,
          });

          const aiEnabled = AutomatedResponseService.isAutomationEnabled(currentAccount);
          console.log(`[${email}] AI automation enabled: ${aiEnabled}`);

          let automationApplied = false;

          if (aiEnabled) {
            const mode = AutomatedResponseService.getAutomationMode(currentAccount);
            console.log(`[${email}] Running in ${mode} mode`);

            try {
              // Ensure each email has a proper ID before processing
              const emailsWithIds = processedEmails.map(email => {
                if (!email.id && !email._id) {
                  // Generate an ID if none exists
                  email.id = email.messageId || `email-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
                }
                return email;
              });
              
              await AutomatedResponseService.processNewEmails(
                userId,
                email,
                emailsWithIds
              );
              console.log(`[${email}] Successfully processed emails with AI`);
              automationApplied = true;
            } catch (aiError) {
              console.error(
                `[${email}] Error processing emails with AI:`,
                aiError
              );
            }
          } else {
            console.log(
              `[${email}] AI is disabled, skipping automated responses`
            );
          }

          // Mark emails as processed after handling them
          await markEmailsAsProcessed(
            userId,
            email,
            processedEmails,
            automationApplied
          );
        } else if (result.success) {
          console.log(`[${email}] No new emails found`);
        } else {
          console.error(`[${email}] Error checking emails:`, result.error);
          await notifyConnectionStatus({
            userId,
            email,
            status: "error",
            message: result.error,
          });
        }
      } catch (error) {
        console.error(`[${email}] Error in scheduled check:`, error);
        await notifyConnectionStatus({
          userId,
          email,
          status: "error",
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
  console.log("Cleared all scheduled checks");
};

/**
 * Manually mark specific emails as processed
 * @param {string} userId - User ID
 * @param {string} email - Email address
 * @param {Array} emailIds - Array of email IDs to mark as processed
 * @param {string} reason - Reason for marking as processed (optional)
 */
export const manuallyMarkAsProcessed = async (
  userId,
  email,
  emailIds,
  reason = "manual"
) => {
  try {
    console.log(
      `[${email}] Manually marking ${emailIds.length} emails as processed: ${reason}`
    );

    // Get the connected email record
    const connectedEmail = await ConnectedEmail.findOne({ userId, email });
    if (!connectedEmail) {
      throw new Error("Connected email not found");
    }

    // Get email models for this connection
    const emailModels = getConnectedEmailModels(connectedEmail._id.toString());

    // Update the emails
    const result = await emailModels.Email.updateMany(
      { _id: { $in: emailIds } },
      {
        $set: {
          processed: true,
          processedAt: new Date(),
          processingReason: reason,
        },
      }
    );

    console.log(
      `[${email}] Successfully marked ${result.modifiedCount}/${emailIds.length} emails as processed`
    );

    // Update stats
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      $inc: { "stats.emailsProcessed": result.modifiedCount },
    });

    return {
      success: true,
      count: result.modifiedCount,
    };
  } catch (error) {
    console.error(
      `[${email}] Error manually marking emails as processed:`,
      error
    );
    return {
      success: false,
      error: error.message,
    };
  }
};

// Run daily cleanup of notifications
setInterval(async () => {
  try {
    console.log('Running scheduled notification cleanup...');
    await NotificationManager.cleanupAllNotifications();
    console.log('Notification cleanup completed successfully');
  } catch (error) {
    console.error('Error during scheduled notification cleanup:', error);
  }
}, 24 * 60 * 60 * 1000); // 24 hours


export default {
  scheduleEmailChecks,
  stopScheduledChecks,
  getScheduleInfo,
  clearAllSchedules,
  markEmailsAsProcessed,
  manuallyMarkAsProcessed,
};
