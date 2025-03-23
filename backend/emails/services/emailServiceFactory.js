import mongoose from 'mongoose';
import User from '../../models/User.js';
import googleEmailService from './googleEmailService.js';
import outlookEmailService from './outlookEmailService.js';
import customEmailService from './customEmailService.js';

/**
 * Get Google email service for a specific user and email
 * @param {String} userId - MongoDB user ID
 * @param {String} email - Email address (optional)
 * @returns {Object} Google email service instance
 */
export const getEmailGoogleService = async (userId, email = null) => {
  try {
    const user = await User.findById(userId).select('connectedEmails');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // If email is provided, find that specific connection
    let emailConnection;
    if (email) {
      emailConnection = user.connectedEmails.find(
        conn => conn.email === email && conn.provider === 'google'
      );
      
      if (!emailConnection) {
        throw new Error(`Google connection for ${email} not found`);
      }
    } else {
      // Otherwise, get the first available Google connection
      emailConnection = user.connectedEmails.find(conn => conn.provider === 'google');
      
      if (!emailConnection) {
        throw new Error('No Google email connection available');
      }
    }
    
    // Get refresh and access tokens
    const { refreshToken, accessToken } = emailConnection.tokens || {};
    
    if (!refreshToken) {
      throw new Error('Missing refresh token for Google email service');
    }
    
    // Initialize and return the service
    return googleEmailService.createService(
      userId, 
      emailConnection.email, 
      refreshToken, 
      accessToken
    );
  } catch (error) {
    console.error('Error getting Google email service:', error);
    throw error;
  }
};

/**
 * Get Outlook email service for a specific user and email
 * @param {String} userId - MongoDB user ID
 * @param {String} email - Email address (optional)
 * @returns {Object} Outlook email service instance
 */
export const getEmailOutlookService = async (userId, email = null) => {
  try {
    const user = await User.findById(userId).select('connectedEmails');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // If email is provided, find that specific connection
    let emailConnection;
    if (email) {
      emailConnection = user.connectedEmails.find(
        conn => conn.email === email && conn.provider === 'outlook'
      );
      
      if (!emailConnection) {
        throw new Error(`Outlook connection for ${email} not found`);
      }
    } else {
      // Otherwise, get the first available Outlook connection
      emailConnection = user.connectedEmails.find(conn => conn.provider === 'outlook');
      
      if (!emailConnection) {
        throw new Error('No Outlook email connection available');
      }
    }
    
    // Get refresh and access tokens
    const { refreshToken, accessToken } = emailConnection.tokens || {};
    
    if (!refreshToken) {
      throw new Error('Missing refresh token for Outlook email service');
    }
    
    // Initialize and return the service
    return outlookEmailService.createService(
      userId, 
      emailConnection.email, 
      refreshToken, 
      accessToken
    );
  } catch (error) {
    console.error('Error getting Outlook email service:', error);
    throw error;
  }
};

/**
 * Get Custom email service for a specific user and email
 * @param {String} userId - MongoDB user ID
 * @param {String} email - Email address (optional)
 * @returns {Object} Custom email service instance
 */
export const getEmailCustomService = async (userId, email = null) => {
  try {
    const user = await User.findById(userId).select('connectedEmails');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // If email is provided, find that specific connection
    let emailConnection;
    if (email) {
      emailConnection = user.connectedEmails.find(
        conn => conn.email === email && conn.provider === 'custom'
      );
      
      if (!emailConnection) {
        throw new Error(`Custom connection for ${email} not found`);
      }
    } else {
      // Otherwise, get the first available Custom connection
      emailConnection = user.connectedEmails.find(conn => conn.provider === 'custom');
      
      if (!emailConnection) {
        throw new Error('No Custom email connection available');
      }
    }
    
    // Get credentials
    const credentials = emailConnection.credentials || {};
    
    if (!credentials.password || !credentials.imapHost || !credentials.smtpHost) {
      throw new Error('Missing credentials for Custom email service');
    }
    
    // Initialize and return the service
    return customEmailService.createService(
      userId, 
      emailConnection.email, 
      credentials
    );
  } catch (error) {
    console.error('Error getting Custom email service:', error);
    throw error;
  }
};

/**
 * Get appropriate email service based on provider
 * @param {String} userId - MongoDB user ID
 * @param {String} provider - Email provider (google, outlook, custom)
 * @param {String} email - Email address (optional)
 * @returns {Object} Email service instance
 */
export const getEmailService = async (userId, provider, email = null) => {
  switch (provider.toLowerCase()) {
    case 'google':
      return getEmailGoogleService(userId, email);
    case 'outlook':
      return getEmailOutlookService(userId, email);
    case 'custom':
      return getEmailCustomService(userId, email);
    default:
      throw new Error(`Unsupported email provider: ${provider}`);
  }
};

export default {
  getEmailGoogleService,
  getEmailOutlookService,
  getEmailCustomService,
  getEmailService
};