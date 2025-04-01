import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import usageController from '../usage/usageController.js';

const router = express.Router();

// Endpoint to get user details
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    // Add subscriptionPlan, subscriptionStartDate, and subscriptionEndDate to the selected fields
    const user = await User.findById(userId).select('name email profilePicture subscriptionPlan subscriptionStartDate subscriptionEndDate connectedEmailsCount');

    // if user picture contains http, then it is a google picture
    if (user.profilePicture) {
      user.profilePicture = user.profilePicture.includes('http') ? user.profilePicture : `${process.env.VITE_API_BASE_URL}${user.profilePicture}`;
    }

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


router.delete('/account/delete', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's other data here if necessary

    await User.deleteOne({ _id: req.user._id });
    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

router.get('/usage', auth, usageController.getUserUsageStats);

export default router;
