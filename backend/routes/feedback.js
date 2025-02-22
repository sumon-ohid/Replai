import express from 'express';
import auth from '../middleware/auth.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';

const router = express.Router();

// Submit feedback
router.post('/submit', auth, async (req, res) => {
  const { rating, comments } = req.body;
  const userId = req.user._id;

  if (!rating) {
    return res.status(400).json({ message: 'Rating is required' });
  }
  if (!comments) {
    return res.status(400).json({ message: 'Comments are required' });
  }

  try {
    const user = await User.findById(userId);
    const feedback = new Feedback({
      userId,
      name: user.name,
      email: user.email,
      rating,
      comments,
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});

// Get all feedback
router.get('/all', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('userId', 'name profilePicture');
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback' });
  }
});

// Comment on feedback
router.post('/comment/:id', auth, async (req, res) => {
  const { comment } = req.body;
  const userId = req.user._id;
  const feedbackId = req.params.id;

  try {
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.feedbackComments.push({ userId, comment });
    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error commenting on feedback:', error);
    res.status(500).json({ message: 'Error commenting on feedback' });
  }
});

// Like feedback
router.post('/like/:id', auth, async (req, res) => {
  const userId = req.user._id;
  const feedbackId = req.params.id;

  try {
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.likes.includes(userId)) {
      feedback.likes.pull(userId);
    } else {
      feedback.likes.push(userId);
    }

    await feedback.save();
    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error liking feedback:', error);
    res.status(500).json({ message: 'Error liking feedback' });
  }
});

export default router;