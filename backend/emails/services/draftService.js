import getDraftModel from '../../models/Draft.js';
import { generateEmailResponse } from './emailProcessingService.js';
import { parseEmailAddress } from '../utils/emailParser.js';

/**
 * Create a draft response to an email
 */
export const createDraft = async (userId, emailData, responseText = null) => {
  try {
    const Draft = getDraftModel(userId);
    
    // Extract email details
    const { 
      from, to, subject, body, 
      messageId, threadId 
    } = emailData;
    
    // Generate response if not provided
    const draftResponseText = responseText || 
      await generateEmailResponse(userId, from.email, subject, body.text);
    
    // Create new draft
    const draft = new Draft({
      userId,
      status: 'draft',
      subject: `Re: ${subject}`,
      body: {
        text: draftResponseText,
        html: `<p>${draftResponseText.replace(/\n/g, '<br>')}</p>`
      },
      to: [{
        name: from.name,
        email: from.email
      }],
      replyToEmailId: messageId,
      threadId,
      isAIGenerated: !responseText, // True if AI generated
      aiGenerationType: 'reply',
      source: 'ai-assisted',
      category: emailData.category || 'Uncategorized'
    });
    
    await draft.save();
    console.log(`Created draft reply to email from ${from.email}`);
    
    return draft;
  } catch (error) {
    console.error('Error creating draft:', error);
    return null;
  }
};

/**
 * List all drafts for a user
 */
export const listDrafts = async (userId, filters = {}) => {
  try {
    const Draft = getDraftModel(userId);
    
    // Build query from filters
    const query = { userId, status: 'draft', ...filters };
    
    // Get drafts, newest first
    const drafts = await Draft.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50);
    
    return drafts;
  } catch (error) {
    console.error('Error listing drafts:', error);
    return [];
  }
};

/**
 * Send a draft
 * This function will be implemented differently for each email provider
 */
export const sendDraft = async (userId, draftId, providerSpecificSend) => {
  try {
    const Draft = getDraftModel(userId);
    const draft = await Draft.findOne({ _id: draftId, userId });
    
    if (!draft) {
      throw new Error('Draft not found');
    }
    
    // Use the provider-specific function to send the draft
    const result = await providerSpecificSend(draft);
    
    // Update draft status
    draft.status = 'sent';
    draft.finalizedAt = new Date();
    await draft.save();
    
    return { success: true, draft, result };
  } catch (error) {
    console.error('Error sending draft:', error);
    return { success: false, error: error.message };
  }
};

export default {
  createDraft,
  listDrafts,
  sendDraft
};