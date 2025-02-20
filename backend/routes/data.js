import express from 'express';
import auth from '../middleware/auth.js';
import TextData from '../models/TextData.js'; // Assuming you have a TextData model

const router = express.Router();

// Endpoint to save text data
router.post('/save-text', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    if (!text) return res.status(400).send('Text is required');
    if (!userId) return res.status(400).send('User ID is required');
    if (typeof text !== 'string') return res.status(400).send('Text must be a string');
    if (text.length > 1000) return res.status(400).send('Text is too long (max 1000 characters)');

    // Remove existing text data for the user
    await TextData.deleteMany({ userId });
    
    const newTextData = new TextData({
      userId,
      text,
    });

    await newTextData.save();
    res.status(201).send(newTextData);
  } catch (error) {
    console.error('Error saving text data:', error);
    res.status(500).send('Error saving text data');
  }
});

// Endpoint to get text data
router.get('/get-text', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) return res.status(400).send('User ID is required');

    const textData = await TextData.findOne({ userId });
    res.send(textData);
  } catch (error) {
    console.error('Error getting text data:', error);
    res.status(500).send('Error getting text data');
  }
});

export default router;