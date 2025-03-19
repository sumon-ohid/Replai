import { GoogleGenerativeAI } from '@google/generative-ai';
import TextData from '../../models/TextData.js';
import User from '../../models/User.js';
import BlockList from '../../models/BlockList.js';
import { categorizeEmail } from '../utils/emailCategorizer.js';
import { analyzeEmailSentiment } from '../utils/sentimentAnalyzer.js';
import dotenv from 'dotenv';
import { parseEmailAddress } from '../utils/emailParser.js';

dotenv.config();

// Initialize AI model
const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Process email content for category and sentiment
 */

// Fix the processEmailContent function to ensure it resolves properly


/**
 * Process email content to extract useful information
 */
export const processEmailContent = async (emailData) => {
  try {
    // Ensure emailData has all required fields as strings
    const safeData = {
      ...emailData,
      subject: typeof emailData.subject === 'string' ? emailData.subject : String(emailData.subject || ''),
      body: typeof emailData.body === 'string' ? emailData.body : String(emailData.body || '')
    };
    
    // Use existing from data if it's already an object
    const sender = typeof safeData.from === 'object' && safeData.from !== null
      ? safeData.from
      : parseEmailAddress(String(safeData.from || ''));
    
    // Categorize the email - IMPORTANT: AWAIT THE RESULT
    const categoryInfo = await categorizeEmail(safeData);
    
    // Extract any possible action items
    const actionItems = extractActionItems(safeData.body);
    
    // Determine if email requires a response
    const requiresResponse = determineIfResponseNeeded(safeData, categoryInfo);
    
    // Determine email priority
    const priority = calculatePriority(safeData, categoryInfo, requiresResponse);
    
    // Ensure category is a string
    const category = typeof categoryInfo.category === 'string' 
      ? categoryInfo.category 
      : 'uncategorized';
    
    // Return processed data
    return {
      ...safeData,
      category,
      confidence: categoryInfo.confidence || 0,
      keywords: Array.isArray(categoryInfo.keywords) ? categoryInfo.keywords : [],
      actionItems: Array.isArray(actionItems) ? actionItems : [],
      requiresResponse: !!requiresResponse,
      priority,
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
 * Extract possible action items from email body
 * @param {string} body - Email body text
 * @returns {Array} - List of action items
 */
export const extractActionItems = (body) => {
  if (!body || typeof body !== 'string') {
    return [];
  }
  
  const actionItems = [];
  
  // Keywords that often indicate action items
  const actionKeywords = [
    'please', 'kindly', 'could you', 'can you', 'need to', 'action required',
    'let me know', 'confirm', 'review', 'approve', 'send', 'provide', 'update'
  ];
  
  // Split by sentences
  const sentences = body.split(/[.?!]\s+/);
  
  for (const sentence of sentences) {
    // Check if sentence contains action keywords
    if (actionKeywords.some(keyword => 
      sentence.toLowerCase().includes(keyword.toLowerCase()))) {
      
      // Clean up the sentence
      const cleanSentence = sentence.trim()
        .replace(/^(>|\s)+/, '') // Remove quote markers
        .replace(/\s+/g, ' '); // Normalize whitespace
      
      if (cleanSentence.length > 5 && cleanSentence.length < 200) {
        actionItems.push(cleanSentence);
      }
    }
  }
  
  // Limit to top 3 most likely action items
  return actionItems.slice(0, 3);
};

/**
 * Determine if an email requires a response
 * @param {Object} email - Email object
 * @param {Object} categoryInfo - Email category information
 * @returns {boolean} - True if response is needed
 */
export const determineIfResponseNeeded = (email, categoryInfo) => {
  if (!email || !categoryInfo) {
    return false;
  }
  
  // Categories that generally don't need responses
  const noResponseCategories = ['promotions', 'newsletter', 'updates', 'social'];
  
  if (noResponseCategories.includes(categoryInfo.category)) {
    return false;
  }
  
  // Check for question marks in the subject or body
  if (email.subject.includes('?') || email.body.includes('?')) {
    return true;
  }
  
  // Check for common phrases that indicate a response is expected
  const responsePatterns = [
    'please let me know', 'looking forward to', 'your response', 'get back to me',
    'what do you think', 'confirm receipt', 'thoughts on', 'please respond',
    'can you help', 'would you be able', 'get your input', 'need your feedback'
  ];
  
  for (const pattern of responsePatterns) {
    if (email.body.toLowerCase().includes(pattern)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Calculate email priority
 * @param {Object} email - Email object
 * @param {Object} categoryInfo - Email category information
 * @param {boolean} requiresResponse - Whether email needs response
 * @returns {string} - Priority level ('low', 'medium', 'high', 'urgent')
 */
export const calculatePriority = (email, categoryInfo, requiresResponse) => {
  // Default to medium priority
  let priority = 'medium';
  
  // Automatic high priority for urgent category
  if (categoryInfo.category === 'urgent') {
    return 'urgent';
  }
  
  // Check for urgent keywords in subject
  const urgentKeywords = ['urgent', 'important', 'attention', 'asap', 'critical'];
  if (urgentKeywords.some(kw => email.subject.toLowerCase().includes(kw))) {
    return 'high';
  }
  
  // Emails requiring response get higher priority
  if (requiresResponse) {
    priority = 'high';
  }
  
  // Adjust based on category
  const categoryPriority = {
    'personal': 'high',
    'work': 'high',
    'bill': 'high',
    'promotions': 'low',
    'newsletter': 'low',
    'shopping': 'medium',
    'social': 'low'
  };
  
  if (categoryInfo.category in categoryPriority) {
    // If category priority is higher than current, use it
    const catPriority = categoryPriority[categoryInfo.category];
    if (priorityRank(catPriority) > priorityRank(priority)) {
      priority = catPriority;
    }
  }
  
  return priority;
};

/**
 * Helper to rank priorities for comparison
 */
const priorityRank = (priority) => {
  const ranks = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'urgent': 4
  };
  return ranks[priority] || 2;
};


/**
 * Check if email should be processed or blocked
 */
export const shouldProcessEmail = async (userId, fromEmail, fromDomain) => {
  try {
    // Check if the email or domain is in the block list
    const blockList = await BlockList.findOne({ userId });
    
    if (blockList) {
      const blockedEmails = blockList.entries.map(entry => entry.toLowerCase());
      
      // Check if full email, domain, or subdomain match
      if (
        blockedEmails.includes(fromEmail.toLowerCase()) ||
        (fromDomain && blockedEmails.some(blocked => 
          fromDomain === blocked || fromDomain.endsWith(`.${blocked}`)
        ))
      ) {
        console.log(`Email from ${fromEmail} is in the block list. Skipping.`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking block list:', error);
    return true; // Default to processing if check fails
  }
};

/**
 * Generate AI response to an email
 */
export const generateEmailResponse = async (userId, fromEmail, subject, body) => {
  try {
    // Get user info for personalization
    const user = await User.findById(userId);
    const userName = user ? user.name : '';
    
    // Check for custom prompt
    let userPrompt = await TextData.findOne({ userId });
    const promptText = userPrompt 
      ? (userPrompt.text + (userPrompt.fileData || '')) 
      : '';
    
    // Build default prompt if no custom one exists
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
    
    // Generate response with AI
    const aiRes = await model.generateContent(prompt);
    return aiRes.response.text();
    
  } catch (error) {
    console.error('Error generating email response:', error);
    return `Sorry, I couldn't generate a response at this time. 

Best regards,
${await User.findById(userId).then(u => u?.name || 'Me')}`;
  }
};

export default {
  processEmailContent,
  shouldProcessEmail,
  generateEmailResponse,
  extractActionItems,
  determineIfResponseNeeded,
  calculatePriority
};
