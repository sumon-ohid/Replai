import { google } from 'googleapis';
import * as msal from '@azure/msal-node';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import authConfig from '../config/authConfig.js';

/**
 * Middleware to verify user authentication for email routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to verify and refresh Google OAuth tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const verifyGoogleAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { email } = req.params || req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email address required' });
    }
    
    // Find this email in user's connected emails
    const connectedEmail = req.user.connectedEmails.find(
      e => e.email === email && e.provider === 'google'
    );
    
    if (!connectedEmail) {
      return res.status(403).json({ 
        error: 'This Google email is not connected to your account' 
      });
    }
    
    // Get tokens from user record
    const { accessToken, refreshToken, expiryDate } = connectedEmail.tokens || {};
    if (!accessToken || !refreshToken) {
      return res.status(403).json({ error: 'No valid tokens found, please reconnect this email' });
    }
    
    // Initialize OAuth client
    const oauth2Client = new google.auth.OAuth2(
      authConfig.google.clientId,
      authConfig.google.clientSecret,
      authConfig.google.redirectUri
    );
    
    // Check if token is expired and needs refresh
    const isExpired = expiryDate && new Date() > new Date(expiryDate);
    
    if (isExpired) {
      // Set refresh token and refresh
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      
      // Get new tokens
      const { tokens } = await oauth2Client.refreshAccessToken();
      
      // Update tokens in database
      await User.updateOne(
        { 
          _id: req.user._id,
          'connectedEmails.email': email 
        },
        {
          $set: {
            'connectedEmails.$.tokens.accessToken': tokens.access_token,
            'connectedEmails.$.tokens.refreshToken': tokens.refresh_token || refreshToken,
            'connectedEmails.$.tokens.expiryDate': new Date(Date.now() + tokens.expires_in * 1000)
          }
        }
      );
      
      // Set credentials with new tokens
      oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || refreshToken,
        expiry_date: Date.now() + tokens.expires_in * 1000
      });
    } else {
      // Set credentials with existing tokens
      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: expiryDate
      });
    }
    
    // Attach the oauth client to the request
    req.googleAuth = oauth2Client;
    req.targetEmail = email;
    next();
  } catch (error) {
    console.error('Google auth verification error:', error);
    return res.status(401).json({ error: 'Failed to authenticate with Google' });
  }
};

/**
 * Middleware to verify and refresh Microsoft Outlook/Microsoft365 OAuth tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const verifyOutlookAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { email } = req.params || req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email address required' });
    }
    
    // Find this email in user's connected emails
    const connectedEmail = req.user.connectedEmails.find(
      e => e.email === email && e.provider === 'outlook'
    );
    
    if (!connectedEmail) {
      return res.status(403).json({ 
        error: 'This Outlook email is not connected to your account' 
      });
    }
    
    // Get tokens from user record
    const { accessToken, refreshToken, expiryDate } = connectedEmail.tokens || {};
    if (!accessToken || !refreshToken) {
      return res.status(403).json({ error: 'No valid tokens found, please reconnect this email' });
    }
    
    // Check if token is expired and needs refresh
    const isExpired = expiryDate && new Date() > new Date(expiryDate);
    
    if (isExpired) {
      // Initialize MSAL client
      const msalConfig = {
        auth: {
          clientId: authConfig.outlook.clientId,
          clientSecret: authConfig.outlook.clientSecret,
          authority: authConfig.outlook.authority
        }
      };
      
      const cca = new msal.ConfidentialClientApplication(msalConfig);
      
      // Refresh the token
      const result = await cca.acquireTokenByRefreshToken({
        refreshToken,
        scopes: authConfig.outlook.scopes
      });
      
      if (!result || !result.accessToken) {
        return res.status(401).json({ error: 'Failed to refresh Microsoft token' });
      }
      
      // Update tokens in database
      await User.updateOne(
        { 
          _id: req.user._id,
          'connectedEmails.email': email 
        },
        {
          $set: {
            'connectedEmails.$.tokens.accessToken': result.accessToken,
            'connectedEmails.$.tokens.refreshToken': result.refreshToken || refreshToken,
            'connectedEmails.$.tokens.expiryDate': new Date(Date.now() + result.expiresIn * 1000)
          }
        }
      );
      
      // Attach token to request
      req.outlookAuth = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken || refreshToken
      };
    } else {
      // Use existing token
      req.outlookAuth = {
        accessToken,
        refreshToken
      };
    }
    
    req.targetEmail = email;
    next();
  } catch (error) {
    console.error('Outlook auth verification error:', error);
    return res.status(401).json({ error: 'Failed to authenticate with Microsoft' });
  }
};

/**
 * Middleware to verify custom email (IMAP/SMTP) account credentials
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const verifyCustomEmailAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { email } = req.params || req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email address required' });
    }
    
    // Find this email in user's connected emails
    const connectedEmail = req.user.connectedEmails.find(
      e => e.email === email && e.provider === 'custom'
    );
    
    if (!connectedEmail) {
      return res.status(403).json({ 
        error: 'This custom email is not connected to your account' 
      });
    }
    
    // Get credentials from user record
    const { credentials } = connectedEmail;
    if (!credentials || !credentials.passwordHash) {
      return res.status(403).json({ 
        error: 'No valid credentials found, please reconnect this email' 
      });
    }
    
    // Decrypt password
    const password = Buffer.from(credentials.passwordHash, 'base64').toString();
    
    // Create credentials object for the email service
    const emailCredentials = {
      email,
      password,
      imapHost: credentials.imapHost,
      imapPort: credentials.imapPort || 993,
      imapSecure: credentials.imapSecure !== false,
      smtpHost: credentials.smtpHost,
      smtpPort: credentials.smtpPort || 587,
      smtpSecure: credentials.smtpSecure || false
    };
    
    // Attach credentials to request
    req.customAuth = emailCredentials;
    req.targetEmail = email;
    next();
  } catch (error) {
    console.error('Custom email auth verification error:', error);
    return res.status(401).json({ error: 'Failed to authenticate custom email' });
  }
};

/**
 * Universal email auth middleware that detects provider and applies correct verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const verifyEmailAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { email } = req.params || req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email address required' });
    }
    
    // Find this email in user's connected emails
    const connectedEmail = req.user.connectedEmails.find(e => e.email === email);
    
    
    if (!connectedEmail) {
      return res.status(403).json({ error: 'This email is not connected to your account' });
    }
    
    // Route to appropriate auth middleware based on provider
    switch (connectedEmail.provider) {
      case 'google':
        return verifyGoogleAuth(req, res, next);
      case 'outlook':
        return verifyOutlookAuth(req, res, next);
      case 'custom':
        return verifyCustomEmailAuth(req, res, next);
      default:
        return res.status(400).json({ error: `Unsupported email provider: ${connectedEmail.provider}` });
    }
  } catch (error) {
    console.error('Email auth verification error:', error);
    return res.status(401).json({ error: 'Email authentication failed' });
  }
};

/**
 * Check if user has permission to access an email account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const checkEmailPermission = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { emailId } = req.params;
    
    // If there's no emailId parameter, skip this check
    if (!emailId) {
      return next();
    }
    
    // Find the email in the database
    const EmailModel = req.emailModel; // Should be set by a previous middleware
    if (!EmailModel) {
      return res.status(500).json({ error: 'Email model not available' });
    }
    
    const email = await EmailModel.findById(emailId);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    // Check if the email belongs to the authenticated user
    if (email.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You do not have permission to access this email' });
    }
    
    req.email = email;
    next();
  } catch (error) {
    console.error('Permission check error:', error);
    return res.status(500).json({ error: 'Failed to check permissions' });
  }
};

/**
 * Middleware to check if an account is in sync pause mode
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const checkSyncStatus = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { email } = req.params || req.body || {};
    
    // If this is a request that should proceed even if sync is paused
    if (req.skipSyncCheck) {
      return next();
    }
    
    // Check user's email settings
    const emailSettings = req.user.emailSettings || {};
    const isPaused = emailSettings.syncPaused === true;
    
    if (isPaused) {
      return res.status(409).json({ 
        error: 'Email synchronization is currently paused',
        status: 'paused'
      });
    }
    
    // Check if specific email has sync paused
    if (email) {
      const connectedEmail = req.user.connectedEmails.find(e => e.email === email);
      if (connectedEmail && connectedEmail.syncPaused === true) {
        return res.status(409).json({ 
          error: `Synchronization for ${email} is currently paused`,
          status: 'paused'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Sync status check error:', error);
    return res.status(500).json({ error: 'Failed to check sync status' });
  }
};

export default {
  requireAuth,
  verifyGoogleAuth,
  verifyOutlookAuth,
  verifyCustomEmailAuth,
  verifyEmailAuth,
  checkEmailPermission,
  checkSyncStatus
};