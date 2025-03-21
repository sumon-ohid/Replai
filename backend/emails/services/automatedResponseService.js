import EmailProcessingService from './emailProcessingService.js';
import { shouldProcessEmail } from './emailProcessingService.js';
import ConnectionManager from '../managers/connectionManager.js';
import ConnectedEmail from '../../models/ConnectedEmail.js';
import { asyncHandler } from '../utils/errorHandler.js';

/**
 * Service to handle automated email responses
 */
class AutomatedResponseService {
  /**
   * Process new emails and generate responses if needed
   * @param {string} userId - User ID
   * @param {string} email - Email address
   * @param {Array} newEmails - Array of new emails to process
   */

    static async processNewEmails(userId, email, newEmails) {
      console.log(`Starting to process ${newEmails.length} new emails for ${email}`);

      // Get the account connection and email models with retry
      let account;
      for (let i = 0; i < 3; i++) {
        try {
          account = await ConnectionManager.getConnection(userId, email);
          if (account?.emailModels?.Email) {
            // Clear any stuck processing states (older than 5 minutes)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            await account.emailModels.Email.updateMany(
              { 
                processing: true,
                processingStarted: { $lt: fiveMinutesAgo }
              },
              {
                $set: {
                  processing: false,
                  processed: false,
                  lastError: {
                    message: 'Processing timeout',
                    date: new Date(),
                    code: 'TIMEOUT'
                  }
                }
              }
            );
            break;
          }
        } catch (error) {
          console.error(`Connection attempt ${i + 1} failed:`, error);
          if (i < 2) await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }

      if (!account?.connection || !account?.emailModels?.Email) {
        console.error('No active connection or email models found for:', email);
        throw new Error('No active connection found');
      }

      // Create a Map to track unique emails by messageId
      const processedIds = new Map();
      const uniqueEmails = newEmails.filter(email => {
        const emailId = email.id || email._id?.toString() || email.messageId;
        if (processedIds.has(emailId)) {
          return false;
        }
        processedIds.set(emailId, true);
        return true;
      });

      // Filter out already processed or replied emails
      const unprocessedEmails = await Promise.all(uniqueEmails.map(async (newEmail) => {
        const emailId = newEmail.id || newEmail._id?.toString() || newEmail.messageId;
        
        // Check if email is already being processed or has been processed
        const existingEmail = await account.emailModels.Email.findOne({
          messageId: emailId,
          $or: [
            { processed: true },
            { replied: true },
            { processing: true }
          ]
        });
        
        if (existingEmail) {
          return null;
        }

        // Mark email as being processed
        await account.emailModels.Email.findOneAndUpdate(
          { messageId: emailId },
          { $set: { processing: true, processingStarted: new Date() } }
        );

        return newEmail;
      }));

      const emailsToProcess = unprocessedEmails.filter(e => e);

      // Add delay between processing each email to prevent rate limits
      const PROCESSING_DELAY = 2000; // 2 seconds
      console.log(`Found ${emailsToProcess.length} unprocessed emails out of ${newEmails.length}`);
  
      // Skip if no unprocessed emails
      if (emailsToProcess.length === 0) {
        return;
      }
  
      // Verify AI settings are properly configured
      if (!this.verifyAISettings(account)) {
        console.error('AI settings are not properly configured for:', email);
        return;
      }
  
      const emailService = await ConnectionManager.getEmailService(account.provider);
      if (!emailService) {
        console.error('Email service not found for provider:', account.provider);
        return;
      }
      
      for (const newEmail of emailsToProcess) {
        // Add delay between processing emails
        await new Promise(resolve => setTimeout(resolve, PROCESSING_DELAY));
        try {
          // Ensure newEmail has an id, using _id, mongoId, or a generated fallback if needed
          const emailId = newEmail.id || newEmail._id?.toString() || newEmail.messageId || `email-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
          
          console.log(`Processing email ${emailId} from ${newEmail.from?.email || 'unknown sender'}`);
  
          // Check self-email and skip processing own emails
          if (newEmail.from?.email === email) {
            console.log(`Skipping self-email: ${emailId}`);
            await account.emailModels.Email.findOneAndUpdate(
              { messageId: emailId },
              { 
                $set: { 
                  processed: true,
                  processing: false,
                  processedAt: new Date(),
                  skipped: true,
                  skipReason: 'self-email'
                }
              }
            );
            continue;
          }

          // Double check if email was already processed or replied to
          const doubleCheckEmail = await account.emailModels.Email.findOne({
            messageId: emailId,
            $or: [
              { processed: true },
              { replied: true },
              { skipped: true }
            ]
          });

          if (doubleCheckEmail) {
            console.log(`Skipping already processed email: ${emailId}`);
            continue;
          }

          // Check if email should be processed
          const shouldProcess = await shouldProcessEmail(
            userId,
            newEmail.from?.email,
            newEmail.from?.domain
          );
  
          if (!shouldProcess) {
            console.log(`Skipping blocked email from ${newEmail.from?.email || 'unknown sender'}`);
            await account.emailModels.Email.findOneAndUpdate(
              { messageId: emailId },
              { 
                $set: { 
                  processed: true,
                  processing: false,
                  processedAt: new Date(),
                  skipped: true,
                  skipReason: 'blocked'
                }
              }
            );
            continue;
          }
  
          // Process email content
          const processedEmail = await EmailProcessingService.processEmailContent({
            ...newEmail,
            id: emailId, // Ensure id is always set
            userId,
            userEmail: email
          });
  
          // Check if response is needed
          if (!processedEmail.requiresResponse) {
            console.log(`No response needed for email: ${emailId}`);
            // Mark as processed even if no response needed
            await account.emailModels.Email.findOneAndUpdate(
              { messageId: emailId },
              { 
                $set: { 
                  processed: true,
                  processing: false,
                  processedAt: new Date()
                }
              }
            );
            continue;
          }
  
          console.log(`Generating AI response for email: ${emailId}`);
          
          // Generate AI response
          const response = await EmailProcessingService.generateEmailResponse(
            userId,
            newEmail.from?.email,
            newEmail.subject,
            newEmail.body
          );
  
          if (!response) {
            console.error('Failed to generate AI response');
            continue;
          }
  
          // Check AI settings mode (draft or auto)
          const aiSettings = account.aiSettings || {};
          const mode = aiSettings.mode || 'draft';
  
          // Save response regardless of mode
          const emailResponse = {
            messageId: emailId,
            content: response,
            sentAt: new Date(),
            mode: mode,
            from: email,  // The account sending the response
            to: newEmail.from?.email,
            subject: `Re: ${newEmail.subject || 'No Subject'}`,
            autoResponse: true
          };
  
          if (mode === 'draft') {
            // Create draft response
            await emailService.createDraft(account.connection, emailResponse);
            console.log(`Created draft response for email: ${emailId}`);
          } else {
            // Send auto and get response details
            console.log(`Sending auto for email: ${emailId}`);
            let sendResult;
            try {
              sendResult = await emailService.sendEmail(account.connection, emailResponse);
              
              // Small delay to ensure Gmail has processed the message
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
              console.error('Error sending email:', error);
              throw error;
            }

            // Update email response with new IDs
            emailResponse.messageId = sendResult.messageId;
            emailResponse.threadId = sendResult.threadId;
            
            // Save sent email to database first with proper IDs
            const sentEmail = new account.emailModels.Email({
              messageId: sendResult.messageId,
              threadId: sendResult.threadId || emailId,
              userId,
              from: {
                email: email,
                name: account.name || email.split('@')[0]
              },
              to: [{
                email: newEmail.from.email,
                name: newEmail.from.name
              }],
              subject: emailResponse.subject,
              body: {
                text: emailResponse.content,
                html: emailResponse.content
              },
              date: emailResponse.sentAt,
              folder: 'sent',
              type: 'sent',
              autoResponse: true,
              originalMessageId: emailId
            });
            await sentEmail.save();

            // Try to save to Gmail sent folder
            try {
              console.log(`Saving response to sent folder for email: ${emailId}`);
              await emailService.saveSentEmail(
                account.connection.gmail, 
                emailResponse,
                sendResult.messageId
              );

              // Small delay before next Gmail operation
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
              console.error('Error saving to sent folder:', error);
              // Continue since email was already sent
            }

            // Mark as replied in database
            await account.emailModels.Email.findOneAndUpdate(
              { messageId: emailId },
              { 
                $set: { 
                  replied: true,
                  repliedAt: new Date(),
                  read: true 
                } 
              }
            );

            // Update reply history and stats
            await ConnectedEmail.findOneAndUpdate(
              { userId, email },
              {
                $set: {
                  'lastProcessed': {
                    messageId: emailId,
                    date: new Date(),
                    status: 'replied'
                  },
                  'stats.lastReply': new Date()
                },
                $inc: { 'stats.totalReplied': 1 },
                $push: {
                  'stats.replyHistory': {
                    date: new Date(),
                    messageId: emailId,
                    subject: emailResponse.subject,
                    success: true,
                    mode: 'auto'
                  }
                }
              }
            );

            // Update both original and sent email statuses
            await Promise.all([
              // Mark original email as read and replied
              account.emailModels.Email.findOneAndUpdate(
                { messageId: emailId },
                { 
                  $set: { 
                    replied: true,
                    repliedAt: new Date(),
                    read: true,
                    replyMessageId: sendResult.messageId,
                    lastInteraction: new Date()
                  } 
                }
              ),
              // Mark sent email as read
              account.emailModels.Email.findOneAndUpdate(
                { messageId: sendResult.messageId },
                {
                  $set: {
                    read: true,
                    processed: true,
                    lastInteraction: new Date()
                  }
                }
              )
            ]);

            try {
              // Mark original message as read in Gmail
              await account.connection.gmail.users.messages.modify({
                userId: 'me',
                id: emailId,
                requestBody: {
                  addLabelIds: ['SENT'],
                  removeLabelIds: ['UNREAD']
                }
              });
            } catch (error) {
              console.error('Error updating Gmail labels:', error);
              // Non-critical error, continue processing
            }
            
            console.log(`Successfully processed email ${emailId} with auto`);
          }
        } catch (error) {
          const emailId = newEmail?.id || newEmail?._id?.toString() || newEmail.messageId;
          console.error('Error processing email:', {
            emailId,
            error: error.message,
            stack: error.stack
          });

          // Handle rate limit errors specifically
          if (error.message.includes('rate limits') || error.status === 429) {
            console.log('Rate limit hit, backing off processing...');
            // Increase delay for next processing
            await new Promise(resolve => setTimeout(resolve, PROCESSING_DELAY * 2));
          }

          // Always cleanup processing state
          await account.emailModels.Email.findOneAndUpdate(
            { messageId: emailId },
            {
              $set: {
                processing: false,
                processed: true,
                processedAt: new Date(),
                lastError: {
                  message: error.message,
                  date: new Date(),
                  code: error.status === 429 ? 'RATE_LIMIT' : 'PROCESSING_ERROR'
                }
              }
            }
          );

          if (error.status === 429) {
            // Stop processing remaining emails on rate limit
            console.log('Rate limit reached, stopping further processing');
            break;
          }

          continue; // Continue with next email for other errors
        }
      }
    }

  /**
   * Verify AI settings are properly configured
   * @param {Object} account - Email account object
   */
  static verifyAISettings(account) {
    console.log('Verifying AI settings:', {
      hasSettings: !!account?.aiSettings,
      enabled: account?.aiSettings?.enabled,
      mode: account?.aiSettings?.mode
    });

    if (!account?.aiSettings) {
      console.log('AI settings object is missing');
      return false;
    }

    if (account.aiSettings.enabled !== true) {
      console.log('AI is not enabled in settings');
      return false;
    }

    if (!['draft', 'auto'].includes(account.aiSettings.mode)) {
      console.log(`Invalid AI mode: ${account.aiSettings.mode}`);
      return false;
    }

    console.log(`AI settings verified: enabled=${account.aiSettings.enabled}, mode=${account.aiSettings.mode}`);
    return true;
  }

  /**
   * Check if automated responses are enabled for an account
   * @param {Object} account - Email account object
   */
  static isAutomationEnabled(account) {
    // Log current AI settings
    console.log('Checking AI settings:', {
      enabled: account?.aiSettings?.enabled,
      mode: account?.aiSettings?.mode,
      settings: account?.aiSettings
    });
    
    // AI is enabled if aiSettings.enabled is true
    const isEnabled = account?.aiSettings?.enabled === true;
    
    // Log the decision
    if (isEnabled) {
      console.log('AI automation is enabled with mode:', account?.aiSettings?.mode);
    } else {
      console.log('AI automation is disabled. Required: aiSettings.enabled = true');
    }
    
    return isEnabled;
  }

  /**
   * Get current automation mode for an account
   * @param {Object} account - Email account object
   */
  static getAutomationMode(account) {
    const mode = account?.aiSettings?.mode || 'draft';
    console.log(`Current automation mode: ${mode}`);
    return mode;
  }
}

export default AutomatedResponseService;
