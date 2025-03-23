import express from 'express';
import { google } from 'googleapis';
import User from '../models/User.js';
import ConnectedEmail from '../models/ConnectedEmail.js';
import getConnectedEmailModels from '../models/ConnectedEmailModels.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const router = express.Router();
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.VITE_API_BASE_URL}/api/auth/google/callback`
);

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify'
];

router.get('/login/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  res.json({ authUrl });
});

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${process.env.FRONTEND_URL}/signin`);

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const googleUser = await oauth2.userinfo.get();
    const { id, email, name, picture } = googleUser.data;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ 
        googleId: id, 
        email, 
        name, 
        profilePicture: picture,
        googleAuth: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: tokens.expiry_date,
          email: email,
          name: name
        }
      });
    } else {
      user.googleId = id;
      if (!user.name) user.name = name;
      if (!user.profilePicture) user.profilePicture = picture;
      user.googleAuth = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        email: email,
        name: name
      };
    }
    await user.save();

    // Create or update connected email account for Gmail
    let connectedEmail = await ConnectedEmail.findOne({ userId: user._id, email });
    if (!connectedEmail) {
      connectedEmail = new ConnectedEmail({
        userId: user._id,
        email,
        provider: 'google',
        name: name || email.split('@')[0],
        tokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiry: new Date(tokens.expiry_date)
        },
        status: 'active',
        syncConfig: {
          enabled: true,
          folders: ['INBOX', 'SENT', 'DRAFTS'],
          interval: 60
        }
      });
      await connectedEmail.save();

      // Initialize email collections
      getConnectedEmailModels(connectedEmail._id.toString());

      // Add to user's connected emails array if not already present
      if (!user.connectedEmails.find(e => e.email === email)) {
        user.connectedEmails.push({
          email,
          provider: 'google',
          name: name || email.split('@')[0],
          type: 'primary',
          status: 'active'
        });
        await user.save();
      }
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`${process.env.FRONTEND_URL}/signin?token=${token}`);
  } catch (error) {
    console.error('Error during Google authentication:', error);
    res.status(500).send('Authentication failed.');
  }
});

export default router;
