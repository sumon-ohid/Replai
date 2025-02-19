import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Endpoint to get user details
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('name email');

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).send('Error fetching user details');
  }
});


// Endpoint to update profile picture
router.patch('/me/profile-picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send();
    }

    user.profilePicture = req.body.profilePicture;
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

export default router;
