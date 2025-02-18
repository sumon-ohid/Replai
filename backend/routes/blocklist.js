import express from 'express';
const router = express.Router();

let blockList = [
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
router.get('/', (req, res) => {
  res.json(blockList);
});

// Endpoint to add a new entry to the block list
router.post('/', (req, res) => {
  const { entry } = req.body;
  if (!entry || blockList.includes(entry)) {
    return res.status(400).json({ error: 'Invalid or duplicate entry' });
  }
  blockList.push(entry);
  res.status(201).json({ message: 'Entry added successfully' });
});

// Endpoint to delete an entry from the block list
router.delete('/', (req, res) => {
  const { entry } = req.body;
  blockList = blockList.filter((item) => item !== entry);
  res.status(200).json({ message: 'Entry deleted successfully' });
});

export default router;
