import mongoose from 'mongoose';
import User from '../../models/User.js';
import ConnectedEmail from '../../models/ConnectedEmail.js';
import getConnectedEmailModels, { validateEmailCollections } from '../../models/ConnectedEmailModels.js';
import { initializeGoogleConnection } from '../services/googleEmailService.js';
import { notifyConnectionStatus, notifyConnectionError } from './notificationManager.js';
import { getSyncConfig } from '../config/emailConfig.js';
import NotificationManager from './notificationManager.js';

// Store active connections
const activeConnections = new Map();

// Cache for email service imports
const emailServiceCache = new Map();


/**
 * Initialize all email connections for all users
 */
export const initializeAllConnections = async () => {
  try {
    console.log("Starting to initialize all email connections...");
    
    // Find all users who have connected emails
    const users = await User.find({
      "connectedEmails.0": { $exists: true } // Only users with at least one connected email
    });
    
    console.log(`Found ${users.length} users with connected emails`);
    
    let totalConnections = 0;
    
    // Process each user's connected emails
    for (const user of users) {
      const userId = user._id.toString();
      
      console.log(`Processing ${user.connectedEmails.length} emails for user ${userId}`);
      totalConnections += user.connectedEmails.length;
      
      // Initialize each email connection
      for (const connectedEmail of user.connectedEmails) {
        try {
          if (connectedEmail.status === 'active') {
            await initializeEmailConnection(userId, connectedEmail.email, connectedEmail);
          }
        } catch (error) {
          console.error(`❌ Failed to initialize ${connectedEmail.provider} connection for ${connectedEmail.email}:`, error);
        }
      }
    }
    
    console.log(`Found ${totalConnections} email connections to initialize`);
    console.log("✅ All email connections initialization process completed");
    
  } catch (error) {
    console.error("❌ Failed to initialize email connections:", error);
    throw error;
  }
};

/**
 * Initialize an email connection for a user
 */
export async function initializeEmailConnection(userId, email, connectedEmailData = null) {
  try {
    // Validate parameters
    if (!userId) {
      throw new Error('Invalid userId for email connection');
    }
    
    if (!email) {
      throw new Error('Invalid email address for connection');
    }
    
    // Get user and connected email data if not provided
    if (!connectedEmailData) {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error(`User not found for ID: ${userId}`);
      }
      
      // Find the connected email in the user's array
      connectedEmailData = user.connectedEmails.find(e => e.email === email);
      
      if (!connectedEmailData) {
        throw new Error(`Connected email ${email} not found for user ${userId}`);
      }
    }
    
    // Log initiation
    console.log(`🚀 Initializing ${connectedEmailData.provider} connection for ${email}`);
    
    // Initialize based on provider
    if (connectedEmailData.provider === 'google') {
      // For Google provider
      if (userId && email) {
        // Get the user to access Google auth data
        const user = await User.findById(userId);
        
        if (!user || !user.googleAuth || !user.googleAuth.refreshToken) {
          throw new Error(`Google authentication data not found for user ${userId}`);
        }
        
        // Use the Google auth data from the user document
        await initializeGoogleConnection(
          userId,
          email,
          user.googleAuth.refreshToken,
          user.googleAuth.accessToken,
          {
            syncEnabled: connectedEmailData.syncEnabled !== false,
            connectedEmailData: connectedEmailData
          }
        );
        
        console.log(`✅ Successfully initialized Google connection for ${email}`);
        await notifyConnectionStatus(userId, email, 'connected');
      }
    } else if (connectedEmailData.provider === 'microsoft') {
      // Add Microsoft initialization logic
      // ...
    } else {
      throw new Error(`Unsupported email provider: ${connectedEmailData.provider}`);
    }
  } catch (error) {
    console.error(`❌ Failed to initialize ${connectedEmailData?.provider || 'unknown'} connection for ${email}:`, error);
    await notifyConnectionStatus(userId, email, 'error', error.message);
    throw error;
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
          if (!connection && userId && email) {
            try {
              await initializeEmailConnection(userId, email);
              // Try to get the connection again
              return await getConnection(userId, email);
            } catch (initError) {
              console.error(`Failed to initialize connection for ${email}:`, initError);
              return null;
            }
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
    
    // Get the email ID to delete collections first (important to do this before deleting the record)
    const emailId = connectedEmail._id.toString();
    
    // Delete the connected email record completely
    await ConnectedEmail.findByIdAndDelete(connectedEmail._id);
    console.log(`Deleted ConnectedEmail record for ${email}`);
    
    // Update user model by pulling this email from emailPreferences
    await User.findByIdAndUpdate(userId, {
      $unset: { [`emailPreferences.${email}`]: "" },
      $pull: { connectedEmails: email }
    });
    console.log(`Removed email from User preferences: ${email}`);

    // Send notification to the user
    await NotificationManager.createNotification({
      userId: userId,
      type: "info",
      title: "Email Account Disconnected",
      message: `Your Google account ${email} has been successfully disconnected.`,
      metadata: {
        category: "email",
        action: "disconnected",
        url: "/email-manager",
        timestamp: new Date().toISOString(),
      },
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

/**
 * Remove all intervals and timeouts for a specific connection
 * @param {string} userId - User ID
 * @param {string} email - Email address
 */
export const removeAllIntervals = async (userId, email) => {
  console.log(`Removing all intervals for ${email}`);
  
  const userConnectionKey = `${userId}:${email}`;
  const connection = activeConnections.get(userConnectionKey);  // Use activeConnections instead of this.connections
  
  if (connection) {
    // Clear any timeouts or intervals in the connection object
    if (connection.connection) {
      if (connection.connection.interval) {
        console.log(`Clearing main interval for ${email}`);
        clearTimeout(connection.connection.interval);
        connection.connection.interval = null;
      }
      
      if (connection.connection.syncInterval) {
        console.log(`Clearing sync interval for ${email}`);
        clearTimeout(connection.connection.syncInterval);
        connection.connection.syncInterval = null;
      }
      
      if (connection.connection.refreshInterval) {
        console.log(`Clearing refresh interval for ${email}`);
        clearTimeout(connection.connection.refreshInterval);
        connection.connection.refreshInterval = null;
      }
    }
    
    // Remove the connection from the map
    activeConnections.delete(userConnectionKey);
    console.log(`Removed connection for ${email} from connection manager`);
  } else {
    console.log(`No active connection found for ${email}, nothing to clean up`);
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
  getUserConnections,
  removeAllIntervals,
};
