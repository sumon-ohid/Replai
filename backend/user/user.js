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

export default router;
