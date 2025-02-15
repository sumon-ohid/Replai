import express from 'express';
import getSentEmailModel from '../models/SentEmail.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Function to extract email address from a string
const extractEmail = (str) => {
  const match = str.match(/<([^>]+)>/);
  return match ? match[1] : str;
};

// Endpoint to get sent emails
router.get('/get-emails', auth, async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have user ID in req.user
    if (!userId) {
      console.error('User ID not found in request');
      return res.status(400).send('User ID not found in request');
    }
    const SentEmail = getSentEmailModel(userId);

    const emails = await SentEmail.find({}, 'subject from to dateSent body').sort({ dateSent: -1 });

    const formattedEmails = emails.map(email => ({
      subject: email.subject,
      sender: extractEmail(email.from),
      receiver: extractEmail(email.to),
      timeSent: email.dateSent,
      bodyPreview: email.body,
    }));

    res.json(formattedEmails);
  } catch (error) {
    console.error('Error fetching sent emails:', error);
    res.status(500).send('Error fetching sent emails');
  }
});

export default router;