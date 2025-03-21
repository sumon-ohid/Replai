import mongoose from 'mongoose';
import User from '../../models/User.js';
import ConnectedEmail from '../../models/ConnectedEmail.js';
import getConnectedEmailModels, { validateEmailCollections } from '../../models/ConnectedEmailModels.js';
import { initializeGoogleConnection } from '../services/googleEmailService.js';
import { notifyConnectionStatus, notifyConnectionError } from './notificationManager.js';
import { getSyncConfig } from '../config/emailConfig.js';

// Store active connections
const activeConnections = new Map();

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

    // Initialize email models for this connection
    const emailModels = getConnectedEmailModels(connectedEmail._id.toString());

    // Set default AI settings if not present
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      $set: {
        status: 'active',
        lastConnected: new Date()
      },
      $setOnInsert: {
        aiSettings: {
          enabled: true,
          mode: 'auto-reply'
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
          mode: 'auto-reply',
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
export const getConnection = (userId, email) => {
  const key = `${userId}:${email}`;
  return activeConnections.get(key);
};

/**
 * Check for new emails
 */
export const checkEmails = async (userId, email) => {
  try {
    const connection = getConnection(userId, email);
    if (!connection || !connection.connection) {
      throw new Error('No active connection found');
    }

    const emailService = await import(`../services/googleEmailService.js`);
    const newEmails = await emailService.checkForNewGoogleEmails(
      connection.connection.gmail,
      userId,
      email
    );

    return {
      success: true,
      count: newEmails.length,
      emails: newEmails
    };
  } catch (error) {
    console.error(`Error checking emails for ${email}:`, error);
    return {
      success: false,
      error: error.message
    };
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

export default {
  initializeAllConnections,
  addConnection,
  stopConnection,
  getConnection,
  checkEmails,
  updateConnectionConfig
};
