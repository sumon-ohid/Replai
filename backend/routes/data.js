import express from 'express';
import auth from '../middleware/auth.js';
import TextData from '../models/TextData.js';
import User from '../models/User.js';
import fs from 'fs';
import dotenv from 'dotenv';
import multer from 'multer';
import { promisify } from 'util';
import pdf from 'pdf-parse';

dotenv.config();

const router = express.Router();

const upload = multer({ dest: 'uploads/files' });

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

// Upload file
router.post('/upload-file', auth, upload.single('file'), async (req, res) => {
  const userId = req.user._id;
  const filePath = req.file.path;

  // if no file uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'File must be provided' });
  }

  // if not pdf file
  if (req.file.mimetype !== 'application/pdf') {
    return res.status(400).json({ message: 'File must be a PDF' });
  }

  // if size is greater than 4MB
  if (req.file.size > 4 * 1024 * 1024) {
    return res.status(400).json({ message: 'File must be smaller than 4MB' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use pdf-parse to extract text from PDF
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const text = data.text;

    // console.log('Text extracted from PDF:', text);

    const newFileData = new TextData({
      userId,
      fileData: text,
    });
    
    await newFileData.save();

    // Delete the file after reading its content
    fs.unlinkSync(filePath);

    res.status(201).json({ message: 'File uploaded and data saved successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

export default router;
