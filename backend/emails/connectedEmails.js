import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Endpoint to get connected email accounts
router.get('/connected', auth, async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have user ID in req.user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Assuming connected emails are stored in user.connectedEmails
    const connectedEmails = user.connectedEmails || [];
    res.json(connectedEmails);
  } catch (error) {
    console.error('Error fetching connected emails:', error);
    res.status(500).send('Error fetching connected emails');
  }
});

export default router;
