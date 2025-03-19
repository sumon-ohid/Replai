import express from 'express';
import { requireAuth } from '../middleware/emailAuthMiddleware.js';
import authConfig from '../config/authConfig.js';
import { google } from 'googleapis';
import * as msal from '@azure/msal-node';
import User from '../../models/User.js';
import ConnectedEmail from '../../models/ConnectedEmail.js';
import getConnectedEmailModels, { validateEmailCollections } from '../../models/ConnectedEmailModels.js';
import { initializeGoogleConnection } from '../services/googleEmailService.js';
import outlookEmailService from '../services/outlookEmailService.js';
import customEmailService from '../services/customEmailService.js';
import connectionManager from '../managers/connectionManager.js';
import dotenv from 'dotenv';

dotenv.config();
const dashboardUrl = process.env.DASHBOARD_URL;

const router = express.Router();

/**
 * Set up email collections for a connected email
 */
async function setupEmailCollections(userId, email, connectedEmailId) {
  try {
    console.log(`Setting up email collections for ${email} (${connectedEmailId})`);

    // First validate/create collections
    await validateEmailCollections(connectedEmailId);

    // Initialize models
    const models = getConnectedEmailModels(connectedEmailId);

    // Verify collections by trying to access them
    await Promise.all([
      models.Email.findOne(),
      models.Draft.findOne(),
      models.Sent.findOne()
    ]);

    console.log(`Successfully set up collections for ${email}`);
    return true;
  } catch (error) {
    console.error(`Error setting up collections for ${email}:`, error);
    throw error;
  }
}

/**
 * Google OAuth routes
 */
router.get('/google', requireAuth, (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      authConfig.google.clientId,
      authConfig.google.clientSecret,
      authConfig.google.redirectUri
    );

    const state = Buffer.from(JSON.stringify({
      userId: req.user._id.toString(),
      timestamp: Date.now()
    })).toString('base64');
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: authConfig.google.scopes,
      prompt: 'consent',
      state: state,
    });
    
    req.session.userId = req.user._id;
    res.json({ authUrl });
  } catch (error) {
    console.error('Error starting Google auth:', error);
    res.status(500).json({ error: 'Failed to start Google authentication' });
  }
});

router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  let userId = req.session.userId;

  if (state) {
    try {
      const parsedState = JSON.parse(Buffer.from(state, 'base64').toString());
      userId = parsedState.userId;
      
      if (Date.now() - parsedState.timestamp > 10 * 60 * 1000) {
        console.warn('State parameter expired');
      }
    } catch (error) {
      console.error('Error parsing state:', error);
    }
  }

  if (!code || !userId) {
    return res.redirect(`${dashboardUrl}?error=missing_params`);
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      authConfig.google.clientId,
      authConfig.google.clientSecret,
      authConfig.google.redirectUri
    );
    
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    if (!tokens.refresh_token) {
      console.warn('No refresh token returned by Google');
      return res.redirect(`${dashboardUrl}?error=no_refresh_token&message=${encodeURIComponent('Please disconnect your Google account from Google security settings and try again.')}`);
    }
    
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const googleUser = await oauth2.userinfo.get();
    const { email: googleUserEmail, name: googleUserName } = googleUser.data;

    // Create/update ConnectedEmail record
    const connectedEmail = await ConnectedEmail.findOneAndUpdate(
      { userId, email: googleUserEmail },
      {
        userId,
        email: googleUserEmail,
        name: googleUserName || googleUserEmail.split('@')[0],
        provider: 'google',
        tokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiry: new Date(Date.now() + (tokens.expires_in || 3600) * 1000)
        },
        status: 'active'
      },
      { upsert: true, new: true }
    );

    // Set up collections before proceeding
    await setupEmailCollections(userId, googleUserEmail, connectedEmail._id);

    // Update user's connected emails array
    await User.findByIdAndUpdate(userId, {
      $pull: { connectedEmails: { email: googleUserEmail } }
    });

    await User.findByIdAndUpdate(userId, {
      $push: { 
        connectedEmails: {
          email: googleUserEmail,
          provider: 'google',
          name: googleUserName || googleUserEmail.split('@')[0],
          status: 'active'
        }
      }
    });
    
    // Initialize the Google connection in the background
    setTimeout(async () => {
      try {
        await initializeGoogleConnection(
          userId,
          googleUserEmail,
          tokens.refresh_token,
          tokens.access_token,
          { syncEnabled: true }
        );
        console.log(`Google email successfully connected for ${googleUserEmail}`);
      } catch (syncError) {
        console.error(`Failed to set up email sync for ${googleUserEmail}:`, syncError);
      }
    }, 100);

    res.redirect(`${dashboardUrl}?success=true`);
  } catch (error) {
    console.error('Error in Google callback:', error);
    res.redirect(`${dashboardUrl}?error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }
});

/**
 * Disconnect email route
 */
router.post('/disconnect', requireAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user._id;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Get connected email record
    const connectedEmail = await ConnectedEmail.findOne({ userId, email });
    if (!connectedEmail) {
      return res.status(404).json({ message: 'Connected email not found' });
    }
    
    // Stop active connection
    const provider = connectedEmail.provider;
    let disconnectResult;
    
    switch (provider) {
      case 'google':
        disconnectResult = await connectionManager.disconnectGoogleEmail(userId, email);
        break;
      case 'outlook':
        disconnectResult = await connectionManager.disconnectOutlookEmail(userId, email);
        break;
      case 'custom':
        disconnectResult = await connectionManager.disconnectCustomEmail(userId, email);
        break;
      default:
        return res.status(400).json({ message: `Unsupported provider: ${provider}` });
    }
    
    if (!disconnectResult.success) {
      return res.status(500).json({ error: disconnectResult.error });
    }
    
    // Drop email collections
    const emailModels = getConnectedEmailModels(connectedEmail._id.toString());
    await Promise.all([
      emailModels.Email.collection.drop().catch(() => {}),
      emailModels.Draft.collection.drop().catch(() => {}),
      emailModels.Sent.collection.drop().catch(() => {})
    ]);
    
    // Delete ConnectedEmail record
    await ConnectedEmail.deleteOne({ _id: connectedEmail._id });
    
    // Remove from user's connected emails
    await User.findByIdAndUpdate(userId, {
      $pull: { connectedEmails: { email } }
    });
    
    res.json({ 
      success: true, 
      message: `Email ${email} has been disconnected and all data removed` 
    });
  } catch (error) {
    console.error('Error disconnecting email:', error);
    res.status(500).json({ message: 'Failed to disconnect email' });
  }
});

/**
 * List connected emails
 */
router.get('/connected', requireAuth, async (req, res) => {
  try {
    console.log('Fetching connected emails for user:', req.user._id);
    
    const connectedEmails = await ConnectedEmail.find({
      userId: req.user._id
    }).select('-tokens -credentials');
    
    const mappedEmails = connectedEmails.map(email => {
      console.log(`Mapped email account: ${email.email} with ID: ${email._id}`);
      return {
        id: email._id,
        email: email.email,
        provider: email.provider,
        name: email.name,
        status: email.status,
        syncEnabled: email.syncConfig?.enabled ?? true,
        lastSync: email.stats?.lastSync,
        aiEnabled: email.aiSettings?.enabled ?? false
      };
    });

    console.log(`Returning ${mappedEmails.length} connected email(s)`, mappedEmails);
    res.json(mappedEmails);
  } catch (error) {
    console.error('Error fetching connected emails:', error);
    res.status(500).json({ error: 'Failed to fetch connected emails' });
  }
});

export default router;
