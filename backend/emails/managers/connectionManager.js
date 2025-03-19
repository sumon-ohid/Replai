import mongoose from 'mongoose';
import User from '../../models/User.js';
// import { initializeGoogleConnection } from '../services/googleEmailService.js';
import { initializeOutlookConnection } from '../services/outlookEmailService.js';
import { initializeCustomConnection } from '../services/customEmailService.js';
import { createService as createGoogleService, initializeGoogleConnection } from '../services/googleEmailService.js';

// Store active connections
const activeConnections = new Map();

/**
 * Initialize all user email connections at server startup
 */
export const initializeAllConnections = async () => {
  try {
    console.log('Initializing all email connections...');
    
    // Get all users with connected emails
    const users = await User.find({
      'connectedEmails.0': { $exists: true }
    }).select('_id name connectedEmails emailPreferences');
    
    console.log(`Found ${users.length} users with connected emails`);
    
    for (const user of users) {
      await initializeUserConnections(user._id);
    }
    
    console.log('All email connections initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize email connections:', error);
    return false;
  }
}

/**
 * Initialize all email connections for a specific user
 * @param {string} userId - MongoDB user ID
 */

export const initializeUserConnections = async (userId) => {
  try {
    const user = await User.findById(userId).select('connectedEmails emailPreferences');
    if (!user) {
      console.error(`User ${userId} not found`);
      return false;
    }
    
    const { connectedEmails, emailPreferences = {} } = user;
    
    // Remove existing connections for this user
    for (const [key, connection] of activeConnections.entries()) {
      if (key.startsWith(`${userId}:`)) {
        await stopConnection(key);
      }
    }
    
    // Initialize each connection
    for (const emailAccount of connectedEmails) {
      const { provider, email, tokens = {} } = emailAccount;
      
      // Extract tokens correctly from your data structure
      let refreshToken = null;
      let accessToken = null;
      
      // Handle different token storage formats
      if (tokens) {
        if (tokens.refreshToken) {
          refreshToken = tokens.refreshToken;
          accessToken = tokens.accessToken;
        } else if (emailAccount.refreshToken) {
          // Backward compatibility
          refreshToken = emailAccount.refreshToken;
          accessToken = emailAccount.accessToken;
        }
      }
      
      // Skip if no refresh token
      if (!refreshToken) {
        console.warn(`Skipping connection for ${email} - no refresh token`);
        continue;
      }
      
      const connectionKey = `${userId}:${email}`;
      
      // Get user preferences for this email
      const emailConfig = emailPreferences[email] || {
        mode: 'auto-reply',
        syncEnabled: true,
        folders: ['inbox']
      };
      
      try {
        if (provider === 'google') {
          await initializeGoogleConnection(userId, email, refreshToken, accessToken, emailConfig);
        } else if (provider === 'outlook') {
          await initializeOutlookConnection(userId, email, refreshToken, accessToken, emailConfig);
        } else {
          console.warn(`Unknown provider: ${provider}`);
        }
        
        console.log(`Initialized ${provider} email connection for ${email}`);
        
      } catch (connError) {
        console.error(`Failed to initialize ${provider} connection for ${email}:`, connError);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to initialize connections for user ${userId}:`, error);
    return false;
  }
};

/**
 * Add a new connection to the active connections map
 * @param {string} userId - MongoDB user ID
 * @param {string} email - Email address
 * @param {string} provider - Email provider (google, outlook, custom)
 * @param {Object} connection - Connection object
 */
export const addConnection = (userId, email, provider, connection) => {
  const key = `${userId}:${email}`;
  activeConnections.set(key, {
    userId,
    email,
    provider,
    connection,
    startTime: new Date()
  });

  console.log(`👍 Added ${provider} connection for ${email}`);

  return key;
};

/**
 * Stop a specific connection
 * @param {string} connectionKey - Connection key in format "userId:email"
 */
export const stopConnection = async (connectionKey) => {
  const connection = activeConnections.get(connectionKey);
  if (!connection) return false;
  
  try {
    const { userId, email, provider, connection: connObj } = connection;
    
    // Clean up based on provider
    if (provider === 'google' && connObj.interval) {
      clearInterval(connObj.interval);
    }
    else if (provider === 'outlook' && connObj.subscription) {
      // Cancel subscription if any
      // Code to handle outlook subscription cancellation
    }
    
    activeConnections.delete(connectionKey);
    console.log(`Stopped ${provider} connection for ${email}`);
    return true;
  } catch (error) {
    console.error(`Error stopping connection ${connectionKey}:`, error);
    return false;
  }
};

/**
 * Get a specific connection
 * @param {string} userId - MongoDB user ID
 * @param {string} email - Email address
 */

export const getConnection = (userId, email) => {
  const connectionKey = `${userId}:${email}`;
  // console.log(`Looking for connection with key: ${connectionKey}`);
  const connection = activeConnections.get(connectionKey);
  
  // Debug info
  // if (!connection) {
  //   console.log(`No active connection found for ${connectionKey}`);
    
  //   // Log all active connections to help debug
  //   console.log('Active connections:', Array.from(activeConnections.keys()));
  // }
  
  return connection;
};

/**
 * Update email configuration for a specific connection
 * @param {string} userId - MongoDB user ID
 * @param {string} email - Email address
 * @param {Object} config - New configuration
 */
export const updateConnectionConfig = async (userId, email, config) => {
  try {
    const key = `${userId}:${email}`;
    const connection = activeConnections.get(key);
    if (!connection) return false;
    
    // Update the user's email preferences in the database
    await User.findByIdAndUpdate(userId, {
      [`emailPreferences.${email}`]: config
    });
    
    // Update connection settings
    if (connection.provider === 'google') {
      // Update google connection settings
      if (connection.connection?.updateConfig) {
        await connection.connection.updateConfig(config);
      }
    } else if (connection.provider === 'outlook') {
      // Update outlook connection settings
    } else if (connection.provider === 'custom') {
      // Update custom connection settings
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating connection config for ${userId}:${email}:`, error);
    return false;
  }
};


/**
 * Setup Google email sync for a user
 * @param {string} userId - MongoDB user ID
 * @param {string} email - Email address
 * @param {Object} tokens - OAuth tokens object
 * @returns {Object} Status object
 */
export const setupGoogleEmailSync = async (userId, email, tokens) => {
  try {
    console.log('Setting up Google email sync with tokens:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      email
    });
    
    // Initialize the connection with proper tokens
    const connectionKey = await initializeGoogleConnection(
      userId,
      email,
      tokens.refresh_token,
      tokens.access_token,
      {
        syncEnabled: true,
        mode: 'auto-reply',
        markAsRead: true
      }
    );
    
    console.log(`Google email sync set up for ${email} with connection key: ${connectionKey}`);
    return { success: true, connectionKey };
  } catch (error) {
    console.error(`Failed to set up Google email sync for ${email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Disconnect a Google email account
 * @param {string} userId - MongoDB user ID
 * @param {string} email - Email address to disconnect
 * @returns {Object} Status object
 */
export const disconnectGoogleEmail = async (userId, email) => {
  try {
    console.log(`Disconnecting Google email: ${email} for user ${userId}`);
    
    // Stop any active connection
    const connectionKey = `${userId}:${email}`;
    await stopConnection(connectionKey);
    
    // Remove from user's database record
    await User.findByIdAndUpdate(userId, {
      $pull: { connectedEmails: { email, provider: 'google' } }
    });
    
    // Remove from email preferences if exists
    await User.findByIdAndUpdate(userId, {
      $unset: { [`emailPreferences.${email}`]: "" }
    });
    
    console.log(`Successfully disconnected Google email ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`Error disconnecting Google email ${email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Disconnect an Outlook email account
 * @param {string} userId - MongoDB user ID
 * @param {string} email - Email address to disconnect
 * @returns {Object} Status object
 */
export const disconnectOutlookEmail = async (userId, email) => {
  try {
    console.log(`Disconnecting Outlook email: ${email} for user ${userId}`);
    
    // Stop any active connection
    const connectionKey = `${userId}:${email}`;
    await stopConnection(connectionKey);
    
    // Remove from user's database record
    await User.findByIdAndUpdate(userId, {
      $pull: { connectedEmails: { email, provider: 'outlook' } }
    });
    
    // Remove from email preferences if exists
    await User.findByIdAndUpdate(userId, {
      $unset: { [`emailPreferences.${email}`]: "" }
    });
    
    console.log(`Successfully disconnected Outlook email ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`Error disconnecting Outlook email ${email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Disconnect a custom email account
 * @param {string} userId - MongoDB user ID
 * @param {string} email - Email address to disconnect
 * @returns {Object} Status object
 */
export const disconnectCustomEmail = async (userId, email) => {
  try {
    console.log(`Disconnecting custom email: ${email} for user ${userId}`);
    
    // Stop any active connection
    const connectionKey = `${userId}:${email}`;
    await stopConnection(connectionKey);
    
    // Remove from user's database record
    await User.findByIdAndUpdate(userId, {
      $pull: { connectedEmails: { email, provider: 'custom' } }
    });
    
    // Remove from email preferences if exists
    await User.findByIdAndUpdate(userId, {
      $unset: { [`emailPreferences.${email}`]: "" }
    });
    
    console.log(`Successfully disconnected custom email ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`Error disconnecting custom email ${email}:`, error);
    return { success: false, error: error.message };
  }
};

// Check for new emails in connected accounts
export const checkEmails = async (userId, email) => {
  try {
    console.log(`Checking emails for ${email}...`);
    const connection = getConnection(userId, email);
    
    if (!connection) {
      console.error(`No active connection found for ${email}`);
      return { success: false, error: 'No active connection found' };
    }
    
    // Get timestamps for logging and tracking
    const startTime = Date.now();
    const lastSync = new Date();
    let newEmailsCount = 0;
    
    if (connection.provider === 'google') {
      try {
        // Check if the connection has a checkForNewEmails method
        if (connection.connection?.checkForNewEmails) {
          const result = await connection.connection.checkForNewEmails();
          newEmailsCount = result?.count || 0;
        } 
        // Fallback to direct import if needed
        else {
          const { checkForNewGoogleEmails } = await import('../services/googleEmailService.js');
          
          // Get tokens from the stored connection data or user record
          const user = await User.findById(userId).select('connectedEmails');
          const emailAccount = user.connectedEmails.find(e => e.email === email);
          
          if (!emailAccount) {
            return { success: false, error: 'Email account not found in user record' };
          }
          
          const tokens = emailAccount.tokens || {};
          const result = await checkForNewGoogleEmails(
            userId,
            email,
            tokens.refreshToken,
            tokens.accessToken,
            connection.config
          );
          
          newEmailsCount = result?.count || 0;
        }
        
        console.log(`Found ${newEmailsCount} new emails for Google account ${email}`);
      } catch (error) {
        console.error(`Error checking Google emails for ${email}:`, error);
        return { 
          success: false, 
          error: `Failed to check Google emails: ${error.message}`,
          lastAttempt: lastSync
        };
      }
    } 
    else if (connection.provider === 'outlook') {
      try {
        // Check if the connection has a checkForNewEmails method
        if (connection.connection?.checkForNewEmails) {
          const result = await connection.connection.checkForNewEmails();
          newEmailsCount = result?.count || 0;
        } 
        // Fallback to direct import if needed
        else {
          const { checkForNewOutlookEmails } = await import('../services/outlookEmailService.js');
          
          // Get tokens from the stored connection data or user record
          const user = await User.findById(userId).select('connectedEmails');
          const emailAccount = user.connectedEmails.find(e => e.email === email);
          
          if (!emailAccount) {
            return { success: false, error: 'Email account not found in user record' };
          }
          
          const tokens = emailAccount.tokens || {};
          const result = await checkForNewOutlookEmails(
            userId,
            email,
            tokens.refreshToken,
            tokens.accessToken,
            connection.config
          );
          
          newEmailsCount = result?.count || 0;
        }
        
        console.log(`Found ${newEmailsCount} new emails for Outlook account ${email}`);
      } catch (error) {
        console.error(`Error checking Outlook emails for ${email}:`, error);
        return { 
          success: false, 
          error: `Failed to check Outlook emails: ${error.message}`,
          lastAttempt: lastSync
        };
      }
    } 
    else if (connection.provider === 'custom') {
      try {
        // Check if the connection has a checkForNewEmails method
        if (connection.connection?.checkForNewEmails) {
          const result = await connection.connection.checkForNewEmails();
          newEmailsCount = result?.count || 0;
        } 
        // Fallback to direct import if needed
        else {
          const { checkForNewCustomEmails } = await import('../services/customEmailService.js');
          
          // Get credentials from the stored connection data or user record
          const user = await User.findById(userId).select('connectedEmails');
          const emailAccount = user.connectedEmails.find(e => e.email === email);
          
          if (!emailAccount) {
            return { success: false, error: 'Email account not found in user record' };
          }
          
          const credentials = emailAccount.credentials || {};
          const result = await checkForNewCustomEmails(
            userId,
            email,
            credentials,
            connection.config
          );
          
          newEmailsCount = result?.count || 0;
        }
        
        console.log(`Found ${newEmailsCount} new emails for custom account ${email}`);
      } catch (error) {
        console.error(`Error checking custom emails for ${email}:`, error);
        return { 
          success: false, 
          error: `Failed to check custom emails: ${error.message}`,
          lastAttempt: lastSync
        };
      }
    } 
    else {
      console.warn(`Unknown provider: ${connection.provider} for ${email}`);
      return { success: false, error: `Unknown provider: ${connection.provider}` };
    }
    
    // Update the last sync time in the database
    try {
      await User.findByIdAndUpdate(userId, {
        $set: { [`connectedEmails.$[elem].lastSync`]: lastSync }
      }, {
        arrayFilters: [{ "elem.email": email }]
      });
    } catch (dbError) {
      console.error(`Error updating lastSync time for ${email}:`, dbError);
      // Continue anyway, this is not a critical failure
    }
    
    // Log performance metrics
    const duration = Date.now() - startTime;
    console.log(`Email check for ${email} completed in ${duration}ms, found ${newEmailsCount} new emails`);
    
    return {
      success: true,
      count: newEmailsCount,
      lastSync,
      duration,
      email
    };
  } catch (error) {
    console.error(`Unexpected error checking emails for ${email}:`, error);
    return {
      success: false,
      error: `Unexpected error: ${error.message}`,
      email
    };
  }
};

// Don't forget to add this function to your default export
export default {
  initializeAllConnections,
  initializeUserConnections,
  addConnection,
  stopConnection,
  getConnection,
  updateConnectionConfig,
  setupGoogleEmailSync,
  disconnectGoogleEmail, 
  disconnectOutlookEmail,
  disconnectCustomEmail,
  checkEmails
};
