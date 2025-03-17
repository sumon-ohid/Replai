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

// Endpoint to delete a connected email account
router.delete('/connected/:email', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const email = req.params.email;

    await User.findByIdAndUpdate(userId, {
      $pull: { connectedEmails: { email } }
    });

    res.send('Email deleted successfully');
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).send('Error deleting email');
  }
});

// Endpoint to toggle auto-reply mode
router.patch('/connected/auto-reply/:email', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const email = req.params.email;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).send('The "enabled" field must be a boolean');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Find the email in the array
    const emailIndex = user.connectedEmails.findIndex(item => item.email === email);
    if (emailIndex === -1) {
      return res.status(404).send('Email not found in connected accounts');
    }

    // Update the autoReplyEnabled property
    user.connectedEmails[emailIndex].autoReplyEnabled = enabled;
    await user.save();

    res.json({
      success: true,
      autoReplyEnabled: enabled
    });
  } catch (error) {
    console.error('Error toggling auto-reply mode:', error);
    res.status(500).send('Error toggling auto-reply mode');
  }
});

// Endpoint to set email mode (draft or normal)
router.patch('/connected/mode/:email', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const email = req.params.email;
    const { mode } = req.body;

    if (!['draft', 'normal'].includes(mode)) {
      return res.status(400).send('Mode must be either "draft" or "normal"');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Find the email in the array
    const emailIndex = user.connectedEmails.findIndex(item => item.email === email);
    if (emailIndex === -1) {
      return res.status(404).send('Email not found in connected accounts');
    }

    // Update the mode property
    user.connectedEmails[emailIndex].mode = mode;
    await user.save();

    res.json({
      success: true,
      mode: mode
    });
  } catch (error) {
    console.error('Error setting email mode:', error);
    res.status(500).send('Error setting email mode');
  }
});

// Endpoint to toggle sync (pause/resume)
router.patch('/connected/sync/:email', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const email = req.params.email;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).send('The "enabled" field must be a boolean');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Find the email in the array
    const emailIndex = user.connectedEmails.findIndex(item => item.email === email);
    if (emailIndex === -1) {
      return res.status(404).send('Email not found in connected accounts');
    }

    // Update the syncEnabled property
    user.connectedEmails[emailIndex].syncEnabled = enabled;
    await user.save();

    res.json({
      success: true,
      syncEnabled: enabled
    });
  } catch (error) {
    console.error('Error toggling sync:', error);
    res.status(500).send('Error toggling sync');
  }
});

// Endpoint to refresh/sync an email account manually
router.post('/connected/refresh/:email', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const email = req.params.email;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Find the email in the array
    const emailIndex = user.connectedEmails.findIndex(item => item.email === email);
    if (emailIndex === -1) {
      return res.status(404).send('Email not found in connected accounts');
    }

    // Update the lastSync property
    user.connectedEmails[emailIndex].lastSync = new Date();
    await user.save();

    // Here you would typically trigger an actual sync operation
    // For example, calling a function from your email service

    res.json({
      success: true,
      message: 'Sync initiated',
      lastSync: user.connectedEmails[emailIndex].lastSync
    });
  } catch (error) {
    console.error('Error refreshing email account:', error);
    res.status(500).send('Error refreshing email account');
  }
});

export default router;