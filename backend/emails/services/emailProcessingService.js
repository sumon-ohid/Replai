import { GoogleGenerativeAI } from '@google/generative-ai';
import TextData from '../../models/TextData.js';
import User from '../../models/User.js';
import ConnectedEmail from '../../models/ConnectedEmail.js';
import BlockList from '../../models/BlockList.js';
import { parseEmailAddress } from '../utils/emailParser.js';
import ConnectionManager from '../managers/connectionManager.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize AI model
const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Process email content to extract useful information
 */
export const processEmailContent = async (emailData) => {
  try {
    // Ensure emailData has all required fields as strings
    const safeData = {
      ...emailData,
      subject: typeof emailData.subject === 'string' ? emailData.subject : String(emailData.subject || ''),
      body: typeof emailData.body === 'string' ? emailData.body : String(emailData.body?.text || emailData.body || '')
    };
    
    // Get sender information
    const sender = typeof safeData.from === 'object' && safeData.from !== null
      ? safeData.from
      : parseEmailAddress(String(safeData.from || ''));

    // Get connected email account
    const connectedEmail = await ConnectedEmail.findOne({ 
      userId: safeData.userId,
      email: safeData.userEmail || sender.email
    });

    if (!connectedEmail) {
      throw new Error('Connected email account not found');
    }
    
    // Extract any possible action items
    const actionItems = extractActionItems(safeData.body);
    
    // Determine if email requires a response
    const requiresResponse = determineIfResponseNeeded(safeData);
    
    // Get email category
    const category = determineCategory(safeData);
    
    // Determine priority
    const priority = calculatePriority(safeData, category, requiresResponse);

    // Analyze sentiment
    const sentiment = await analyzeEmailSentiment(safeData.body);
    
    // Return processed data
    return {
      ...safeData,
      category,
      confidence: 0.8, // Default confidence
      keywords: extractKeywords(safeData),
      actionItems: Array.isArray(actionItems) ? actionItems : [],
      requiresResponse: !!requiresResponse,
      priority,
      sentiment,
      processed: true,
      processedAt: new Date()
    };
  } catch (error) {
    console.error('Error processing email content:', error);
    
    // On error, still return data with basic safe values
    return {
      ...emailData,
      category: 'uncategorized',
      processed: true,
      processedAt: new Date(),
      processingError: error.message
    };
  }
};

/**
 * Extract keywords from email content
 */
function extractKeywords(emailData) {
  const text = `${emailData.subject} ${emailData.body}`.toLowerCase();
  const words = text.split(/\W+/);
  const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
  
  return Array.from(new Set(
    words.filter(word => 
      word.length > 2 && 
      !commonWords.has(word)
    )
  )).slice(0, 5);
}

/**
 * Determine email category based on content and metadata
 * Valid categories: ['inbox', 'sent', 'draft', 'trash', 'spam', 'important', 'uncategorized']
 */
function determineCategory(emailData) {
  const text = `${emailData.subject} ${emailData.body}`.toLowerCase();
  
  // Check for specific patterns
  if (/(urgent|asap|attention|priority)/i.test(text)) return 'important';
  
  // Default to inbox for other cases
  return 'inbox';
}

/**
 * Extract possible action items from email body
 */
export const extractActionItems = (body) => {
  if (!body || typeof body !== 'string') return [];
  
  const actionItems = [];
  const actionKeywords = [
    'please', 'kindly', 'could you', 'can you', 'need to', 'action required',
    'let me know', 'confirm', 'review', 'approve', 'send', 'provide', 'update'
  ];
  
  const sentences = body.split(/[.?!]\s+/);
  
  for (const sentence of sentences) {
    if (actionKeywords.some(keyword => 
      sentence.toLowerCase().includes(keyword.toLowerCase()))) {
      const cleanSentence = sentence.trim()
        .replace(/^(>|\s)+/, '')
        .replace(/\s+/g, ' ');
      
      if (cleanSentence.length > 5 && cleanSentence.length < 200) {
        actionItems.push(cleanSentence);
      }
    }
  }
  
  return actionItems.slice(0, 3);
};

/**
 * Determine if an email requires a response
 */
export const determineIfResponseNeeded = (email) => {
  if (!email) return false;
  
  // Categories that generally don't need responses
  const noResponseCategories = ['promotions', 'newsletter', 'updates', 'social'];
  
  if (noResponseCategories.includes(determineCategory(email))) {
    return false;
  }
  
  // Check for question marks
  if (email.subject?.includes('?') || email.body?.includes('?')) {
    return true;
  }
  
  // Check for common phrases that indicate a response is expected
  const responsePatterns = [
    'please let me know', 'looking forward to', 'your response', 'get back to me',
    'what do you think', 'confirm receipt', 'thoughts on', 'please respond',
    'can you help', 'would you be able', 'get your input', 'need your feedback'
  ];
  
  const text = `${email.subject} ${email.body}`.toLowerCase();
  return responsePatterns.some(pattern => text.includes(pattern));
};

/**
 * Calculate email priority
 * Valid priorities: ['low', 'medium', 'high', 'urgent']
 */
export const calculatePriority = (email, category, requiresResponse) => {
  let priority = 'medium';
  const text = `${email.subject} ${email.body}`.toLowerCase();
  
  // Check for urgent keywords
  const urgentKeywords = ['urgent', 'asap', 'emergency', 'critical'];
  if (urgentKeywords.some(kw => text.includes(kw))) {
    return 'urgent';
  }
  
  // Check for high priority keywords
  const highPriorityKeywords = ['important', 'attention', 'priority'];
  if (highPriorityKeywords.some(kw => text.includes(kw))) {
    return 'high';
  }
  
  // Adjust based on category and response requirement
  if (category === 'important' || requiresResponse) {
    priority = 'high';
  } else if (category === 'uncategorized') {
    priority = 'low';
  }
  
  return priority;
};

/**
 * Analyze email sentiment
 */
async function analyzeEmailSentiment(text) {
  try {
    // Simple rule-based sentiment analysis
    const positiveWords = ['thank', 'thanks', 'appreciate', 'good', 'great', 'excellent'];
    const negativeWords = ['issue', 'problem', 'error', 'wrong', 'bad', 'sorry'];
    
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      const matches = lowerText.match(new RegExp(word, 'g'));
      if (matches) positiveCount += matches.length;
    });
    
    negativeWords.forEach(word => {
      const matches = lowerText.match(new RegExp(word, 'g'));
      if (matches) negativeCount += matches.length;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return 'neutral';
  }
}

/**
 * Check if email should be processed or blocked
 */
export const shouldProcessEmail = async (userId, fromEmail, fromDomain) => {
  try {
    const blockList = await BlockList.findOne({ userId });
    
    if (blockList) {
      const blockedEmails = blockList.entries.map(entry => entry.toLowerCase());
      
      if (
        blockedEmails.includes(fromEmail.toLowerCase()) ||
        (fromDomain && blockedEmails.some(blocked => 
          fromDomain === blocked || fromDomain.endsWith(`.${blocked}`)
        ))
      ) {
        console.log(`Email from ${fromEmail} is blocked`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking block list:', error);
    return true;
  }
};

/**
 * Generate AI response to an email
 */
export const generateEmailResponse = async (userId, fromEmail, subject, body) => {
  try {
    const user = await User.findById(userId);
    const userName = user?.name || '';
    
    let userPrompt = await TextData.findOne({ userId });
    const promptText = userPrompt 
      ? (userPrompt.text + (userPrompt.fileData || '')) 
      : '';
    
    const defaultPrompt = `Respond to this email briefly and naturally as a real person:
From: ${fromEmail}
Subject: ${subject}
Body: ${body}

Guidelines:
- Keep response short and simple
- Use casual language
- Sign with "Best regards, ${userName}"
- Avoid markdown formatting`;
    
    const prompt = promptText || defaultPrompt;
    
    const aiRes = await model.generateContent(prompt);
    return aiRes.response.text();
  } catch (error) {
    console.error('Error generating email response:', error);
    return `Sorry, I couldn't generate a response at this time.\n\nBest regards,\n${userName}`;
  }
};

/**
 * Process new emails
 * @param {string} userId - User ID
 * @param {string} email - Email address
 * @returns {Promise<Array>} Array of processed emails
 */
export const processEmails = async (userId, email) => {
  try {
    const connectedEmail = await ConnectedEmail.findOne({ userId, email });
    if (!connectedEmail) {
      throw new Error('Connected email account not found');
    }

    // Get new emails from the email service
    const emailService = await ConnectionManager.getEmailService(connectedEmail.provider);
    const newEmails = await emailService.getNewEmails(userId, email);

    // Process each email
    const processedEmails = await Promise.all(
      newEmails.map(async (newEmail) => {
        return await processEmailContent({
          ...newEmail,
          userId,
          userEmail: email
        });
      })
    );

    return processedEmails;
  } catch (error) {
    console.error('Error processing emails:', error);
    return [];
  }
};

export default {
  processEmailContent,
  shouldProcessEmail,
  generateEmailResponse,
  extractActionItems,
  determineIfResponseNeeded,
  calculatePriority,
  processEmails
};
