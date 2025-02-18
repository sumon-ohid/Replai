import express from 'express';
import BlockList from '../models/BlockList.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const defaultBlockList = [
  'google.com',
  'microsoft.com',
  'amazon.com',
  'facebook.com',
  'apple.com',
  'netflix.com',
  'twitter.com',
  'linkedin.com',
  'instagram.com',
  'youtube.com',
];

// Endpoint to get the block list
router.get('/', auth, async (req, res) => {
  try {
    let blockList = await BlockList.findOne({ userId: req.user._id });
    if (!blockList) {
      blockList = new BlockList({ userId: req.user._id, entries: defaultBlockList });
      await blockList.save();
    }
    res.json(blockList.entries);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to add a new entry to the block list
router.post('/', auth, async (req, res) => {
  const { entry } = req.body;
  if (!entry) {
    return res.status(400).json({ error: 'Entry cannot be empty' });
  }

  try {
    let blockList = await BlockList.findOne({ userId: req.user._id });
    if (!blockList) {
      blockList = new BlockList({ userId: req.user._id, entries: defaultBlockList });
    }

    if (blockList.entries.includes(entry)) {
      return res.status(400).json({ error: 'Entry already exists' });
    }

    blockList.entries.push(entry);
    await blockList.save();
    res.status(201).json({ message: 'Entry added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to delete an entry from the block list
router.delete('/', auth, async (req, res) => {
  const { entry } = req.body;
  if (!entry) {
    return res.status(400).json({ error: 'Entry cannot be empty' });
  }

  try {
    const blockList = await BlockList.findOne({ userId: req.user._id });
    if (!blockList) {
      return res.status(404).json({ error: 'Block list not found' });
    }

    blockList.entries = blockList.entries.filter((item) => item !== entry);
    await blockList.save();
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
