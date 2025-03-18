import express from 'express';
import { requireAuth } from '../middleware/emailAuthMiddleware.js';
import authConfig from '../config/authConfig.js';
import { google } from 'googleapis';
import * as msal from '@azure/msal-node';
import User from '../../models/User.js';
import googleEmailService from '../services/googleEmailService.js';
import outlookEmailService from '../services/outlookEmailService.js';
import customEmailService from '../services/customEmailService.js';
import connectionManager, { setupGoogleEmailSync } from '../managers/connectionManager.js';
import dotenv from 'dotenv';

dotenv.config();
const dashboardUrl = process.env.DASHBOARD_URL;

const router = express.Router();

/**
 * Google OAuth routes
 */
// Start Google OAuth flow
router.get('/google', requireAuth, (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      authConfig.google.clientId,
      authConfig.google.clientSecret,
      authConfig.google.redirectUri
    );

    // Create state parameter with userId and timestamp
    const state = Buffer.from(JSON.stringify({
      userId: req.user._id.toString(),
      timestamp: Date.now()
    })).toString('base64');
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: authConfig.google.scopes,
      prompt: 'consent', // Always ask for consent to ensure refresh token
      state: state,
    });
    
    // Store user ID in session for the callback
    req.session.userId = req.user._id;
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error starting Google auth:', error);
    res.status(500).json({ error: 'Failed to start Google authentication' });
  }
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  let userId = req.session.userId;

  if (state) {
    try {
      const parsedState = JSON.parse(Buffer.from(state, 'base64').toString());
      userId = parsedState.userId;
      
      // Optional: Check if the timestamp is recent (preventing replay attacks)
      const timestamp = parsedState.timestamp;
      if (Date.now() - timestamp > 10 * 60 * 1000) { // 10 minutes
        console.warn('State parameter expired');
      }
    } catch (error) {
      console.error('Error parsing state:', error);
    }
  }
  
  console.log('Google callback:', code, userId);

  if (!code || !userId) {
    return res.redirect(`${dashboardUrl}?error=missing_params`);
  }

  console.log('✈ Google callback:', dashboardUrl);

  try {
    // Create OAuth client first - THIS WAS MISSING
    const oauth2Client = new google.auth.OAuth2(
      authConfig.google.clientId,
      authConfig.google.clientSecret,
      authConfig.google.redirectUri
    );
    
    // Get tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Log tokens for debugging
    console.log('Tokens received from Google:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in
    });

    // Check if refresh token is missing
  if (!tokens.refresh_token) {
    console.warn('No refresh token returned by Google. User may need to revoke access and reconnect.');
    
    // Option 1: Redirect to an error page instructing the user to disconnect from Google first
    return res.redirect(`${dashboardUrl}?error=no_refresh_token&message=${encodeURIComponent('Please disconnect your Google account from Google security settings and try again.')}`);
  }
    
    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const googleUser = await oauth2.userinfo.get();
    const googleUserEmail = googleUser.data.email;
    
    // Update user record with connected email
    await User.findByIdAndUpdate(userId, {
      $pull: { connectedEmails: { email: googleUserEmail } } // Remove if exists
    });
    
    // Make sure to properly save the tokens
    await User.findByIdAndUpdate(userId, {
      $push: { 
        connectedEmails: { 
          email: googleUserEmail,
          provider: 'google',
          tokens: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: new Date(Date.now() + tokens.expires_in * 1000)
          },
          connected: true,
          connectedAt: new Date()
        } 
      }
    });
    
    // Setup email sync for this account - directly call the Google service
    try {
      await googleEmailService.initializeGoogleConnection(
        userId,
        googleUserEmail,
        tokens.refresh_token,
        tokens.access_token,
        {
          syncEnabled: true,
          mode: 'auto-reply',
          markAsRead: true
        }
      );
      console.log(`Google email successfully connected for ${googleUserEmail}`);
    } catch (syncError) {
      console.error(`Failed to set up email sync for ${googleUserEmail}:`, syncError);
    }

    // save connected email in user database
    

    // Send a success message back to the dashboard and close the window
    res.redirect(`${dashboardUrl}?success=true`);
  } catch (error) {
    console.error('Error in Google callback:', error);
    res.redirect(`${dashboardUrl}?error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }
});

/**
 * Outlook OAuth routes
 */
// Start Outlook OAuth flow
router.get('/outlook', requireAuth, (req, res) => {
  try {
    // Create MSAL application
    const msalConfig = {
      auth: {
        clientId: authConfig.outlook.clientId,
        authority: authConfig.outlook.authority,
        clientSecret: authConfig.outlook.clientSecret
      }
    };
    
    const msalClient = new msal.ConfidentialClientApplication(msalConfig);
    
    // Generate auth URL
    const authUrlParameters = {
      scopes: authConfig.outlook.scopes,
      redirectUri: authConfig.outlook.redirectUri,
      prompt: 'consent'
    };
    
    const authUrl = msalClient.getAuthCodeUrl(authUrlParameters);
    
    // Store user ID in session for the callback
    req.session.userId = req.user._id;
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error starting Outlook auth:', error);
    res.status(500).json({ error: 'Failed to start Outlook authentication' });
  }
});

// Outlook OAuth callback
router.get('/outlook/callback', async (req, res) => {
  const { code } = req.query;
  const userId = req.session.userId;
  
  if (!code || !userId) {
    return res.redirect(`${dashboardUrl}?error=missing_params`);
  }
  
  try {
    const msalConfig = {
      auth: {
        clientId: authConfig.outlook.clientId,
        authority: authConfig.outlook.authority,
        clientSecret: authConfig.outlook.clientSecret
      }
    };
    
    const msalClient = new msal.ConfidentialClientApplication(msalConfig);
    
    // Exchange code for tokens
    const tokenResponse = await msalClient.acquireTokenByCode({
      code,
      scopes: authConfig.outlook.scopes,
      redirectUri: authConfig.outlook.redirectUri
    });
    
    if (!tokenResponse || !tokenResponse.accessToken) {
      throw new Error('Failed to get access token');
    }
    
    // Get user info from Microsoft Graph
    const msGraph = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenResponse.accessToken}` }
    });
    
    if (!msGraph.ok) {
      throw new Error('Failed to get user info from Microsoft Graph');
    }
    
    const graphData = await msGraph.json();
    const outlookUserEmail = graphData.mail || graphData.userPrincipalName;
    
    if (!outlookUserEmail) {
      throw new Error('Could not retrieve email from Microsoft account');
    }
    
    // Update user record with connected email
    await User.findByIdAndUpdate(userId, {
      $pull: { connectedEmails: { email: outlookUserEmail } } // Remove if exists
    });
    
    await User.findByIdAndUpdate(userId, {
      $push: { 
        connectedEmails: { 
          email: outlookUserEmail,
          provider: 'outlook',
          tokens: {
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
            expiryDate: new Date(Date.now() + tokenResponse.expiresIn * 1000)
          },
          connected: true,
          connectedAt: new Date()
        } 
      }
    });
    
    // Setup email sync for this account
    await connectionManager.setupOutlookEmailSync(userId, outlookUserEmail, tokenResponse);
    
    // Redirect back to dashboard
    res.redirect(`${dashboardUrl}?success=true`);
  } catch (error) {
    console.error('Error in Outlook callback:', error);
    res.redirect(`${dashboardUrl}?error=auth_failed`);
  }
});

/**
 * Custom email (IMAP/SMTP) routes
 */
// Connect custom email account
router.post('/custom', requireAuth, async (req, res) => {
  try {
    const {
      email,
      password,
      imapHost,
      imapPort,
      imapSecure,
      smtpHost,
      smtpPort,
      smtpSecure,
      displayName
    } = req.body;
    
    // Validate required fields
    if (!email || !password || !imapHost || !smtpHost) {
      return res.status(400).json({ error: 'Missing required email configuration' });
    }
    
    // Create connection config
    const config = {
      email,
      password,
      imapHost,
      imapPort: imapPort || 993,
      imapSecure: imapSecure !== false,
      smtpHost,
      smtpPort: smtpPort || 587,
      smtpSecure: smtpSecure || false
    };
    
    // Test and save connection
    const result = await customEmailService.connectCustomEmail(config, req.user._id);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    // Setup email sync
    await connectionManager.setupCustomEmailSync(req.user._id, email, config);
    
    res.json({ success: true, message: 'Custom email connected successfully' });
  } catch (error) {
    console.error('Error connecting custom email:', error);
    res.status(500).json({ error: 'Failed to connect custom email account' });
  }
});

/**
 * Common email operations
 */
// Disconnect any email account
router.post('/disconnect', requireAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user._id;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find the email in user's connected accounts
    const user = await User.findById(userId);
    const connectedEmail = user.connectedEmails.find(e => e.email === email);
    
    if (!connectedEmail) {
      return res.status(404).json({ message: 'Email not found in connected accounts' });
    }
    
    // Disconnect based on provider
    const provider = connectedEmail.provider;
    let result;
    
    switch (provider) {
      case 'google':
        result = await connectionManager.disconnectGoogleEmail(userId, email);
        break;
      case 'outlook':
        result = await connectionManager.disconnectOutlookEmail(userId, email);
        break;
      case 'custom':
        result = await connectionManager.disconnectCustomEmail(userId, email);
        break;
      default:
        return res.status(400).json({ message: `Unsupported provider: ${provider}` });
    }
    
    if (result.success) {
      res.json({ message: 'Email disconnected successfully' });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error disconnecting email:', error);
    res.status(500).json({ message: 'Failed to disconnect email' });
  }
});

// List all connected emails
// router.get('/connected', requireAuth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
    
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
    
//     // Map to safe version without tokens
//     const connectedEmails = user.connectedEmails.map(email => ({
//       email: email.email,
//       provider: email.provider,
//       connected: email.connected,
//       connectedAt: email.connectedAt,
//       syncPaused: email.syncPaused || false,
//       displayName: email.displayName || email.email
//     }));
    
//     res.json({ connectedEmails });
//   } catch (error) {
//     console.error('Error fetching connected emails:', error);
//     res.status(500).json({ error: 'Failed to fetch connected emails' });
//   }
// });

export default router;