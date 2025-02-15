import express from 'express';
import SentEmail from '../models/SentEmail.js';

const router = express.Router();

// Function to extract email address from a string
const extractEmail = (str) => {
  const match = str.match(/<([^>]+)>/);
  return match ? match[1] : str;
};

// Endpoint to get sent emails
router.get('/get-emails', async (req, res) => {
  try {
    const emails = await SentEmail.find({}, 'subject from to dateSent body').sort({ dateSent: -1 });

    const formattedEmails = emails.map(email => ({
      subject: email.subject.substring(0, 15) + '...', // Get first 15 chars from subject
      sender: extractEmail(email.from),
      receiver: extractEmail(email.to),
      timeSent: email.dateSent,
      bodyPreview: email.body.substring(0, 100) + '...', // Get first 100 chars from body
    }));

    res.json(formattedEmails);
  } catch (error) {
    console.error('Error fetching sent emails:', error);
    res.status(500).send('Error fetching sent emails');
  }
});

export default router;