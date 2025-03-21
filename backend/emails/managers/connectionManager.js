import mongoose from 'mongoose';
import User from '../../models/User.js';
import ConnectedEmail from '../../models/ConnectedEmail.js';
import getConnectedEmailModels, { validateEmailCollections } from '../../models/ConnectedEmailModels.js';
import { initializeGoogleConnection } from '../services/googleEmailService.js';

// Store active connections
const activeConnections = new Map();

/**
 * Initialize all user email connections at server startup
 */
export const initializeAllConnections = async () => {
  try {
    console.log('Initializing all email connections...');
    
    const connectedEmails = await ConnectedEmail.find({
      status: 'active'
    }).populate('userId');
    
    console.log(`Found ${connectedEmails.length} active email connections`);
    
    for (const connectedEmail of connectedEmails) {
      await initializeEmailConnection(connectedEmail);
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
 */
export const initializeUserConnections = async (userId) => {
  try {
    const connectedEmails = await ConnectedEmail.find({
      userId,
      status: 'active'
    });
    
    for (const connectedEmail of connectedEmails) {
      await initializeEmailConnection(connectedEmail);
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to initialize connections for user ${userId}:`, error);
    return false;
  }
};

/**
 * Initialize a single email connection
 */
async function initializeEmailConnection(connectedEmail) {
  const { userId, email, provider, tokens, status } = connectedEmail;

  if (status !== 'active' || !tokens?.refreshToken) {
    return false;
  }

  try {
    // First validate/create collections for this email
    await validateEmailCollections(connectedEmail._id.toString());

    // Initialize email models for this connection
    const emailModels = getConnectedEmailModels(connectedEmail._id.toString());

    if (provider === 'google') {
      await initializeGoogleConnection(
        userId,
        email,
        tokens.refreshToken,
        tokens.accessToken,
        {
          syncEnabled: true,
          markAsRead: true
        }
      );
    }

    // Start email checking schedule
    console.log(`💯​ 🚀​💥​ Starting email checks for ${email}`);
    const schedulingManager = (await import('./schedulingManager.js')).default;
    await schedulingManager.scheduleEmailChecks(userId, email);
    // Add other providers here
    
    console.log(`Initialized ${provider} connection for ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to initialize ${provider} connection for ${email}:`, error);
    
    // Update connection status to error
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      status: 'error',
      lastError: {
        message: error.message,
        date: new Date(),
        code: 'INIT_ERROR'
      }
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

    const key = `${userId}:${email}`;
    activeConnections.set(key, {
      userId,
      email,
      provider,
      connection,
      startTime: new Date(),
      emailModels: getConnectedEmailModels(connectedEmail._id.toString())
    });

    console.log(`Added ${provider} connection for ${email}`);
    return key;
  } catch (error) {
    console.error(`Error adding connection for ${email}:`, error);
    throw error;
  }
};

/**
 * Stop a specific connection
 */
export const stopConnection = async (connectionKey) => {
  const connection = activeConnections.get(connectionKey);
  if (!connection) {
    console.log(`No active connection found for key: ${connectionKey}`);
    return true; // Return true if there's no connection to stop (already disconnected)
  }
  
  try {
    const { userId, email, provider, connection: connObj } = connection;
    console.log(`Stopping ${provider} connection for ${email}`);
    
    // Clean up any intervals or listeners
    if (provider === 'google' && connObj.interval) {
      clearInterval(connObj.interval);
      console.log(`Cleared interval for ${email}`);
    }
    
    if (provider === 'google' && connObj.watch) {
      try {
        await connObj.watch.stop();
        console.log(`Stopped Gmail watch for ${email}`);
      } catch (watchErr) {
        console.warn(`Error stopping Gmail watch for ${email}:`, watchErr);
      }
    }
    
    // Remove from active connections map
    activeConnections.delete(connectionKey);
    
    // Update connection status in database (belt and suspenders approach)
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
    // Still return true to proceed with disconnection in the UI
    return true;
  }
};

/**
 * Get a specific connection
 */
export const getConnection = (userId, email) => {
  return activeConnections.get(`${userId}:${email}`);
};

/**
 * Update email configuration
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
          aiSettings: config.aiSettings
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
 * Setup Google email sync
 */
export const setupGoogleEmailSync = async (userId, email, tokens) => {
  try {
    console.log('Setting up Google email sync:', { email });
    
    const connectedEmail = await ConnectedEmail.findOne({ userId, email });
    if (!connectedEmail) {
      throw new Error('Connected email account not found');
    }

    // Ensure collections are created/valid
    await validateEmailCollections(connectedEmail._id.toString());
    
    // Initialize the connection
    const success = await initializeGoogleConnection(
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
    
    if (!success) {
      throw new Error('Failed to initialize Google connection');
    }
    
    console.log(`Google email sync set up for ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to set up Google email sync for ${email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Disconnect a Google email connection
 */
export const disconnectGoogleEmail = async (userId, email) => {
  try {
    console.log(`Disconnecting Google email ${email} for user ${userId}`);
    
    // First update the database record
    const connectedEmail = await ConnectedEmail.findOneAndUpdate(
      { userId, email, provider: 'google' },
      { 
        $set: {
          status: 'disconnected',
          disconnectedAt: new Date(),
          'tokens.accessToken': null,
          'tokens.refreshToken': null
        }
      },
      { new: true }
    );
    
    if (!connectedEmail) {
      console.log(`No Google email found for ${email}`);
      return { success: false, error: 'Email account not found' };
    }
    
    // Then stop the active connection if it exists
    const key = `${userId}:${email}`;
    const success = await stopConnection(key);
    
    console.log(`Google email ${email} disconnected successfully:`, { 
      dbUpdated: !!connectedEmail, 
      connectionStopped: success 
    });
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to disconnect Google email ${email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Disconnect an Outlook email connection
 */
export const disconnectOutlookEmail = async (userId, email) => {
  try {
    const key = `${userId}:${email}`;
    const success = await stopConnection(key);
    return { success };
  } catch (error) {
    console.error(`Failed to disconnect Outlook email ${email}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Disconnect a custom email connection
 */
export const disconnectCustomEmail = async (userId, email) => {
  try {
    const key = `${userId}:${email}`;
    const success = await stopConnection(key);
    return { success };
  } catch (error) {
    console.error(`Failed to disconnect custom email ${email}:`, error);
    return { success: false, error: error.message };
  }
};

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
  disconnectCustomEmail
};
