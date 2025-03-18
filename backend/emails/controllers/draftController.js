import mongoose from 'mongoose';
import getDraftModel from '../../models/Draft.js';
import User from '../../models/User.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize AI service
const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Create a new draft email
 */
export const createDraft = async (req, res) => {
  try {
    const { to, cc, bcc, subject, body, replyToEmailId, threadId } = req.body;
    const userId = req.user._id;
    
    if (!to || !Array.isArray(to) || to.length === 0) {
      return res.status(400).json({ message: 'At least one recipient is required' });
    }
    
    const Draft = getDraftModel(userId);
    
    const draft = new Draft({
      userId,
      to,
      cc: cc || [],
      bcc: bcc || [],
      subject: subject || '',
      body: {
        text: body?.text || body || '',
        html: body?.html || ''
      },
      replyToEmailId,
      threadId,
      status: 'draft',
      createdAt: new Date()
    });
    
    const savedDraft = await draft.save();
    
    res.status(201).json(savedDraft);
  } catch (error) {
    console.error('Error creating draft:', error);
    res.status(500).json({ message: 'Failed to create draft' });
  }
};

/**
 * Get all drafts for a user
 */
export const getDrafts = async (req, res) => {
  try {
    const userId = req.user._id;
    const Draft = getDraftModel(userId);
    
    // Filter out sent or discarded drafts by default
    const status = req.query.status || 'draft';
    const filter = { userId };
    
    if (status !== 'all') {
      filter.status = status;
    }
    
    // Allow sorting and pagination
    const sort = req.query.sort || '-createdAt';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const drafts = await Draft.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Draft.countDocuments(filter);
    
    res.json({
      drafts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ message: 'Failed to fetch drafts' });
  }
};

/**
 * Get a single draft by ID
 */
export const getDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const Draft = getDraftModel(userId);
    
    const draft = await Draft.findOne({ _id: id, userId });
    
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    res.json(draft);
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({ message: 'Failed to fetch draft' });
  }
};

/**
 * Update a draft
 */
export const updateDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { to, cc, bcc, subject, body } = req.body;
    const userId = req.user._id;
    const Draft = getDraftModel(userId);
    
    const draft = await Draft.findOne({ _id: id, userId });
    
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    // Store the current version before updating
    const currentVersion = {
      timestamp: new Date(),
      subject: draft.subject,
      body: draft.body,
      modifiedBy: 'user'
    };
    
    if (!draft.versions) draft.versions = [];
    draft.versions.push(currentVersion);
    
    // Update draft fields
    if (to) draft.to = to;
    if (cc) draft.cc = cc;
    if (bcc) draft.bcc = bcc;
    if (subject) draft.subject = subject;
    if (body) {
      draft.body = {
        text: body.text || body,
        html: body.html || ''
      };
    }
    
    draft.editCount = (draft.editCount || 1) + 1;
    draft.updatedAt = new Date();
    
    const updatedDraft = await draft.save();
    
    res.json(updatedDraft);
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ message: 'Failed to update draft' });
  }
};

/**
 * Delete a draft
 */
export const deleteDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const Draft = getDraftModel(userId);
    
    const draft = await Draft.findOne({ _id: id, userId });
    
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    // Soft delete by changing status
    draft.status = 'discarded';
    draft.disposition = 'discarded';
    draft.finalizedAt = new Date();
    
    await draft.save();
    
    res.json({ message: 'Draft discarded successfully' });
  } catch (error) {
    console.error('Error discarding draft:', error);
    res.status(500).json({ message: 'Failed to discard draft' });
  }
};

/**
 * Generate draft using AI
 */
export const generateDraft = async (req, res) => {
  try {
    const { prompt, replyToEmailId, threadId } = req.body;
    const userId = req.user._id;
    
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }
    
    // Generate content with AI
    const aiRes = await model.generateContent(prompt);
    const generatedText = aiRes.response.text();
    
    if (!generatedText) {
      return res.status(500).json({ message: 'Failed to generate content' });
    }
    
    const Draft = getDraftModel(userId);
    
    // Create new draft with AI-generated content
    const draft = new Draft({
      userId,
      subject: req.body.subject || 'AI Generated Draft',
      body: {
        text: generatedText,
        html: ''
      },
      to: req.body.to || [],
      replyToEmailId,
      threadId,
      isAIGenerated: true,
      aiGenerationType: 'custom',
      aiPrompt: prompt,
      source: 'ai-assisted',
      createdAt: new Date()
    });
    
    const savedDraft = await draft.save();
    
    res.status(201).json(savedDraft);
  } catch (error) {
    console.error('Error generating draft:', error);
    res.status(500).json({ message: 'Failed to generate draft' });
  }
};

/**
 * Send a draft
 */
export const sendDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const Draft = getDraftModel(userId);
    
    const draft = await Draft.findOne({ _id: id, userId });
    
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    if (draft.status === 'sent') {
      return res.status(400).json({ message: 'Draft has already been sent' });
    }
    
    // Get email service based on draft metadata
    const { emailService } = req.body;
    
    if (!emailService) {
      return res.status(400).json({ message: 'Email service is required' });
    }
    
    // Prepare email data
    const emailData = {
      to: draft.to,
      cc: draft.cc,
      bcc: draft.bcc,
      subject: draft.subject,
      body: draft.body,
      replyToEmailId: draft.replyToEmailId,
      threadId: draft.threadId
    };
    
    // Send the email
    const sentResult = await emailService.sendEmail(emailData);
    
    if (!sentResult.success) {
      return res.status(500).json({ message: 'Failed to send email', error: sentResult.error });
    }
    
    // Update draft status
    draft.status = 'sent';
    draft.disposition = 'sent';
    draft.finalizedAt = new Date();
    draft.completionTime = draft.finalizedAt - draft.createdAt;
    draft.sentEmailId = sentResult.messageId;
    
    await draft.save();
    
    res.json({ message: 'Email sent successfully', sentEmail: sentResult.sentEmail });
  } catch (error) {
    console.error('Error sending draft:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
};

export default {
  createDraft,
  getDrafts,
  getDraft,
  updateDraft,
  deleteDraft,
  generateDraft,
  sendDraft
};