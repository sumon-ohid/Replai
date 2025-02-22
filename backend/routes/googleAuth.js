import express from 'express';
import { google } from 'googleapis';
import User from '../models/User.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const router = express.Router();
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  `${process.env.VITE_API_BASE_URL}/api/auth/google/callback`
);

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
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
  if (!code) return res.status(400).send('Missing code parameter');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const googleUser = await oauth2.userinfo.get();
    const { id, email, name, picture } = googleUser.data;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ googleId: id, email, name, profilePicture: picture });
    } else {
      user.googleId = id;
      if (!user.name)
        user.name = name;
      if (!user.profilePicture)
        user.profilePicture = picture;
    }
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`${process.env.FRONTEND_URL}/signin?token=${token}`);
  } catch (error) {
    console.error('Error during Google authentication:', error);
    res.status(500).send('Authentication failed.');
  }
});

export default router;