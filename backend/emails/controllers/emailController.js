import ConnectedEmail from "../../models/ConnectedEmail.js";
import getConnectedEmailModels from "../../models/ConnectedEmailModels.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger("emailController");

class EmailController {
  /**
   * Get emails for a specific connected email account with optimized body handling
   */
  static getEmails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    const { folder = "inbox", page = 1, limit = 50 } = req.query;

    logger.info("Getting emails for", { email, folder, page, limit });

    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: "Connected email not found" });
    }

    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());

    // Create query object
    const query = {};

    // Add folder filter if provided and valid
    if (folder && folder !== "all") {
      // Convert to lowercase for consistency
      query.folder = folder.toLowerCase();
    }

    // Fetch emails with pagination, but be selective about fields to improve performance
    const skip = (page - 1) * limit;
    const [emails, total] = await Promise.all([
      emailModels.Email.find(query)
        .select({
          // Always include these fields
          _id: 1,
          messageId: 1,
          threadId: 1,
          from: 1,
          to: 1,
          cc: 1,
          bcc: 1,
          subject: 1,
          date: 1,
          receivedAt: 1,
          read: 1,
          readAt: 1,
          starred: 1,
          folder: 1,
          labels: 1,
          snippet: 1,
          attachments: 1,

          // For list view, include truncated body and preview
          "body.text": { $substr: ["$body.text", 0, 150] },
          html_preview: 1,
        })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      emailModels.Email.countDocuments(query),
    ]);

    logger.info(`Found ${emails.length} emails (total: ${total})`);

    // Process emails to ensure consistent format
    const processedEmails = emails.map((email) => {
      // Initialize body properly if missing
      if (!email.body) {
        email.body = {
          text: email.snippet || "",
          html: email.html_preview || "",
        };
      }

      return email;
    });

    res.json({
      emails: processedEmails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  /**
   * Get a single email by ID with proper body handling
   */
  static getEmail = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email, messageId } = req.params;

    logger.info("Getting email details", { email, messageId });

    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: "Connected email not found" });
    }

    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());

    // Find the email - try multiple possible ID fields
    const emailDoc = await emailModels.Email.findOne({
      $or: [{ messageId: messageId }, { _id: messageId }, { id: messageId }],
    }).lean();

    if (!emailDoc) {
      logger.warn("Email not found", { email, messageId });
      return res.status(404).json({ error: "Email not found" });
    }

    // Changed: Use EmailController.processEmailBody instead of processEmailBody
    const processedEmail = EmailController.processEmailBody(emailDoc);

    // Mark as read if not already read
    if (!processedEmail.read) {
      logger.info("Marking email as read", { messageId });
      await emailModels.Email.findByIdAndUpdate(processedEmail._id, {
        $set: { read: true },
        $currentDate: { readAt: true },
      });
      processedEmail.read = true;
      processedEmail.readAt = new Date();
    }

    logger.info("Email retrieved successfully", { messageId });
    res.json(processedEmail);
  });

  /**
   * Handle email body processing
   * This helper function ensures consistent email body format
   */
  static processEmailBody(emailDoc) {
    if (!emailDoc) return null;

    // Make a copy to avoid modifying the original
    const processedEmail = { ...emailDoc };

    // Process body field
    // Case 1: Body is completely missing
    if (!processedEmail.body) {
      logger.debug("Email body missing, creating from available data", {
        messageId: processedEmail.messageId,
      });

      processedEmail.body = {
        text: processedEmail.snippet || "",
        html: processedEmail.html_preview || "",
      };
    }

    // Case 2: Body is a string (older format)
    if (typeof processedEmail.body === "string") {
      logger.debug("Email body is a string, converting to object format", {
        messageId: processedEmail.messageId,
      });

      const bodyText = processedEmail.body;
      processedEmail.body = {
        text: bodyText,
        html: convertPlainTextToHtml(bodyText),
      };
    }

    // Case 3: Body is an object but missing text or html
    if (typeof processedEmail.body === "object") {
      // If no text but html exists, extract text from HTML
      if (!processedEmail.body.text && processedEmail.body.html) {
        processedEmail.body.text = extractTextFromHtml(
          processedEmail.body.html
        );
      }

      // If no html but text exists, convert text to HTML
      if (!processedEmail.body.html && processedEmail.body.text) {
        processedEmail.body.html = convertPlainTextToHtml(
          processedEmail.body.text
        );
      }
    }

    // Generate snippet if missing
    if (!processedEmail.snippet && processedEmail.body.text) {
      processedEmail.snippet = processedEmail.body.text
        .substring(0, 150)
        .replace(/\s+/g, " ")
        .trim();
    }

    // Generate html_preview if missing
    if (!processedEmail.html_preview && processedEmail.body.html) {
      processedEmail.html_preview = processedEmail.body.html.substring(0, 1000);
    }

    return processedEmail;
  }

  /**
   * Convert plain text to HTML with proper line breaks and formatting
   */
  static convertPlainTextToHtml(text) {
    if (!text) return "";

    // Replace newlines with HTML line breaks
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\r\n/g, "<br>")
      .replace(/\n/g, "<br>")
      .replace(/\r/g, "<br>");

    // Auto-link URLs
    html = html.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Wrap in a div for better styling
    return `<div style="font-family: Arial, sans-serif; line-height: 1.5;">${html}</div>`;
  }

  /**
   * Extract plain text from HTML content
   */
  static extractTextFromHtml(html) {
    if (!html) return "";

    // Simple HTML tag stripper for basic cases
    return html
      .replace(/<[^>]*>/g, " ") // Replace tags with spaces
      .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
      .replace(/&amp;/g, "&") // Replace entities
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

   /**
   * Get drafts for a specific email account
   */
  static getDrafts = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    const { page = 1, limit = 50, status = 'all' } = req.query;
  
    logger.info("Getting drafts for", { email, page, limit, status });
  
    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: "Connected email not found" });
    }
  
    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());
    
    // Check if Draft model exists
    if (!emailModels.Draft) {
      logger.warn("Draft model not found for account", { email });
      return res.json({
        drafts: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          pages: 0,
        },
      });
    }
  
    // Build query based on status parameter
    let query = {};
    
    if (status !== 'all') {
      if (status === 'pending') {
        // Include all drafts that haven't been sent yet
        query = {
          $or: [
            { status: 'pending' },
            { status: 'draft' },
            { status: { $exists: false } } // Handle drafts with no status
          ]
        };
      } else {
        // Use specified status
        query.status = status;
      }
    }
    
    // Add autoGenerated filter if specified
    if (req.query.autoGenerated) {
      query.autoGenerated = req.query.autoGenerated === 'true';
    }
  
    // Fetch drafts with pagination
    const skip = (page - 1) * limit;
    
    try {
      const [drafts, total] = await Promise.all([
        emailModels.Draft.find(query)
          .sort({ updatedAt: -1, createdAt: -1 }) // Sort by updated first, then created date
          .skip(skip)
          .limit(limit)
          .lean(),
        emailModels.Draft.countDocuments(query),
      ]);
  
      logger.info(`Found ${drafts.length} drafts (total: ${total})`, { email });
  
      // Process drafts to ensure body is properly formatted
      const processedDrafts = drafts.map((draft) => {
        // Ensure draft has an ID
        if (!draft._id) {
          logger.warn("Draft missing _id field", { draftId: draft.draftId });
        }
        
        // Ensure body exists and has both text and html
        if (!draft.body) {
          draft.body = { text: "", html: "" };
        }
  
        if (typeof draft.body === "string") {
          const text = draft.body;
          draft.body = {
            text,
            html: EmailController.convertPlainTextToHtml(text),
          };
        }
  
        // Ensure both formats exist
        if (!draft.body.html && draft.body.text) {
          draft.body.html = EmailController.convertPlainTextToHtml(
            draft.body.text
          );
        }
  
        if (!draft.body.text && draft.body.html) {
          draft.body.text = EmailController.extractTextFromHtml(draft.body.html);
        }
        
        // Make sure we have subject
        if (!draft.subject) {
          draft.subject = "(No Subject)";
        }
        
        // Ensure all required fields exist
        return {
          ...draft,
          status: draft.status || 'pending',
          createdAt: draft.createdAt || new Date(),
          updatedAt: draft.updatedAt || draft.createdAt || new Date(),
          autoGenerated: !!draft.autoGenerated,
          aiGenerated: !!draft.aiGenerated,
        };
      });
  
      res.json({
        drafts: processedDrafts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error("Error fetching drafts", { email, error: error.message });
      res.status(500).json({ 
        error: "Failed to fetch drafts", 
        message: error.message 
      });
    }
  });

  /**
   * Get sent emails for a specific email account
   */
  static getSentEmails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    const { page = 1, limit = 50 } = req.query;
  
    logger.info("Getting sent emails for", { email, page, limit });
  
    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: "Connected email not found" });
    }
  
    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());
  
    // Fetch sent emails with pagination
    const skip = (page - 1) * limit;
    const [sentEmails, total] = await Promise.all([
      emailModels.Sent.find()
        .sort({ dateSent: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      emailModels.Sent.countDocuments(),
    ]);
  
    // Process sent emails to ensure consistent format, just like regular emails
    const processedSentEmails = sentEmails.map(email => {
      return EmailController.processEmailBody(email);
    });
  
    logger.info(`Found ${processedSentEmails.length} sent emails (total: ${total})`);
  
    res.json({
      sent: processedSentEmails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  /**
   * Mark email as read
   */
  // In backend/emails/controllers/emailController.js
  static markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email, messageId } = req.params;

    console.log("🚀🚀 Marking email as read", email, messageId);

    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: "Connected email not found" });
    }

    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());

    // Try to find the email by all possible ID fields
    const email_doc = await emailModels.Email.findOne({
      $or: [{ messageId: messageId }, { _id: messageId }, { id: messageId }],
    });

    if (!email_doc) {
      console.log("🚀🚀 Email not found when trying to mark as read", {
        email,
        messageId,
        availableIds: "Trying messageId, _id, and id fields",
      });

      // For debugging: Let's log a sample email to see what fields exist
      const sampleEmail = await emailModels.Email.findOne({}).lean();
      console.log("Sample email document structure:", {
        idFields: {
          _id: sampleEmail?._id,
          messageId: sampleEmail?.messageId,
          id: sampleEmail?.id,
        },
      });

      return res.status(404).json({ error: "Email not found" });
    }

    // Update the found email
    const result = await emailModels.Email.findByIdAndUpdate(
      email_doc._id,
      {
        $set: { read: true },
        $currentDate: { readAt: true },
      },
      { new: true }
    ).lean();

    if (!result) {
      console.log("🚀🚀 Failed to update email", email, messageId);
      return res.status(500).json({ error: "Failed to update email" });
    }

    console.log("🚀🚀 Email marked as read successfully", email, messageId);
    res.json(result);
  });

  /**
   * Search emails
   */
  static searchEmails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;
    const { query, page = 1, limit = 50 } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: "Connected email not found" });
    }

    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());

    // Perform search with pagination
    const skip = (page - 1) * limit;
    const searchQuery = { $text: { $search: query } };

    const [results, total] = await Promise.all([
      emailModels.Email.find(searchQuery)
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit)
        .lean(),
      emailModels.Email.countDocuments(searchQuery),
    ]);

    res.json({
      results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  /**
   * Debug helper to analyze email structure
   */
  static debugEmailStructure = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email, messageId } = req.params;

    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: "Connected email not found" });
    }

    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());

    // Get a raw email document to analyze its structure
    const emailDoc = await emailModels.Email.findOne(
      messageId ? { messageId } : {}
    );

    if (!emailDoc) {
      return res.status(404).json({ error: "No emails found to analyze" });
    }

    // Extract document structure
    const rawDoc = emailDoc.toObject();

    // Analyze body structure
    const bodyAnalysis = {
      exists: !!rawDoc.body,
      type: typeof rawDoc.body,
      keys: rawDoc.body ? Object.keys(rawDoc.body) : [],
      hasText: rawDoc.body?.text !== undefined,
      hasHtml: rawDoc.body?.html !== undefined,
      textType: typeof rawDoc.body?.text,
      htmlType: typeof rawDoc.body?.html,
      textLength: rawDoc.body?.text?.length || 0,
      htmlLength: rawDoc.body?.html?.length || 0,
      textSample: rawDoc.body?.text?.substring(0, 100) || "",
      htmlSample: rawDoc.body?.html?.substring(0, 100) || "",
      hasSnippet: !!rawDoc.snippet,
      hasHtmlPreview: !!rawDoc.html_preview,
    };

    // Get schema information
    const schemaInfo = {
      paths: Object.keys(emailDoc.schema.paths),
      bodyPath: emailDoc.schema.paths.body
        ? {
            type: emailDoc.schema.paths.body.instance,
            schema: emailDoc.schema.paths.body.schema
              ? Object.keys(emailDoc.schema.paths.body.schema.paths)
              : "No subschema",
          }
        : "Not defined",
    };

    res.json({
      messageId: rawDoc.messageId,
      bodyAnalysis,
      schemaInfo,
      otherFields: Object.keys(rawDoc),
    });
  });

  /**
   * Fix broken emails - utility to repair missing body content
   */
  static fixBrokenEmails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;

    logger.info("Fixing broken emails", { email });

    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: "Connected email not found" });
    }

    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());

    // Find emails with missing or malformed body
    const brokenEmails = await emailModels.Email.find({
      $or: [
        { body: { $exists: false } },
        { body: null },
        { body: "" },
        { "body.text": { $exists: false } },
        { "body.html": { $exists: false } },
      ],
    }).lean();

    logger.info(
      `Found ${brokenEmails.length} emails with missing or malformed body`
    );

    // Fix each broken email
    const results = {
      totalFixed: 0,
      details: [],
    };

    for (const brokenEmail of brokenEmails) {
      try {
        // Create a fixed version of the email
        const fixedEmail = EmailController.processEmailBody(brokenEmail);

        // Update the database with the fixed email
        await emailModels.Email.findByIdAndUpdate(brokenEmail._id, {
          $set: {
            body: fixedEmail.body,
            snippet: fixedEmail.snippet || brokenEmail.snippet,
            html_preview: fixedEmail.html_preview || brokenEmail.html_preview,
          },
        });

        results.totalFixed++;
        results.details.push({
          messageId: brokenEmail.messageId,
          status: "fixed",
        });
      } catch (error) {
        logger.error("Error fixing email", {
          messageId: brokenEmail.messageId,
          error: error.message,
        });

        results.details.push({
          messageId: brokenEmail.messageId,
          status: "error",
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Fixed ${results.totalFixed} out of ${brokenEmails.length} broken emails`,
      results,
    });
  });

  // Star email - mark as important
  static starEmail = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email, messageId } = req.params;

    console.log("🌟🌟 Starring email", email, messageId);

    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: "Connected email not found" });
    }

    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());

    // Try to find the email by all possible ID fields
    const email_doc = await emailModels.Email.findOne({
      $or: [{ messageId: messageId }, { _id: messageId }, { id: messageId }],
    });

    if (!email_doc) {
      console.log("🌟🌟 Email not found when trying to star", {
        email,
        messageId,
        availableIds: "Trying messageId, _id, and id fields",
      });

      // For debugging: Let's log a sample email to see what fields exist
      const sampleEmail = await emailModels.Email.findOne({}).lean();
      console.log("Sample email document structure:", {
        idFields: {
          _id: sampleEmail?._id,
          messageId: sampleEmail?.messageId,
          id: sampleEmail?.id,
        },
      });

      return res.status(404).json({ error: "Email not found" });
    }

    // Update the found email
    const result = await emailModels.Email.findByIdAndUpdate(
      email_doc._id,
      { $set: { starred: true } },
      { new: true }
    ).lean();

    if (!result) {
      console.log("🌟🌟 Failed to update email", email, messageId);
      return res.status(500).json({ error: "Failed to update email" });
    }

    console.log("🌟🌟 Email starred successfully", email, messageId);
    res.json(result);
  });

  // Delete email
  static deleteEmail = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email, messageId } = req.params;

    console.log("🗑️🗑️ Deleting email", email, messageId);

    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: "Connected email not found" });
    }

    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());

    // Try to find the email by all possible ID fields
    const email_doc = await emailModels.Email.findOne({
      $or: [{ messageId: messageId }, { _id: messageId }, { id: messageId }],
    });

    if (!email_doc) {
      console.log("🗑️🗑️ Email not found when trying to delete", {
        email,
        messageId,
        availableIds: "Trying messageId, _id, and id fields",
      });

      // For debugging: Let's log a sample email to see what fields exist
      const sampleEmail = await emailModels.Email.findOne({}).lean();
      console.log("Sample email document structure:", {
        idFields: {
          _id: sampleEmail?._id,
          messageId: sampleEmail?.messageId,
          id: sampleEmail?.id,
        },
      });

      return res.status(404).json({ error: "Email not found" });
    }

    // Delete the found email
    await emailModels.Email.findByIdAndDelete(email_doc._id);

    console.log("🗑️🗑️ Email deleted successfully", email, messageId);
    res.json({ success: true });
  });

  // Mark email as unread
  static markAsUnread = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email, messageId } = req.params;

    console.log("🔵🔵 Marking email as unread", email, messageId);

    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: "Connected email not found" });
    }

    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());

    // Try to find the email by all possible ID fields
    const email_doc = await emailModels.Email.findOne({
      $or: [{ messageId: messageId }, { _id: messageId }, { id: messageId }],
    });

    if (!email_doc) {
      console.log("🔵🔵 Email not found when trying to mark as unread", {
        email,
        messageId,
        availableIds: "Trying messageId, _id, and id fields",
      });

      // For debugging: Let's log a sample email to see what fields exist
      const sampleEmail = await emailModels.Email.findOne({}).lean();
      console.log("Sample email document structure:", {
        idFields: {
          _id: sampleEmail?._id,
          messageId: sampleEmail?.messageId,
          id: sampleEmail?.id,
        },
      });

      return res.status(404).json({ error: "Email not found" });
    }

    // Update the found email
    const result = await emailModels.Email.findByIdAndUpdate(
      email_doc._id,
      { $set: { read: false } },
      { new: true }
    ).lean();

    if (!result) {
      console.log("🔵🔵 Failed to update email", email, messageId);
      return res.status(500).json({ error: "Failed to update email" });
    }

    console.log("🔵🔵 Email marked as unread successfully", email, messageId);
    res.json(result);
  });

  // Mark all emails as read
  static markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { email } = req.params;

    console.log("🔵🔵 Marking all emails as read", email);

    // Get the connected email account
    const account = await ConnectedEmail.findOne({ userId, email });
    if (!account) {
      return res.status(404).json({ error: "Connected email not found" });
    }

    // Get models for this email account
    const emailModels = getConnectedEmailModels(account._id.toString());

    // Mark all emails as read
    const result = await emailModels.Email.updateMany(
      { read: false },
      { $set: { read: true }, $currentDate: { readAt: true } }
    );

    console.log("🔵🔵 Marked all emails as read successfully", email);
    res.json({ success: true, totalUpdated: result.nModified });
  });
}

EmailController.processEmailBody = function (emailDoc) {
  if (!emailDoc) return null;

  // Make a copy to avoid modifying the original
  const processedEmail = { ...emailDoc };

  // Process body field
  // Case 1: Body is completely missing
  if (!processedEmail.body) {
    // Create body from snippet or other available data
    processedEmail.body = {
      text: processedEmail.snippet || "",
      html: processedEmail.html_preview || "",
    };
  }

  // Case 2: Body is a string (older format)
  if (typeof processedEmail.body === "string") {
    const bodyText = processedEmail.body;
    processedEmail.body = {
      text: bodyText,
      html: EmailController.convertPlainTextToHtml(bodyText),
    };
  }

  // Case 3: Body is an object but missing text or html
  if (typeof processedEmail.body === "object") {
    // Ensure text property exists
    if (!processedEmail.body.text && processedEmail.body.html) {
      processedEmail.body.text = EmailController.extractTextFromHtml(
        processedEmail.body.html
      );
    }

    // Ensure html property exists
    if (!processedEmail.body.html && processedEmail.body.text) {
      processedEmail.body.html = EmailController.convertPlainTextToHtml(
        processedEmail.body.text
      );
    }
  }

  // Generate snippet if missing
  if (!processedEmail.snippet && processedEmail.body.text) {
    processedEmail.snippet = processedEmail.body.text
      .substring(0, 150)
      .replace(/\s+/g, " ")
      .trim();
  }

  // Generate html_preview if missing
  if (!processedEmail.html_preview && processedEmail.body.html) {
    processedEmail.html_preview = processedEmail.body.html.substring(0, 1000);
  }

  // Enhance HTML for better viewing with Gmail-like experience
  if (processedEmail.body && processedEmail.body.html) {
    processedEmail.body.html = EmailController.enhanceHtmlForViewing(
      processedEmail.body.html
    );
  }

  return processedEmail;
};

/**
 * Enhance HTML for better viewing with Gmail-like experience
 * Makes emails display correctly while preserving original formatting
 */
EmailController.enhanceHtmlForViewing = function (html) {
  if (!html) return "";

  // If HTML doesn't have basic structure, add it
  let enhancedHtml = html;

  // Only process if we don't break existing structure
  if (!html.includes("<!DOCTYPE") && !html.includes("<html")) {
    // Wrap content in proper HTML structure if not already
    enhancedHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.5;
      color: #222;
      margin: 0;
      padding: 10px;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    a {
      color: #1a73e8;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    /* Fix for Outlook and similar email clients */
    .ExternalClass {
      width: 100%;
    }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {
      line-height: 100%;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
  } else if (html.includes("<body") && !html.includes("max-width: 100%")) {
    // If body exists but no basic styles, try to inject styles without breaking structure
    enhancedHtml = html.replace(
      "<head>",
      `<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    img { max-width: 100%; height: auto; }
    body { font-family: Arial, sans-serif; line-height: 1.5; color: #222; }
    a { color: #1a73e8; }
  </style>`
    );
  }

  // Ensure all links open in a new tab
  enhancedHtml = enhancedHtml.replace(
    /<a\s+(?![^>]*\btarget=)/gi,
    '<a target="_blank" rel="noopener noreferrer" '
  );

  // Fix common HTML email issues
  enhancedHtml = enhancedHtml
    // Fix invalid nesting that breaks rendering
    .replace(/<\/?(font|span|div)\s*>\s*<\/?(font|span|div)>/gi, " ")
    // Remove potentially harmful scripts
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Make all image URLs absolute if they're relative
    .replace(
      /(<img[^>]+src=["'])(?!https?:\/\/|data:)([^"']+)(["'][^>]*>)/gi,
      (match, prefix, url, suffix) => {
        // Attempt to make relative URLs absolute - simplified example
        if (url.startsWith("/")) {
          return match; // Already absolute to domain root
        }
        return match; // In a real implementation, you'd convert to absolute URL
      }
    );

  return enhancedHtml;
};

EmailController.convertPlainTextToHtml = function (text) {
  if (!text) return "";

  // Replace newlines with HTML line breaks
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r\n/g, "<br>")
    .replace(/\n/g, "<br>")
    .replace(/\r/g, "<br>");

  // Auto-link URLs
  html = html.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Wrap in a div for better styling
  return `<div style="font-family: Arial, sans-serif; line-height: 1.5;">${html}</div>`;
};

EmailController.extractTextFromHtml = function (html) {
  if (!html) return "";

  // Simple HTML tag stripper for basic cases
  return html
    .replace(/<[^>]*>/g, " ") // Replace tags with spaces
    .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
    .replace(/&amp;/g, "&") // Replace entities
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
};

export default EmailController;
