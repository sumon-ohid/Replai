import { GoogleGenerativeAI } from '@google/generative-ai';
import TextData from '../../models/TextData.js';
import User from '../../models/User.js';
import BlockList from '../../models/BlockList.js';
import { categorizeEmail } from '../utils/emailCategorizer.js';
import { analyzeEmailSentiment } from '../utils/sentimentAnalyzer.js';
import dotenv from 'dotenv';

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
      body: typeof emailData.body === 'string' ? emailData.body : String(emailData.body || ''),
      from: emailData.from
    };
    
    // Get sender details if not already parsed
    const sender = typeof safeData.from === 'string' 
      ? parseEmailAddress(safeData.from) 
      : safeData.from;
    
    // Categorize the email - IMPORTANT: AWAIT THE RESULT
    const categoryInfo = await categorizeEmail(safeData);
    
    // Extract any possible action items
    const actionItems = extractActionItems(safeData.body);
    
    // Determine if email requires a response
    const requiresResponse = determineIfResponseNeeded(safeData, categoryInfo);
    
    // Determine email priority
    const priority = calculatePriority(safeData, categoryInfo, requiresResponse);
    
    // Return processed data
    return {
      ...safeData,
      sender: {
        name: sender.name || '',
        email: sender.email || ''
      },
      category: categoryInfo.category || 'uncategorized',
      confidence: categoryInfo.confidence || 0,
      keywords: categoryInfo.keywords || [],
      actionItems,
      requiresResponse,
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
  generateEmailResponse
};