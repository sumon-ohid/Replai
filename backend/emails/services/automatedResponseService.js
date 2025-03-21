import EmailProcessingService from './emailProcessingService.js';
import { shouldProcessEmail } from './emailProcessingService.js';
import ConnectionManager from '../managers/connectionManager.js';
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
  
      const account = await ConnectionManager.getConnection(userId, email);
      if (!account || !account.connection) {
        console.error('No active connection found for:', email);
        throw new Error('No active connection found');
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
      
      for (const newEmail of newEmails) {
        try {
          // Ensure newEmail has an id, using _id, mongoId, or a generated fallback if needed
          const emailId = newEmail.id || newEmail._id?.toString() || newEmail.messageId || `email-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
          
          console.log(`Processing email ${emailId} from ${newEmail.from?.email || 'unknown sender'}`);
  
          // Check if email should be processed
          const shouldProcess = await shouldProcessEmail(
            userId,
            newEmail.from?.email,
            newEmail.from?.domain
          );
  
          if (!shouldProcess) {
            console.log(`Skipping blocked email from ${newEmail.from?.email || 'unknown sender'}`);
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
            // Send auto and save
            console.log(`Sending auto for email: ${emailId}`);
            await emailService.sendEmail(account.connection, emailResponse);
            
            // Save to sent folder
            console.log(`Saving response to sent folder for email: ${emailId}`);
            await emailService.saveSentEmail(account.connection, emailResponse);
            
            console.log(`Successfully processed email ${emailId} with auto`);
          }
        } catch (error) {
          console.error('Error processing email:', {
            emailId: newEmail?.id || newEmail?._id?.toString() || 'unknown',
            error: error.message,
            stack: error.stack
          });
          continue; // Continue with next email even if one fails
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
