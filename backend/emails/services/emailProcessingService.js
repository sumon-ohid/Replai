import { GoogleGenerativeAI } from '@google/generative-ai';
import TextData from '../../models/TextData.js';
import User from '../../models/User.js';
import ConnectedEmail from '../../models/ConnectedEmail.js';
import BlockList from '../../models/BlockList.js';
import TrainAI from '../../models/TrainAI.js';
import { parseEmailAddress } from '../utils/emailParser.js';
import ConnectionManager from '../managers/connectionManager.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.GENERATIVE_AI_API_KEY) {
  throw new Error('GENERATIVE_AI_API_KEY environment variable is required');
}

// Initialize AI model
const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Process email content to extract useful information
 */
export const processEmailContent = async (emailData) => {
  try {
    // Normalize and safely extract the body content
    const extractBodyContent = (body) => {
      if (!body) return '';
      
      // Handle string body
      if (typeof body === 'string') return body;
      
      // Handle object body with text/html properties
      if (typeof body === 'object') {
        // First try to get text content
        if (body.text && typeof body.text === 'string') return body.text;
        
        // Otherwise try HTML content and strip tags
        if (body.html && typeof body.html === 'string') {
          return body.html.replace(/<[^>]*>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();
        }
        
        // If body is an object but doesn't have text/html props, try JSON stringify
        try {
          return JSON.stringify(body);
        } catch (e) {
          return '';
        }
      }
      
      // Last resort - try to convert to string
      return String(body || '');
    };
    
    // Normalize the email data into a consistent format
    const normalizeEmailData = (data) => {
      // Extract the body content safely
      const bodyContent = extractBodyContent(data.body);
      
      // Create normalized body object
      const normalizedBody = typeof data.body === 'object' && data.body !== null
        ? {
            text: data.body.text || bodyContent,
            html: data.body.html || null
          }
        : {
            text: bodyContent,
            html: null
          };
      
      // Create normalized email data object
      return {
        id: data.id || data._id?.toString() || data.messageId,
        messageId: data.messageId || data.id || data._id?.toString(),
        threadId: data.threadId || data.messageId,
        subject: typeof data.subject === 'string' ? data.subject : String(data.subject || '(No Subject)'),
        body: normalizedBody,
        bodyText: normalizedBody.text, // Add extracted text for processing
        from: typeof data.from === 'object' && data.from !== null
          ? data.from
          : parseEmailAddress(String(data.from || '')),
        to: Array.isArray(data.to) ? data.to : [data.to].filter(Boolean),
        userId: data.userId,
        userEmail: data.userEmail,
        date: data.date || data.timestamp || new Date().toISOString()
      };
    };
    
    // Normalize the email data
    const normalizedData = normalizeEmailData(emailData);
    
    // Debug log to help troubleshoot
    console.log(`Processing email: ${normalizedData.messageId}, Subject: ${normalizedData.subject.slice(0, 50)}...`);
    console.log(`Email body type: ${typeof emailData.body}, normalized body length: ${normalizedData.bodyText.length} chars`);
    
    // Get connected email account
    const connectedEmail = await ConnectedEmail.findOne({ 
      userId: normalizedData.userId,
      email: normalizedData.userEmail || normalizedData.from.email
    });

    if (!connectedEmail) {
      throw new Error('Connected email account not found');
    }
    
    // Extract any possible action items
    const actionItems = extractActionItems(normalizedData.bodyText);
    
    // Determine if email requires a response
    const requiresResponse = determineIfResponseNeeded({
      ...normalizedData,
      body: normalizedData.bodyText // Use plain text for detection
    });
    
    // Log whether response is needed
    console.log(`Response needed for ${normalizedData.subject}: ${requiresResponse}`);
    
    // Get email category
    const category = determineCategory({
      ...normalizedData,
      body: normalizedData.bodyText // Use plain text for categorization
    });
    
    // Determine priority
    const priority = calculatePriority(
      { ...normalizedData, body: normalizedData.bodyText },
      category, 
      requiresResponse
    );

    // Analyze sentiment
    const sentiment = await analyzeEmailSentiment(normalizedData.bodyText);
    
    // Keywords extraction
    const keywords = extractKeywords({
      subject: normalizedData.subject,
      body: normalizedData.bodyText
    });
    
    // Return processed data with the original structure preserved
    return {
      ...emailData, // Keep all original fields
      
      // Preserve the original body structure
      body: emailData.body,
      
      // Add processed metadata
      category,
      confidence: 0.85,
      keywords,
      actionItems: Array.isArray(actionItems) ? actionItems : [],
      requiresResponse: !!requiresResponse,
      priority,
      sentiment,
      
      // Add normalized data for debugging
      _normalized: {
        subject: normalizedData.subject,
        bodyLength: normalizedData.bodyText.length,
        from: normalizedData.from
      }
    };
  } catch (error) {
    console.error('Error processing email content:', error.message);
    console.error('Email data:', {
      id: emailData.id || emailData._id || emailData.messageId,
      subject: emailData.subject,
      bodyType: typeof emailData.body,
      error: error.stack
    });
    
    // On error, still return data with basic safe values
    return {
      ...emailData,
      category: 'uncategorized',
      confidence: 0.5,
      keywords: [],
      actionItems: [],
      requiresResponse: false,
      priority: 'medium',
      sentiment: 'neutral',
      processingError: error.message
    };
  }
};

// Helper functions
function extractKeywords(emailData) {
  // Early return if data is missing
  if (!emailData) return [];
  
  try {
    // Safely extract text content
    const subject = emailData.subject || '';
    const body = typeof emailData.body === 'string' ? emailData.body : 
                (emailData.body?.text || 
                 emailData.bodyText || 
                 (typeof emailData.body === 'object' ? JSON.stringify(emailData.body) : ''));
    
    // Combine and normalize text
    const text = `${subject} ${body}`.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Split into words
    const words = text.split(/\s+/);
    
    // Filter common words
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
      'this', 'that', 'these', 'those', 'from', 'are', 'was', 'were', 'will', 
      'would', 'could', 'should', 'has', 'have', 'had', 'not', 'been'
    ]);
    
    // Extract more meaningful keywords using frequency
    const wordFrequency = {};
    words.forEach(word => {
      if (word.length > 2 && !commonWords.has(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
    
    // Sort by frequency and get top keywords
    return Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return [];
  }
}

function determineCategory(emailData) {
  if (!emailData) return 'uncategorized';
  
  try {
    // Safely extract text content
    const subject = emailData.subject || '';
    const body = typeof emailData.body === 'string' ? emailData.body : 
                 (emailData.body?.text || 
                  emailData.bodyText || 
                  (typeof emailData.body === 'object' ? JSON.stringify(emailData.body) : ''));
    
    // Combine and convert to lowercase for pattern matching
    const text = `${subject} ${body}`.toLowerCase();
    
    // Category detection patterns
    const patterns = {
      'important': /(urgent|asap|attention|priority|immediate|critical)/i,
      'work': /(meeting|project|report|deadline|task|client|team|update)/i,
      'notification': /(notification|alert|update|announcement|notice)/i,
      'social': /(invitation|event|party|birthday|celebration|gathering)/i,
      'travel': /(flight|hotel|booking|reservation|itinerary|travel)/i,
      'shopping': /(order|purchase|shipping|delivery|tracking|receipt)/i,
      'financial': /(payment|invoice|bill|transaction|receipt|accounting)/i
    };
    
    // Check each pattern
    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return category;
      }
    }
    
    // Default category if no patterns match
    return 'inbox';
  } catch (error) {
    console.error('Error determining category:', error);
    return 'inbox';
  }
}

function extractActionItems(body) {
  if (!body || typeof body !== 'string') return [];
  
  try {
    const actionItems = [];
    const actionKeywords = [
      'please', 'kindly', 'could you', 'can you', 'need to', 'action required',
      'let me know', 'confirm', 'review', 'approve', 'send', 'provide', 'update',
      'due by', 'deadline', 'required', 'must', 'follow up', 'call', 'respond'
    ];
    
    // Split into sentences
    const sentences = body.split(/[.?!]\s+/)
      .filter(s => s.trim().length > 10); // Ignore very short sentences
    
    for (const sentence of sentences) {
      if (actionKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword.toLowerCase()))) {
        
        // Clean the sentence
        const cleanSentence = sentence.trim()
          .replace(/^(>|\s)+/, '') // Remove quote markers
          .replace(/\s+/g, ' ')    // Normalize whitespace
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .trim();
        
        // Add if sentence is a reasonable length
        if (cleanSentence.length > 10 && cleanSentence.length < 250) {
          actionItems.push(cleanSentence);
        }
      }
    }
    
    // Return unique action items
    return [...new Set(actionItems)].slice(0, 3);
  } catch (error) {
    console.error('Error extracting action items:', error);
    return [];
  }
}

function determineIfResponseNeeded(email) {
  if (!email) return false;
  
  try {
    // Safely extract text content
    const subject = email.subject || '';
    const body = typeof email.body === 'string' ? email.body : 
                (email.body?.text || 
                 email.bodyText || 
                 (typeof email.body === 'object' ? JSON.stringify(email.body) : ''));
    
    // Combine and convert to lowercase
    const text = `${subject} ${body}`.toLowerCase();
    
    // Skip certain email categories
    const noResponseCategories = ['promotions', 'newsletter', 'updates', 'social'];
    if (noResponseCategories.includes(determineCategory(email))) {
      return false;
    }
    
    // Check for questions
    if (subject.includes('?') || body.includes('?')) {
      console.log('Response needed for question:', subject);
      return true;
    }
    
    // Response pattern detection
    const responsePatterns = [
      'please let me know', 'looking forward to', 'your response', 'get back to me',
      'what do you think', 'confirm receipt', 'thoughts on', 'please respond',
      'can you help', 'would you be able', 'get your input', 'need your feedback',
      'let me know if', 'please provide', 'do you have', 'can we', 'when can you'
    ];
    
    // Check each response pattern
    for (const pattern of responsePatterns) {
      if (text.includes(pattern)) {
        console.log(`Response needed - matched pattern: "${pattern}"`);
        return true;
      }
    }
    
    // No response needed indicators
    const noResponsePatterns = [
      'no need to respond', 'no response needed', 'for your information',
      'fyi', 'do not reply', 'no reply', 'noreply', 'no-reply', 'notification only'
    ];
    
    // Check no-response patterns
    for (const pattern of noResponsePatterns) {
      if (text.includes(pattern)) {
        return false;
      }
    }
    
    // Default to false if no patterns match
    return false;
  } catch (error) {
    console.error('Error determining if response needed:', error);
    return false;
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

    // Get user's custom settings and training data
    const [textData, trainAI] = await Promise.all([
      TextData.findOne({ userId }),
      TrainAI.findOne({ userId })
    ]);

    // Parse and clean the email body with enhanced limits
    const parsedBody = parseEmailBody(body, {
      maxLength: 8000,         // Increased for better context
      preserveNewlines: true,  
      removeQuotes: true,      
      trimSignatures: true     
    });

    // Security check for sensitive information
    const sensitivePatterns = [
      /password/i, /credential/i, /secret/i, /key/i, /token/i,
      /private/i, /confidential/i, /ssn/i, /social security/i,
      /bank/i, /credit card/i, /\b\d{16}\b/, // Credit card number pattern
      /\b\d{3}-\d{2}-\d{4}\b/ // SSN pattern
    ];

    const hasSensitiveInfo = sensitivePatterns.some(pattern => 
      pattern.test(subject) || pattern.test(parsedBody)
    );

    if (hasSensitiveInfo) {
      console.log('Sensitive information detected - marking as draft');
      return {
        content: null,
        isDraft: true,
        reason: 'Potentially sensitive information detected'
      };
    }

    // Build enhanced context from user's training data
    const trainingContext = trainAI ? `
Communication Style: ${trainAI.communicationStyle || 'professional'}
Company Voice: ${trainAI.companyVoice || 'neutral'}
Industry Context: ${trainAI.industryContext || 'general'}
Key Phrases: ${(trainAI.keyPhrases || []).join(', ')}
` : '';

    // Get custom prompt if available, enhanced with training data
    const customPrompt = textData 
      ? (textData.text + (textData.fileData || '') + '\n' + trainingContext)
      : '';
    
    // Enhanced default prompt with more context
    const defaultPrompt = `
You are responding as ${userName} in a professional capacity.

Email Context:
From: ${fromEmail}
Subject: ${subject}
Body: ${parsedBody}

Response Guidelines:
1. Maintain a natural, human-like tone
2. Match the formality level of the incoming email
3. Be concise but thorough
4. Address all key points raised
5. Sign with "Best regards, ${userName}"
6. Avoid technical jargon unless in the original email
7. Focus on clear, actionable responses
8. Match company voice and communication style
9. No sensitive information or personal data
10. Never share passwords or credentials or credit card numbers
12. Use line breaks and newlines for readability, empty newlines for separation
13. Never write placeholder, always generate a complete text
14. Don't include the subject or the original email in the response
15. Always add a newline before signature and Best regards
16. Never include [ e.g.,] in the response, if something is not clear, skip it.
17. If asked for Time, Date, appointment, write that you will write get back in few hours with confirmation.

Please generate a response:`;
    
    const prompt = defaultPrompt; // customPrompt + defaultPrompt;
    
    // Handle large prompts by breaking into chunks if needed
    const maxChunkSize = 4096;
    let finalResponse = '';

    if (prompt.length > maxChunkSize) {
      // Split into manageable chunks
      const chunks = prompt.match(new RegExp(`.{1,${maxChunkSize}}`, 'g')) || [];
      
      // Process each chunk and combine responses
      for (const chunk of chunks) {
        const chunkRes = await model.generateContent(chunk);
        finalResponse += chunkRes.response.text() + ' ';
      }
    } else {
      const aiRes = await model.generateContent(prompt);
      finalResponse = aiRes.response.text();
    }

    // Post-process the response
    const processedResponse = finalResponse; // postProcessResponse(finalResponse);
    
    // Log for debugging in green color
    // console.log('\x1b[32m%s\x1b[0m', 'Generated email response:', processedResponse);
    
    // Return with metadata
    return {
      content: processedResponse,
      isDraft: false,
      metadata: {
        tone: detectTone(processedResponse),
        length: processedResponse.length,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error generating email response:', error);

    // Enhanced error handling
    if (error?.status === 429) {
      throw new Error('AI service is temporarily unavailable due to rate limits. Please try again later.');
    }

    // Return structured error response
    return {
      content: `Sorry, I couldn't generate a response at this time.\n\nBest regards,\n${User?.name || 'AI Assistant'}`,
      isDraft: true,
      error: error.message,
      metadata: {
        errorType: error.name,
        timestamp: new Date().toISOString()
      }
    };
  }
};

/**
 * Parse email body intelligently, handling various formats
 * Prioritizes text content over HTML when available
 * Cleans up formatting for AI prompt use
 * 
 * @param {string|object} body - The email body to parse
 * @param {object} options - Parsing options
 * @returns {string} - Clean text suitable for AI prompting
 */
/**
 * Post-process the AI generated response
 */
function postProcessResponse(response) {
  if (!response) return '';
  
  return response
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    // Ensure proper spacing after punctuation
    .replace(/([.!?])\s*/g, '$1 ')
    // Remove any HTML that might have been generated
    .replace(/<[^>]*>/g, '')
    // Clean up signature formatting
    .replace(/(\n*)Best regards,/, '\n\nBest regards,')
    .trim();
}

/**
 * Detect the tone of the response
 */
function detectTone(text) {
  const tones = {
    formal: /dear|sincerely|regards|pleasure|opportunity|appreciate/i,
    casual: /hey|hi|thanks|great|awesome/i,
    urgent: /asap|urgent|immediately|emergency/i,
    neutral: /^[^]*$/  // Default fallback
  };

  for (const [tone, pattern] of Object.entries(tones)) {
    if (pattern.test(text)) return tone;
  }
  return 'neutral';
}

/**
 * Enhanced email body parser with additional options
 */
function parseEmailBody(body, options = {}) {
  try {
    const {
      maxLength = 5000,         // Maximum length to return
      preserveNewlines = true,  // Keep some newlines for readability
      removeQuotes = true,      // Remove quoted text (">...")
      trimSignatures = true     // Try to remove email signatures
    } = options;
    
    // Handle undefined/null input
    if (!body) return '';
    
    // Get text content based on body type
    let textContent = '';
    
    // Case 1: If body is already a string
    if (typeof body === 'string') {
      textContent = body;
    } 
    // Case 2: If body is an object with text/html properties
    else if (typeof body === 'object') {
      // Check for explicitly labeled text/html sections
      const hasTextSection = /text\s*:/i.test(JSON.stringify(body));
      const hasHtmlSection = /html\s*:/i.test(JSON.stringify(body));
      
      // If body has explicit text: and html: sections, prioritize text
      if (hasTextSection) {
        // Extract the text section using regex
        const textMatch = body.toString().match(/text\s*:(.*?)(?=html\s*:|$)/is);
        if (textMatch && textMatch[1]) {
          textContent = textMatch[1].trim();
          console.log('Extracted text section from email body');
        }
      }
      
      // If we couldn't extract from text: section, check standard body properties
      if (!textContent && body.text && typeof body.text === 'string') {
        textContent = body.text;
        console.log('Using body.text property');
      }
      
      // If still no text but we have HTML, convert HTML to text
      if ((!textContent || textContent.length < 10) && body.html) {
        textContent = convertHtmlToText(body.html);
        console.log('Converted HTML to text');
      }
      
      // Last resort: try to use the whole object
      if (!textContent) {
        try {
          textContent = JSON.stringify(body);
        } catch (e) {
          textContent = String(body);
        }
      }
    }
    // Case 3: Unknown type, convert to string
    else {
      textContent = String(body);
    }
    
    // Clean up the text content
    let cleanedText = textContent
      // Remove HTML tags (with their content for script/style tags)
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
      // Remove remaining HTML tags but keep their content
      .replace(/<[^>]*>/g, ' ')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // Fix spacing issues
      .replace(/\s+/g, ' ');
    
    // Remove quoted text (lines starting with >)
    if (removeQuotes) {
      cleanedText = cleanedText
        .split('\n')
        .filter(line => !line.trim().startsWith('>'))
        .join('\n');
    }
    
    // Try to remove email signatures
    if (trimSignatures) {
      const signatureMarkers = [
        /^--\s*$/m,                        // -- marker
        /^__+\s*$/m,                       // __ marker
        /^Sent from my (?:iPhone|iPad|Android|Samsung|Google Pixel)/m,
        /^Best regards,/m,                 // Common signature starter
        /^Regards,/m,                      // Common signature starter
        /^Thanks(?:,| & Regards)/m,        // Common signature starter
        /^[^@]+@[^@]+\.[^@]{2,}$/m         // Email address on its own line
      ];
      
      // Find the first occurrence of any signature marker
      let signaturePos = -1;
      for (const marker of signatureMarkers) {
        const match = cleanedText.match(marker);
        if (match && match.index > 100) { // Only if not at beginning
          if (signaturePos === -1 || match.index < signaturePos) {
            signaturePos = match.index;
          }
        }
      }
      
      // Trim the signature if found
      if (signaturePos > 0) {
        cleanedText = cleanedText.substring(0, signaturePos).trim();
        console.log('Removed email signature');
      }
    }
    
    // Preserve some meaningful newlines but collapse multiple blank lines
    if (preserveNewlines) {
      cleanedText = cleanedText
        .replace(/\n{3,}/g, '\n\n')  // Replace 3+ newlines with 2
        .replace(/([.!?])\s+/g, '$1\n'); // Add newlines after sentences
    } else {
      cleanedText = cleanedText.replace(/\n+/g, ' ');
    }
    
    // Final cleanup and truncation
    cleanedText = cleanedText
      .trim()
      .replace(/\s+/g, ' '); // Final normalization of spaces
    
    if (cleanedText.length > maxLength) {
      cleanedText = cleanedText.substring(0, maxLength) + '...';
    }
    
    return cleanedText;
  } catch (error) {
    console.error('Error parsing email body:', error);
    // Return a safe fallback - the original body with basic HTML tag removal
    return typeof body === 'string' 
      ? body.replace(/<[^>]*>/g, ' ').trim() 
      : String(body || '').replace(/<[^>]*>/g, ' ').trim();
  }
}

/**
 * Converts HTML to readable text
 */
function convertHtmlToText(html) {
  if (!html) return '';
  
  return html
    // Replace common block elements with newlines
    .replace(/<(\/)?(?:div|p|h[1-6]|br|li|td|tr|blockquote|hr)[^>]*>/gi, (match, close) => {
      return close ? '\n' : '\n';
    })
    // Replace list items with bullets
    .replace(/<li[^>]*>/gi, '\n• ')
    // Replace links with their text and URL
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, (match, url, text) => {
      return `${text} (${url})`;
    })
    // Remove all other HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Fix spacing issues
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Process new emails
 */
export const processEmails = async (userId, email) => {
  try {
    const connectedEmail = await ConnectedEmail.findOne({ 
      userId, 
      email,
      status: 'active'
    });
    
    if (!connectedEmail) {
      throw new Error('Connected email account not found');
    }

    // Get connection from connection manager
    const connection = await ConnectionManager.getConnection(userId, email);
    if (!connection) {
      throw new Error('No active connection found');
    }

    // Process each email that's already been fetched
    const emailModels = connection.emailModels;
    if (!emailModels || !emailModels.Email) {
      throw new Error('Email models not properly initialized');
    }
    const unprocessedEmails = await emailModels.Email.find({
      processed: { $ne: true },
      messageId: { $exists: true }
    }).limit(20);

    console.log(`Found ${unprocessedEmails.length} unprocessed emails to process`);

    // Process each email
    const processedEmails = await Promise.all(
      unprocessedEmails.map(async (unprocessedEmail) => {
        const processed = await processEmailContent({
          ...unprocessedEmail.toObject(),
          userId,
          userEmail: email
        });

        // Update the email with processed data
        await emailModels.Email.findByIdAndUpdate(unprocessedEmail._id, {
          $set: {
            // COMMENTED OUT: No longer marking emails as processed here - handled in schedulingManager
            // processed: true,
            // processedAt: new Date(),
            category: processed.category,
            keywords: processed.keywords,
            actionItems: processed.actionItems,
            requiresResponse: processed.requiresResponse,
            priority: processed.priority,
            sentiment: processed.sentiment
          }
        });

        return processed;
      })
    );

    return processedEmails.filter(e => e); // Filter out any nulls
  } catch (error) {
    console.error('Error processing emails:', error);
    return [];
  }
};


function calculatePriority(email, category, requiresResponse) {
  let priority = 'medium';
  const text = `${email.subject} ${email.body}`.toLowerCase();
  
  const urgentKeywords = ['urgent', 'asap', 'emergency', 'critical'];
  if (urgentKeywords.some(kw => text.includes(kw))) {
    return 'urgent';
  }
  
  const highPriorityKeywords = ['important', 'attention', 'priority'];
  if (highPriorityKeywords.some(kw => text.includes(kw))) {
    return 'high';
  }
  
  if (category === 'important' || requiresResponse) {
    priority = 'high';
  } else if (category === 'uncategorized') {
    priority = 'low';
  }
  
  return priority;
}

async function analyzeEmailSentiment(text) {
  try {
    const lowerText = text.toLowerCase();
    const positiveWords = ['thank', 'thanks', 'appreciate', 'good', 'great', 'excellent'];
    const negativeWords = ['issue', 'problem', 'error', 'wrong', 'bad', 'sorry'];
    
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

export default {
  processEmailContent,
  shouldProcessEmail,
  generateEmailResponse,
  extractActionItems,
  determineIfResponseNeeded,
  calculatePriority,
  processEmails
};
