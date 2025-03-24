import express from 'express';
import { google } from 'googleapis';
import User from '../models/User.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const router = express.Router();
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.VITE_API_BASE_URL}/api/auth/google/callback`
);

// Reduced scope - only what's needed for authentication
const AUTH_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

router.get('/login/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: AUTH_SCOPES,
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
      // New user signup
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
      
      // Set account creation metadata
      user.createdAt = new Date();
      user.authMethod = 'google';
      
      // Log signup
      console.log(`New user signup via Google: ${email}`);
    } else {
      // Existing user login
      user.googleId = id;
      if (!user.name) user.name = name;
      if (!user.profilePicture) user.profilePicture = picture;
      
      // Update auth tokens
      user.googleAuth = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        email: email,
        name: name
      };
      
      // Update last login timestamp
      user.lastLogin = new Date();
      
      // Log login
      console.log(`User logged in via Google: ${email}`);
    }
    
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/signin?token=${token}`);
  } catch (error) {
    console.error('Error during Google authentication:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('API response error:', error.response.data);
    }
    
    // Redirect to frontend with error message
    res.redirect(`${process.env.FRONTEND_URL}/signin?error=auth_failed`);
  }
});

export default router;