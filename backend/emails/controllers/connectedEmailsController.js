import mongoose from 'mongoose';
import ConnectedEmail from '../../models/ConnectedEmail.js';
import connectionManager from '../managers/connectionManager.js';
import { notifyConnectionStatus } from '../managers/notificationManager.js';
import { getSyncConfig } from '../config/emailConfig.js';

/**
 * Get all connected emails for a user
 */
export const getConnectedEmails = async (req, res) => {
  try {
    const userId = req.user._id;
    const connectedEmails = await ConnectedEmail.find({ userId })
      .select('-tokens.accessToken -tokens.refreshToken')
      .sort('-createdAt');
    
    res.json({ success: true, emails: connectedEmails });
  } catch (error) {
    console.error('Error getting connected emails:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get connected emails' 
    });
  }
};

/**
 * Update connection settings
 */
export const updateSettings = async (req, res) => {
  try {
    const { email } = req.params;
    const { config } = req.body;
    const userId = req.user._id;

    // Update using connection manager
    const success = await connectionManager.updateConnectionConfig(userId, email, config);
    
    if (success) {
      await notifyConnectionStatus({
        userId,
        email,
        status: 'info',
        message: 'Connection settings updated'
      });
      
      res.json({ success: true });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Failed to update settings' 
      });
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Get connection status
 */
export const getStatus = async (req, res) => {
  try {
    const { email } = req.params;
    const userId = req.user._id;

    const connection = connectionManager.getConnection(userId, email);
    const connectedEmail = await ConnectedEmail.findOne({ userId, email });

    if (!connectedEmail) {
      return res.status(404).json({ 
        success: false, 
        error: 'Email connection not found' 
      });
    }

    res.json({
      success: true,
      status: {
        isConnected: !!connection,
        lastConnected: connectedEmail.lastConnected,
        status: connectedEmail.status,
        syncConfig: connectedEmail.syncConfig,
        aiSettings: connectedEmail.aiSettings,
        error: connectedEmail.lastError
      }
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Manually refresh email sync
 */
export const refreshEmailSync = async (req, res) => {
  try {
    const { email } = req.params;
    const userId = req.user._id;

    const connection = connectionManager.getConnection(userId, email);
    if (!connection) {
      return res.status(400).json({
        success: false,
        error: 'No active connection found'
      });
    }

    // Check for new emails
    const result = await connectionManager.checkEmails(userId, email);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Email sync refreshed',
        newEmails: result.count
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to refresh sync'
      });
    }
  } catch (error) {
    console.error('Error refreshing sync:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Disconnect email
 */
export const disconnect = async (req, res) => {
  try {
    const { email } = req.params;
    const userId = req.user._id;

    const connectedEmail = await ConnectedEmail.findOne({ userId, email });
    if (!connectedEmail) {
      return res.status(404).json({ 
        success: false, 
        error: 'Email connection not found' 
      });
    }

    // Use connection manager to stop connection
    const key = `${userId}:${email}`;
    await connectionManager.stopConnection(key);

    // Update database status
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      status: 'disconnected',
      disconnectedAt: new Date(),
      'tokens.accessToken': null,
      'tokens.refreshToken': null
    });

    await notifyConnectionStatus({
      userId,
      email,
      status: 'info',
      message: 'Email disconnected successfully'
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export default {
  getConnectedEmails,
  updateSettings,
  getStatus,
  disconnect,
  refreshEmailSync
};
