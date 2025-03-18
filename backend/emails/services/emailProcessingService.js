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

export const processEmailContent = async (subject, body, from) => {
  const sanitizedBody = typeof body === 'string' ? body : 
                        (body ? JSON.stringify(body) : "");
    
  // Categorize and analyze sentiment
  const category = categorizeEmail(subject, sanitizedBody, from);
  const sentiment = analyzeEmailSentiment(sanitizedBody);
  
  return {
    category,
    sentiment
  };
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