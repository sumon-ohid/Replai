import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// Endpoint to get user details
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('name email profilePicture');

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).send('Error fetching user details');
  }
});

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/profile-pictures');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Endpoint to update profile picture
router.patch('/me/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send();
    }

    user.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    await user.save();
    // console.log('Profile picture updated:', user.profilePicture);
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Endpoint to get user profile picture
router.get('/me/profile-picture', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('profilePicture');

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json({ profilePicture: user.profilePicture });
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    res.status(500).send('Error fetching profile picture');
  }
});

export default router;
