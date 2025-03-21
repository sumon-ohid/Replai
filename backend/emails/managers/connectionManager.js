import mongoose from 'mongoose';
import User from '../../models/User.js';
import ConnectedEmail from '../../models/ConnectedEmail.js';
import getConnectedEmailModels, { validateEmailCollections } from '../../models/ConnectedEmailModels.js';
import { initializeGoogleConnection } from '../services/googleEmailService.js';
import { notifyConnectionStatus, notifyConnectionError } from './notificationManager.js';
import { getSyncConfig } from '../config/emailConfig.js';

// Store active connections
const activeConnections = new Map();

// Cache for email service imports
const emailServiceCache = new Map();

/**
 * Initialize all email connections at server startup
 */
export const initializeAllConnections = async () => {
  try {
    console.log('🔄 Initializing all email connections...');
    
    // Find all connected emails regardless of status
    const connectedEmails = await ConnectedEmail.find({
      provider: 'google',
      'tokens.refreshToken': { $exists: true }
    }).populate('userId');
    
    console.log(`📧 Found ${connectedEmails.length} email connections to initialize`);

    for (const connectedEmail of connectedEmails) {
      await initializeEmailConnection(connectedEmail);
    }
    
    console.log('✅ All email connections initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize email connections:', error);
    return false;
  }
};

/**
 * Initialize a single email connection
 */
async function initializeEmailConnection(connectedEmail) {
  const { userId, email, provider, tokens } = connectedEmail;
  
  if (!tokens?.refreshToken) {
    console.log(`⚠️ Skipping ${email} - no refresh token available`);
    return false;
  }

  try {
    console.log(`🚀 Initializing ${provider} connection for ${email}`);
    
    // First validate/create collections for this email
    await validateEmailCollections(connectedEmail._id.toString());

    // Initialize and validate email models
    const emailModels = getConnectedEmailModels(connectedEmail._id.toString());
    if (!emailModels || !emailModels.Email) {
      throw new Error('Email models not properly initialized');
    }

    // Set default AI settings if not present
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      $set: {
        status: 'active',
        lastConnected: new Date()
      },
      $setOnInsert: {
        aiSettings: {
          enabled: true,
          mode: 'auto'
        }
      }
    }, { upsert: true });

    // Initialize provider connection
    let successful = false;
    if (provider === 'google') {
      successful = await initializeGoogleConnection(
        userId,
        email,
        tokens.refreshToken,
        tokens.accessToken,
        {
          syncEnabled: true,
          mode: 'auto',
          aiEnabled: true,
          markAsRead: true
        }
      );
    }

    if (!successful) {
      throw new Error(`Failed to initialize ${provider} connection`);
    }

    // Start email checking schedule
    console.log(`💫 Starting email checks for ${email}`);
    const schedulingManager = (await import('./schedulingManager.js')).default;
    await schedulingManager.scheduleEmailChecks(userId, email);
    
    console.log(`✅ Successfully initialized ${provider} connection for ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to initialize ${provider} connection for ${email}:`, error);
    
    // Update connection status to error
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      status: 'error',
      lastError: {
        message: error.message,
        date: new Date(),
        code: 'INIT_ERROR'
      }
    });

    // Notify about the error
    await notifyConnectionError({
      userId,
      email,
      message: `Failed to initialize connection: ${error.message}`
    });
    
    return false;
  }
}

/**
 * Add a new connection to the active connections map
 */
export const addConnection = async (userId, email, provider, connection) => {
  try {
    const connectedEmail = await ConnectedEmail.findOne({ userId, email });
    if (!connectedEmail) {
      throw new Error('Connected email not found');
    }

    // Validate collections before adding connection
    await validateEmailCollections(connectedEmail._id.toString());

    // Get and validate email models
    const emailModels = getConnectedEmailModels(connectedEmail._id.toString());
    if (!emailModels || !emailModels.Email) {
      throw new Error('Email models not properly initialized');
    }

    const key = `${userId}:${email}`;
    activeConnections.set(key, {
      userId,
      email,
      provider,
      connection,
      startTime: new Date(),
      emailModels
    });

    console.log(`Added ${provider} connection for ${email}`);
    return key;
  } catch (error) {
    console.error(`Error adding connection for ${email}:`, error);
    throw error;
  }
};

/**
 * Update connection configuration
 */
export const updateConnectionConfig = async (userId, email, config) => {
  try {
    const key = `${userId}:${email}`;
    const connection = activeConnections.get(key);
    if (!connection) return false;
    
    // Update connection settings in database
    await ConnectedEmail.findOneAndUpdate(
      { userId, email },
      {
        $set: {
          syncConfig: config.syncConfig,
          aiSettings: config.aiSettings,
          updatedAt: new Date()
        }
      }
    );
    
    // Update active connection if needed
    if (connection.connection?.updateConfig) {
      await connection.connection.updateConfig(config);
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating connection config for ${userId}:${email}:`, error);
    return false;
  }
};

/**
 * Get a specific connection
 */
export const getConnection = async (userId, email) => {
  const key = `${userId}:${email}`;
  let connection = activeConnections.get(key);
  
  if (!connection) {
    // Check if the email exists and is active in the database
    const connectedEmail = await ConnectedEmail.findOne({ 
      userId, 
      email,
      status: 'active'
    });
    
    if (connectedEmail) {
      console.log(`Connection for ${email} not found in memory but active in database. Reinitializing...`);
      try {
        // Try to reinitialize the connection
        const success = await initializeEmailConnection(connectedEmail);
        if (success) {
          // Wait a moment for the connection to be fully established
          await new Promise(resolve => setTimeout(resolve, 1000));
          connection = activeConnections.get(key);
          if (!connection) {
            throw new Error('Connection initialization failed');
          }
        } else {
          throw new Error('Connection initialization returned false');
        }
      } catch (error) {
        console.error(`Failed to reinitialize connection for ${email}:`, error);
        // Update connection status to error
        await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
          status: 'error',
          lastError: {
            message: error.message,
            date: new Date(),
            code: 'REINIT_ERROR'
          }
        });
        return null;
      }
    } else {
      return null;
    }
  }
  
  return connection;
};

/**
 * Get email service for a specific provider
 * @param {string} provider - Email provider (google, outlook, etc.)
 * @returns {Object} Email service module
 */
export const getEmailService = async (provider) => {
  try {
    // Check cache first
    if (emailServiceCache.has(provider)) {
      return emailServiceCache.get(provider);
    }
    
    // Determine the correct service module path
    let servicePath;
    switch (provider.toLowerCase()) {
      case 'google':
      case 'gmail':
        servicePath = '../services/googleEmailService.js';
        break;
      case 'outlook':
      case 'microsoft':
        servicePath = '../services/outlookEmailService.js';
        break;
      default:
        throw new Error(`Unsupported email provider: ${provider}`);
    }
    
    // Import the service module
    const service = await import(servicePath);
    
    // Cache for future use
    emailServiceCache.set(provider, service);
    
    return service;
  } catch (error) {
    console.error(`Failed to load email service for ${provider}:`, error);
    throw new Error(`Email service unavailable for ${provider}`);
  }
};

/**
 * Check for new emails
 */
export const checkEmails = async (userId, email) => {
  try {
    const connection = await getConnection(userId, email);
    if (!connection || !connection.connection) {
      throw new Error('No active connection found');
    }

    // Get the appropriate email service
    const service = await getEmailService(connection.provider);
    
    // Dispatch to the correct check method
    let newEmails = [];
    if (connection.provider === 'google') {
      newEmails = await service.checkForNewGoogleEmails(
        connection.connection.gmail,
        userId,
        email
      );
    } else {
      throw new Error(`Unsupported provider: ${connection.provider}`);
    }
    
    // Update last sync time
    await updateLastSync(userId, email);

    return {
      success: true,
      count: newEmails.length,
      emails: newEmails
    };
  } catch (error) {
    console.error(`Error checking emails for ${email}:`, error);
    // Update error status in database
    try {
      await ConnectedEmail.findOneAndUpdate(
        { userId, email },
        { 
          $set: { 
            lastError: {
              message: error.message,
              date: new Date(),
              code: 'SYNC_ERROR'
            }
          }
        }
      );
    } catch (dbError) {
      console.error('Failed to update error status:', dbError);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update last sync time for a connection
 */
export const updateLastSync = async (userId, email) => {
  const key = `${userId}:${email}`;
  const connectionData = activeConnections.get(key);
  
  if (connectionData) {
    connectionData.lastSync = new Date();
    activeConnections.set(key, connectionData);
    
    // Also update in database
    await ConnectedEmail.findOneAndUpdate(
      { userId, email },
      { 
        $set: { lastSync: new Date() },
        $inc: { 'stats.syncCount': 1 }
      }
    );
  }
};

/**
 * Stop a specific connection
 */
export const stopConnection = async (connectionKey) => {
  const connection = activeConnections.get(connectionKey);
  if (!connection) {
    console.log(`No active connection found for key: ${connectionKey}`);
    return true;
  }
  
  try {
    const { userId, email, provider, connection: connObj } = connection;
    console.log(`Stopping ${provider} connection for ${email}`);
    
    if (provider === 'google' && connObj.interval) {
      clearInterval(connObj.interval);
    }
    
    activeConnections.delete(connectionKey);
    
    await ConnectedEmail.findOneAndUpdate(
      { userId, email },
      { 
        status: 'disconnected',
        disconnectedAt: new Date()
      }
    );
    
    console.log(`Successfully stopped ${provider} connection for ${email}`);
    return true;
  } catch (error) {
    console.error(`Error stopping connection ${connectionKey}:`, error);
    return true;
  }
};

/**
 * Disconnect a Google email connection
 * @param {string} userId - User ID
 * @param {string} email - Email address to disconnect
 * @returns {Object} Result of disconnect operation
 */
export const disconnectGoogleEmail = async (userId, email) => {
  try {
    console.log(`Disconnecting Google email ${email} for user ${userId}`);
    
    // Find the email account
    const connectedEmail = await ConnectedEmail.findOne({ userId, email, provider: 'google' });
    
    if (!connectedEmail) {
      console.log(`No connected email found for ${email}`);
      return { success: false, error: 'Email account not found' };
    }
    
    // Stop the active connection if it exists
    const key = `${userId}:${email}`;
    await stopConnection(key);
    
    // Update the database record
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      status: 'disconnected',
      disconnectedAt: new Date(),
      'tokens.refreshToken': null, // Clear tokens for security
      'tokens.accessToken': null
    });
    
    // Update user preferences
    await User.findByIdAndUpdate(userId, {
      $set: { [`emailPreferences.${email}.syncEnabled`]: false }
    });
    
    // Send notification
    await notifyConnectionStatus({
      userId,
      email,
      status: 'info',
      message: `Email account ${email} has been disconnected`
    });
    
    console.log(`Successfully disconnected Google email ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to disconnect Google email ${email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Re-enable a previously disconnected email
 */
export const reconnectEmail = async (userId, email) => {
  try {
    // Find the email account
    const connectedEmail = await ConnectedEmail.findOne({ userId, email });
    
    if (!connectedEmail) {
      return { success: false, error: 'Email account not found' };
    }
    
    if (!connectedEmail.tokens?.refreshToken) {
      return { success: false, error: 'No refresh token available. Please reconnect via OAuth.' };
    }
    
    // Update status in database
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      status: 'active',
      disconnectedAt: null,
      reconnectedAt: new Date()
    });
    
    // Initialize the connection
    const success = await initializeEmailConnection(connectedEmail);
    
    if (!success) {
      throw new Error('Failed to initialize connection');
    }
    
    // Update user preferences
    await User.findByIdAndUpdate(userId, {
      $set: { 
        [`emailPreferences.${email}.syncEnabled`]: true,
        [`emailPreferences.${email}.mode`]: 'auto',
        [`emailPreferences.${email}.aiEnabled`]: true
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to reconnect email ${email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all active connections
 */
export const getAllConnections = () => {
  return [...activeConnections.entries()].map(([key, value]) => {
    const [userId, email] = key.split(':');
    return {
      userId,
      email,
      provider: value.provider,
      startTime: value.startTime,
      lastSync: value.lastSync
    };
  });
};

/**
 * Force sync all accounts
 */
export const forceSyncAllAccounts = async () => {
  try {
    console.log('Force syncing all email accounts...');
    
    const connections = getAllConnections();
    let successCount = 0;
    let failureCount = 0;
    
    for (const conn of connections) {
      try {
        const result = await checkEmails(conn.userId, conn.email);
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error(`Error syncing ${conn.email}:`, error);
        failureCount++;
      }
    }
    
    console.log(`Force sync complete: ${successCount} successful, ${failureCount} failed`);
    return { 
      success: true, 
      syncedCount: successCount, 
      failedCount: failureCount 
    };
  } catch (error) {
    console.error('Error during force sync:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all active connections for a specific user
 * @param {string} userId - User ID to filter connections
 * @returns {Array} Array of active connection objects for the user
 */
export const getUserConnections = (userId) => {
  if (!userId) {
    console.warn('getUserConnections called without userId');
    return [];
  }
  
  try {
    // Filter connections by userId
    const userConnections = [];
    
    for (const [key, connection] of activeConnections.entries()) {
      if (connection.userId === userId) {
        userConnections.push({
          email: connection.email,
          provider: connection.provider,
          startTime: connection.startTime,
          status: 'active'
        });
      }
    }
    
    return userConnections;
  } catch (error) {
    console.error('Error getting user connections:', error);
    return [];
  }
};

// Make sure to add the function to the default export
export default {
  initializeAllConnections,
  addConnection,
  stopConnection,
  getConnection,
  getEmailService,
  checkEmails,
  updateConnectionConfig,
  disconnectGoogleEmail,
  reconnectEmail,
  getAllConnections,
  updateLastSync,
  forceSyncAllAccounts,
  getUserConnections
};
