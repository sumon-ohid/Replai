import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import ConnectedEmail from "../../models/ConnectedEmail.js";
import getConnectedEmailModels from "../../models/ConnectedEmailModels.js";
import { processEmailContent } from "./emailProcessingService.js";
import {
  parseEmailAddress,
  extractPlainTextBody,
  extractHtmlBody,
} from "../utils/emailParser.js";
import connectionManager from "../managers/connectionManager.js";
import NotificationManager from "../managers/notificationManager.js";
import { read } from "fs";

/**
 * Improved email address parser
 * @param {string} emailString - The raw email address string (e.g. "John Doe <john@example.com>")
 * @returns {{name: string, email: string}} Parsed name and email
 */
function parseEmailAddressImproved(emailString) {
  if (!emailString) return { name: "", email: "" };

  // Try to extract using regex for "Name <email>" format
  const nameEmailRegex = /^(.*?)\s*<([^>]+)>$/;
  const match = emailString.match(nameEmailRegex);

  if (match) {
    return {
      name: match[1].trim().replace(/"/g, ""), // Remove quotes from name
      email: match[2].trim().toLowerCase(),
    };
  }

  // If no match, assume it's just an email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
  const emailMatch = emailString.match(emailRegex);

  if (emailMatch) {
    return {
      name:
        emailString.replace(emailMatch[0], "").trim() ||
        emailMatch[0].split("@")[0],
      email: emailMatch[0].toLowerCase(),
    };
  }

  // Fallback
  return {
    name: emailString.split("@")[0] || "",
    email: emailString.includes("@")
      ? emailString.trim()
      : `${emailString.trim()}@unknown.com`,
  };
}

/**
 * Parse a comma-separated list of email addresses
 * @param {string} addressesString - Comma-separated list of email addresses
 * @returns {Array<{name: string, email: string}>} Array of parsed emails
 */
function parseEmailList(addressesString) {
  if (!addressesString) return [];

  // Split by commas but respect quotes
  const addresses = [];
  let currentAddress = "";
  let inQuotes = false;

  for (let i = 0; i < addressesString.length; i++) {
    const char = addressesString[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      currentAddress += char;
    } else if (char === "," && !inQuotes) {
      addresses.push(currentAddress.trim());
      currentAddress = "";
    } else {
      currentAddress += char;
    }
  }

  if (currentAddress.trim()) {
    addresses.push(currentAddress.trim());
  }

  // Parse each address
  return addresses.map((addr) => parseEmailAddressImproved(addr));
}

/**
 * Extract email body more reliably
 * @param {Object} message - The Gmail message object
 * @returns {{text: string, html: string}} The extracted email bodies
 */
function extractEmailBodies(message) {
  try {
    let textBody = "";
    let htmlBody = "";

    // Helper function to recursively process parts
    function processParts(parts) {
      if (!parts) return;

      for (const part of parts) {
        // Get the mime type
        const mimeType = part.mimeType || "";

        // Handle the part based on mime type
        if (mimeType === "text/plain" && part.body?.data) {
          try {
            const decodedText = Buffer.from(part.body.data, "base64").toString(
              "utf-8"
            );
            textBody = decodedText;
          } catch (err) {
            console.warn("Error decoding text body:", err);
          }
        } else if (mimeType === "text/html" && part.body?.data) {
          try {
            const decodedHtml = Buffer.from(part.body.data, "base64").toString(
              "utf-8"
            );
            htmlBody = decodedHtml;
          } catch (err) {
            console.warn("Error decoding HTML body:", err);
          }
        } else if (mimeType.startsWith("multipart/") && part.parts) {
          // Recursively process nested parts
          processParts(part.parts);
        }
      }
    }

    // Check if we have a payload with data directly
    if (message.payload.body?.data) {
      try {
        const bodyData = Buffer.from(
          message.payload.body.data,
          "base64"
        ).toString("utf-8");

        // Try to detect if it's HTML
        if (
          bodyData.includes("<html") ||
          bodyData.includes("<body") ||
          bodyData.includes("<div")
        ) {
          htmlBody = bodyData;
        } else {
          textBody = bodyData;
        }
      } catch (err) {
        console.warn("Error decoding direct body data:", err);
      }
    }

    // Process parts if available
    if (message.payload.parts) {
      processParts(message.payload.parts);
    }

    // Return at least an empty object
    return {
      text: textBody || "",
      html: htmlBody || "",
    };
  } catch (error) {
    console.error("Error extracting email bodies:", error);
    // Return empty body to prevent null errors
    return { text: "", html: "" };
  }
}

/**
 * Safely sanitize and prepare text for MongoDB storage
 * @param {string} text - The text to sanitize
 * @param {number} maxLength - Maximum length to keep
 * @returns {string} - Sanitized text
 */
function sanitizeForMongoDB(text, maxLength = 100000) {
  if (!text) return "";

  // Ensure text is a string
  if (typeof text !== "string") {
    try {
      text = String(text);
    } catch (e) {
      console.error("Cannot convert body to string:", e);
      return "";
    }
  }

  // Truncate if too long
  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + "... [content truncated due to size]";
  }

  // Replace null characters which MongoDB doesn't allow
  text = text.replace(/\u0000/g, "");

  // Handle other problematic characters (optional)
  text = text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g, "");

  return text;
}

/**
 * Process a single Google message
 */
export async function processGoogleMessage(
  gmail,
  userId,
  userEmail,
  messageId,
  config = {}
) {
  try {
    // Ensure connected email exists and is active
    const connectedEmail = await ConnectedEmail.findOne({
      userId,
      email: userEmail,
      provider: "google",
      "tokens.refreshToken": { $exists: true },
    });

    if (!connectedEmail) {
      throw new Error("Connected email account not found");
    }

    if (connectedEmail.status !== "active") {
      if (connectedEmail.status === "paused") {
        console.log(`Skipping reactivation for paused account: ${userEmail}`);
        return;
      }

      await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
        status: "active",
        lastConnected: new Date(),
        $unset: { disconnectedAt: "", lastError: "" },
      });
    }

    const emailModels = getConnectedEmailModels(connectedEmail._id.toString());

    // Check if message already exists
    const existingEmail = await emailModels.Email.findOne({
      $or: [{ messageId }, { externalMessageId: messageId }],
    });
    if (existingEmail) {
      console.log(`Email with messageId ${messageId} already exists`);
      return existingEmail;
    }

    console.log(`Processing message: ${messageId}`);

    // Fetch the full message
    const messageResponse = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const message = messageResponse.data;
    if (!message.payload) {
      console.warn(`Message payload is undefined for messageId: ${messageId}`);
      return;
    }

    const headers = message.payload.headers || [];
    const getHeaderValue = (name) =>
      headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ||
      "";

    const subject = getHeaderValue("subject");
    const from = getHeaderValue("from");
    const to = getHeaderValue("to");
    const cc = getHeaderValue("cc");
    const bcc = getHeaderValue("bcc");
    const replyTo = getHeaderValue("reply-to");
    const messageIdHeader = getHeaderValue("message-id");
    const date = getHeaderValue("date");

    console.log(`Parsing email: ${from} -> ${to} (${subject})`);

    const parsedFrom = parseEmailAddressImproved(from);
    const parsedTo = parseEmailList(to);
    const parsedCc = parseEmailList(cc);
    const parsedBcc = parseEmailList(bcc);
    const parsedReplyTo = parseEmailAddressImproved(replyTo);

    const { text: bodyText, html: bodyHtml } = extractEmailBodies(message);

    if (!bodyText && !bodyHtml) {
      console.warn(`Email body is undefined for messageId: ${messageId}`);
    }

    const sanitizedText = sanitizeForMongoDB(bodyText || "", 50000);
    const sanitizedHtml = sanitizeForMongoDB(bodyHtml || "", 100000);

    const snippet =
      message.snippet ||
      sanitizedText.substring(0, 150).replace(/\s+/g, " ").trim() ||
      "(No preview available)";

    const gmailLabels = message.labelIds || [];
    const folder = determineEmailCategory(message);

    const attachments = processAttachments(message);

    const emailData = {
      userId,
      messageId: message.id,
      threadId: message.threadId || message.id,
      externalMessageId: messageIdHeader || message.id,
      provider: "google",
      providerId: message.id,
      from: {
        email: parsedFrom.email || "unknown@example.com",
        name: sanitizeForMongoDB(
          parsedFrom.name || parsedFrom.email.split("@")[0] || "Unknown Sender",
          100
        ),
      },
      to: parsedTo.map((recipient) => ({
        email: recipient.email || "",
        name: sanitizeForMongoDB(
          recipient.name || recipient.email.split("@")[0] || "",
          100
        ),
      })),
      cc: parsedCc.map((recipient) => ({
        email: recipient.email || "",
        name: sanitizeForMongoDB(
          recipient.name || recipient.email.split("@")[0] || "",
          100
        ),
      })),
      bcc: parsedBcc.map((recipient) => ({
        email: recipient.email || "",
        name: sanitizeForMongoDB(
          recipient.name || recipient.email.split("@")[0] || "",
          100
        ),
      })),
      replyTo: parsedReplyTo.email
        ? {
            email: parsedReplyTo.email,
            name: sanitizeForMongoDB(
              parsedReplyTo.name || parsedReplyTo.email.split("@")[0] || "",
              100
            ),
          }
        : null,
      subject: sanitizeForMongoDB(subject || "(No Subject)", 500),
      date: new Date(date || Date.now()),
      receivedAt: new Date(),
      body: { text: sanitizedText, html: sanitizedHtml },
      html_preview: sanitizedHtml ? sanitizedHtml.substring(0, 1000) : "",
      snippet: sanitizeForMongoDB(snippet, 200),
      read: !gmailLabels.includes("UNREAD"),
      starred: gmailLabels.includes("STARRED"),
      folder,
      labels: gmailLabels,
      attachments: attachments || [],
    };

    console.log(
      `Prepared email for saving: ${emailData.from.name} <${emailData.from.email}> - ${emailData.subject}`
    );

    if (config.processContent !== false) {
      try {
        const processedData = await processEmailContent({
          ...emailData,
          userEmail,
        });

        if (processedData.category) {
          const validCategories = [
            "inbox",
            "sent",
            "draft",
            "trash",
            "spam",
            "important",
            "social",
            "promotions",
            "updates",
            "forums",
            "work",
            "personal",
          ];

          emailData.category = validCategories.includes(processedData.category)
            ? processedData.category
            : emailData.folder;
        }

        Object.assign(emailData, processedData);
      } catch (processError) {
        console.error("Error processing email content:", processError);
      }
    }

    const savedEmail = await emailModels.Email.findOneAndUpdate(
      { messageId: message.id },
      { $set: emailData },
      { upsert: true, new: true }
    );

    console.log(`Email saved successfully with ID: ${savedEmail._id}`);

    if (!gmailLabels.includes("UNREAD")) {
      try {
        await gmail.users.messages.modify({
          userId: "me",
          id: messageId,
          requestBody: { removeLabelIds: ["UNREAD"] },
        });
        console.log(`Marked email ${messageId} as read in Gmail`);
      } catch (markReadError) {
        console.error(
          `Failed to mark email ${messageId} as read:`,
          markReadError
        );
      }
    }

    return savedEmail;
  } catch (error) {
    console.error("Error processing Google message:", error);
    throw error;
  }
}

/**
 * Improved attachment processing with error handling
 */
function processAttachments(message) {
  try {
    const attachments = [];

    // Helper function to recursively process parts
    function processParts(parts, parentName = "") {
      if (!parts) return;

      for (const part of parts) {
        // Check if this part is an attachment
        if (part.filename && part.filename.length > 0) {
          try {
            attachments.push({
              filename: sanitizeForMongoDB(part.filename, 255),
              contentType: part.mimeType || "application/octet-stream",
              size: part.body?.size || 0,
              attachmentId: part.body?.attachmentId || null,
              partId: part.partId || null,
              contentId:
                part.headers?.find((h) => h.name.toLowerCase() === "content-id")
                  ?.value || null,
            });
          } catch (error) {
            console.warn("Error processing attachment:", error);
          }
        }

        // Recursively process nested parts
        if (part.parts) {
          processParts(
            part.parts,
            parentName + (part.partId ? "." + part.partId : "")
          );
        }
      }
    }

    // Process message parts
    if (message.payload.parts) {
      processParts(message.payload.parts);
    }

    return attachments;
  } catch (error) {
    console.error("Error processing attachments:", error);
    return []; // Return empty array on error
  }
}

/**
 * Helper to determine category from Gmail labels
 * Returns only valid email categories according to the schema
 */
function determineEmailCategory(message) {
  if (!message.labelIds) return "inbox";

  // Define valid categories that match your Mongoose schema
  const validCategories = [
    "inbox",
    "sent",
    "draft",
    "trash",
    "spam",
    "important",
    "social",
    "promotions",
    "updates",
    "forums",
    "work",
    "personal",
  ];

  // First, try to map Gmail categories to our system
  let category = "inbox"; // Default category

  if (message.labelIds.includes("SENT")) category = "sent";
  else if (message.labelIds.includes("DRAFT")) category = "draft";
  else if (message.labelIds.includes("TRASH")) category = "trash";
  else if (message.labelIds.includes("SPAM")) category = "spam";
  else if (message.labelIds.includes("IMPORTANT")) category = "important";
  else if (message.labelIds.includes("CATEGORY_SOCIAL")) category = "social";
  else if (message.labelIds.includes("CATEGORY_PROMOTIONS"))
    category = "promotions";
  else if (message.labelIds.includes("CATEGORY_UPDATES")) category = "updates";
  else if (message.labelIds.includes("CATEGORY_FORUMS")) category = "forums";

  // Ensure the category is valid according to our schema
  if (!validCategories.includes(category)) {
    console.warn(
      `Invalid category "${category}" detected, defaulting to "inbox"`
    );
    category = "inbox";
  }

  return category;
}

/**
 * Initialize a Google email connection
 */
export async function initializeGoogleConnection(
  userId,
  email,
  refreshToken,
  accessToken = null,
  config = {}
) {
  try {
    console.log("Initializing Google connection:", { email });

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
      access_token: accessToken,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Test connection
    await gmail.users.getProfile({ userId: "me" });

    // Get ConnectedEmail record (don't check status as it may be pending)
    const connectedEmail = await ConnectedEmail.findOne({
      userId,
      email,
      provider: "google",
    });
    if (!connectedEmail) {
      throw new Error(
        "Connected email record not found. Please reconnect the account."
      );
    }

    // Update status to active if connection is successful
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      status: "active",
      lastConnected: new Date(),
    });

    // Initialize models
    getConnectedEmailModels(connectedEmail._id.toString());

    // Start sync process
    if (config.syncEnabled !== false) {
      // Do initial sync first
      await checkForNewGoogleEmails(gmail, userId, email, config);

      // Then set up interval for future checks (will start after 60 seconds)
      const interval = setTimeout(function runCheck() {
        checkForNewGoogleEmails(gmail, userId, email, config)
          .then(() => {
            // Schedule the next check only after this one completes
            setTimeout(runCheck, 60000);
          })
          .catch((error) => {
            console.error(`Error in scheduled email check: ${error}`);
            // Still schedule the next check even if this one fails
            setTimeout(runCheck, 60000);
          });
      }, 60000); // First scheduled check after 60 seconds

      // Register connection
      connectionManager.addConnection(userId, email, "google", {
        gmail,
        oauth2Client,
        interval, // Store the timeout ID instead
        config,
      });
    }

    // Send a notification to the user
    //  await NotificationManager.createNotification({
    //   userId: userId,
    //   type: "info",
    //   title: "New Email Account Connected",
    //   message:
    //     `Your Google account ${email} has been successfully connected.`,
    //   metadata: {
    //     category: "email",
    //     action: "connected",
    //     url: "/email-manager",
    //     timestamp: new Date().toISOString(),
    //   },
    // });

    return true;
  } catch (error) {
    console.error("Error initializing Google connection:", error);

    // Update status to error if connection fails
    try {
      const connectedEmail = await ConnectedEmail.findOne({
        userId,
        email,
        provider: "google",
      });
      if (connectedEmail) {
        await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
          status: "error",
          lastError: {
            message: error.message || "Connection initialization failed",
            date: new Date(),
            code: "INIT_ERROR",
          },
        });
      }
    } catch (dbError) {
      console.error("Failed to update email error status:", dbError);
    }

    throw error;
  }
}

/**
 * Check for new Google emails with robust error handling
 */
export async function checkForNewGoogleEmails(
  gmail,
  userId,
  email,
  config = {}
) {
  try {
    // Get ConnectedEmail record for collections with more lenient check
    const connectedEmail = await ConnectedEmail.findOne({
      userId,
      email,
      provider: "google",
      "tokens.refreshToken": { $exists: true },
    });

    if (!connectedEmail) {
      console.log(`Connected email not found: ${email}`);
      return [];
    }

    // If account exists but status isn't active, try to reactivate
    if (connectedEmail.status !== "active") {
      // Skip paused accounts
      if (connectedEmail.status === "paused") {
        console.log(`Skipping sync for paused account: ${email}`);
        return [];
      }

      console.log(
        `Found inactive account for ${email}, attempting to reactivate...`
      );

      // Re-activate the account
      // await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      //   status: "active",
      //   lastConnected: new Date(),
      //   $unset: {
      //     disconnectedAt: "",
      //     lastError: "",
      //   },
      // });
    }

    // Get connection time or last sync time to use as reference point
    const referenceTime =
      connectedEmail.lastConnected || connectedEmail.createdAt;

    // Format the date for Gmail query (RFC 3339 format)
    const afterDateStr = referenceTime.toISOString().split("T")[0]; // YYYY-MM-DD format

    // Build Gmail query to get only unread emails after the connection time
    const query = `is:unread after:${afterDateStr}`;
    console.log(`[${email}] Querying emails with: ${query}`);

    // List recent unread messages that arrived after connection time
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20,
      q: query,
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      console.log(`[${email}] No new unread emails to sync`);

      // Update last sync time even if no messages
      await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
        "stats.lastSync": new Date(),
      });

      return [];
    }

    console.log(
      `[${email}] Found ${response.data.messages.length} new unread messages to sync`
    );

    // Process messages
    const processedMessages = [];
    const errors = [];

    for (const message of response.data.messages) {
      try {
        const processed = await processGoogleMessage(
          gmail,
          userId,
          email,
          message.id,
          config
        );
        if (processed) processedMessages.push(processed);
      } catch (error) {
        console.error(
          `[${email}] Error processing message ${message.id}:`,
          error
        );
        errors.push({
          messageId: message.id,
          error: error.message,
        });
      }
    }

    // Update sync stats
    await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
      "stats.lastSync": new Date(),
      $inc: { "stats.totalEmails": processedMessages.length },
    });

    // Log any errors for debugging
    if (errors.length > 0) {
      console.warn(
        `[${email}] ${errors.length} messages had errors during sync:`,
        errors
      );
    }

    return processedMessages;
  } catch (error) {
    console.error(`[${email}] Error checking Google emails:`, error);

    // Update error status in database
    try {
      await ConnectedEmail.findOneAndUpdate(
        { userId, email, provider: "google" },
        {
          $set: {
            lastError: {
              message: error.message,
              date: new Date(),
              code: "SYNC_ERROR",
            },
          },
        }
      );
    } catch (dbError) {
      console.error(`[${email}] Failed to update error status:`, dbError);
    }

    throw error;
  }
}

/**
 * Send an email using Gmail API
 */

export async function sendEmail(connection, email) {
  try {
    console.log(
      "Sending email with connection:",
      connection ? "Connection exists" : "No connection"
    );

    // Check connection structure
    if (!connection) {
      throw new Error("Email connection not provided");
    }

    // The connection might be directly the connection object or nested inside a connection property
    const gmailConnection =
      connection.gmail ||
      (connection.connection && connection.connection.gmail);

    if (!gmailConnection) {
      console.error(
        "Connection structure:",
        JSON.stringify(connection, null, 2)
      );
      throw new Error("Gmail connection not properly initialized");
    }

    // Properly format email addresses
    const formatEmailAddress = (address) => {
      if (typeof address === "string") {
        // If it already has angle brackets, return as is
        if (address.includes("<") && address.includes(">")) {
          return address;
        }

        // If it's just an email address, add default name
        if (address.includes("@")) {
          const name = address.split("@")[0];
          return `${name} <${address}>`;
        }

        return address; // Return as is if we can't determine format
      }

      // If it's an array of addresses
      if (Array.isArray(address)) {
        return address
          .map((addr) => {
            if (typeof addr === "string") return formatEmailAddress(addr);
            const name = addr.name || addr.email.split("@")[0];
            return `${name} <${addr.email}>`;
          })
          .join(", ");
      }

      // If it's an object with email property
      if (address && address.email) {
        const name = address.name || address.email.split("@")[0];
        return `${name} <${address.email}>`;
      }

      // Fallback
      return "";
    };

    // Handle missing sentAt
    const sentAt = email.sentAt || new Date();

    // Get content - handle both string and object formats
    let content = "";
    if (typeof email.content === "string") {
      content = email.content;
    } else if (email.body && email.body.html) {
      content = email.body.html;
    } else if (email.body && email.body.text) {
      content = email.body.text;
    }

    // Convert plain text content to proper HTML with preserved line breaks
    if (
      content &&
      !content.includes("<html") &&
      !content.includes("<body") &&
      !content.includes("<div")
    ) {
      // Format plain text as HTML (preserve newlines)
      content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
  ${content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^(.+)$/, "<p>$1</p>")}
</body>
</html>`;
    }

    // Create email message in base64 format with proper headers
    const messageParts = [
      `From: ${formatEmailAddress(email.from)}`,
      `To: ${formatEmailAddress(email.to)}`,
    ];

    // Add CC if present
    if (
      email.cc &&
      (typeof email.cc === "string" ||
        (Array.isArray(email.cc) && email.cc.length > 0) ||
        email.cc.email)
    ) {
      messageParts.push(`Cc: ${formatEmailAddress(email.cc)}`);
    }

    // Add BCC if present
    if (
      email.bcc &&
      (typeof email.bcc === "string" ||
        (Array.isArray(email.bcc) && email.bcc.length > 0) ||
        email.bcc.email)
    ) {
      messageParts.push(`Bcc: ${formatEmailAddress(email.bcc)}`);
    }

    // Add subject
    messageParts.push(`Subject: ${email.subject || "(No Subject)"}`);

    // Add reply-to and in-reply-to if present
    if (email.replyTo) {
      messageParts.push(`Reply-To: ${formatEmailAddress(email.replyTo)}`);
    }

    if (email.inReplyTo) {
      messageParts.push(`In-Reply-To: ${email.inReplyTo}`);
    }

    // Add remaining headers and content
    messageParts.push(
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=utf-8",
      `Date: ${sentAt.toUTCString()}`,
      "Content-Transfer-Encoding: base64",
      "",
      Buffer.from(content || "No content provided", "utf-8").toString("base64")
    );

    const message = messageParts.join("\r\n");
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    console.log("Sending email via Gmail API");

    // Send the email
    const result = await gmailConnection.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
        threadId: email.threadId, // Include thread ID if available
      },
    });

    console.log("Email sent successfully:", result.data);

    // Return successful result
    return {
      success: true,
      messageId: result.data.id,
      threadId: result.data.threadId || email.threadId,
      labelIds: result.data.labelIds,
      raw: result.data,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Save sent email to Gmail's sent folder and local database
 */
export async function saveSentEmail(gmail, email, messageId = null) {
  try {
    // Debug the email object structure
    console.log(
      "Saving sent email - Object structure:",
      Object.keys(email),
      "Content fields:",
      {
        hasContent: !!email.content,
        hasBodyHtml: !!(email.body && email.body.html),
        hasBodyText: !!(email.body && email.body.text),
        hasResponse: !!email.response,
        hasHtmlResponse: !!(email.response && email.response.html),
        hasTextResponse: !!(email.response && email.response.text),
        hasText: !!email.text,
        hasHtml: !!email.html,
      }
    );

    // Get content - try all possible locations
    let content = "";

    // Try direct content property
    if (typeof email.content === "string" && email.content.trim() !== "") {
      console.log("Using email.content");
      content = email.content;
    }
    // Try body.html
    else if (email.body && email.body.html && email.body.html.trim() !== "") {
      console.log("Using email.body.html");
      content = email.body.html;
    }
    // Try body.text
    else if (email.body && email.body.text && email.body.text.trim() !== "") {
      console.log("Using email.body.text");
      content = email.body.text;
    }
    // Try response object (often used in automated responses)
    else if (email.response) {
      if (email.response.html && email.response.html.trim() !== "") {
        console.log("Using email.response.html");
        content = email.response.html;
      } else if (email.response.text && email.response.text.trim() !== "") {
        console.log("Using email.response.text");
        content = email.response.text;
      }
    }
    // Try direct html/text properties
    else if (email.html && email.html.trim() !== "") {
      console.log("Using email.html");
      content = email.html;
    } else if (email.text && email.text.trim() !== "") {
      console.log("Using email.text");
      content = email.text;
    }

    // Check if we have content after all attempts
    if (!content || content.trim() === "") {
      console.error(
        "Empty content in email object:",
        JSON.stringify(email, null, 2)
      );
      throw new Error("Email content cannot be empty when saving sent email");
    }

    // Convert plain text to HTML if it's not already HTML
    if (
      !content.includes("<html") &&
      !content.includes("<body") &&
      !content.includes("<div")
    ) {
      content = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
  ${content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^(.+)$/, "<p>$1</p>")}
</body>
</html>`;
    }

    // Create email message in base64 format
    const messageParts = [
      `From: ${formatEmailAddress(email.from)}`,
      `To: ${formatEmailAddress(email.to)}`,
      `Subject: ${email.subject || "(No Subject)"}`,
      `Date: ${email.sentAt?.toUTCString() || new Date().toUTCString()}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      content,
    ];

    // Helper function to format email addresses
    function formatEmailAddress(address) {
      if (typeof address === "string") {
        // If already in the right format
        if (address.includes("<") && address.includes(">")) {
          return address;
        }
        // If just an email
        if (address.includes("@")) {
          const name = address.split("@")[0];
          return `${name} <${address}>`;
        }
        return address;
      }

      if (Array.isArray(address)) {
        return address
          .map((addr) => {
            if (typeof addr === "string") return formatEmailAddress(addr);
            return `${addr.name || addr.email.split("@")[0]} <${addr.email}>`;
          })
          .join(", ");
      }

      if (address && address.email) {
        return `${address.name || address.email.split("@")[0]} <${
          address.email
        }>`;
      }

      return "";
    }

    const message = messageParts.join("\r\n");
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Insert the message into Gmail's sent folder
    const result = await gmail.users.messages.insert({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
        labelIds: ["SENT"],
      },
    });

    console.log("Email saved to Gmail's sent folder:", result.data);

    // Mark as read in Gmail
    await gmail.users.messages.modify({
      userId: "me",
      id: result.data.id,
      requestBody: {
        removeLabelIds: ["UNREAD"],
        addLabelIds: [],
      },
    });

    // Save the sent email to the local database
    if (email.userId) {
      try {
        // Find connected email account
        const ConnectedEmail = await import(
          "../../models/ConnectedEmail.js"
        ).then((module) => module.default);
        const getConnectedEmailModels = await import(
          "../../models/ConnectedEmailModels.js"
        ).then((module) => module.default);

        let senderEmail = "";
        if (typeof email.from === "string") {
          const match = email.from.match(/<([^>]+)>/);
          senderEmail = match ? match[1] : email.from;
        } else if (email.from && email.from.email) {
          senderEmail = email.from.email;
        }

        const connectedEmail = await ConnectedEmail.findOne({
          email: senderEmail,
          userId: email.userId,
        });

        if (connectedEmail) {
          // Get models for this account
          const emailModels = getConnectedEmailModels(
            connectedEmail._id.toString()
          );

          // Save to database
          const savedEmail = await emailModels.Email.findOneAndUpdate(
            { messageId: result.data.id },
            {
              $set: {
                userId: email.userId,
                messageId: result.data.id,
                threadId: result.data.threadId || messageId || email.threadId,
                externalMessageId: result.data.id,
                provider: "google",
                from: email.from,
                to: email.to,
                cc: email.cc || [],
                bcc: email.bcc || [],
                subject: email.subject || "(No Subject)",
                sentAt: email.sentAt || new Date(),
                body: {
                  text: content.replace(/<[^>]*>/g, ""),
                  html: content,
                },
                read: true,
                category: "sent",
                folder: "sent",
                labels: ["SENT"],
                sent: true,
              },
            },
            { upsert: true, new: true }
          );

          console.log(
            `Email saved to local database with ID: ${savedEmail._id}`
          );

          // Update stats
          await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
            $inc: { "stats.totalSent": 1 },
            $set: { "stats.lastSent": new Date() },
          });
        }
      } catch (dbError) {
        console.error("Error saving sent email to database:", dbError);
        // Continue since the email was saved to Gmail's sent folder
      }
    }

    return result.data;
  } catch (error) {
    console.error("Error saving sent email:", error);
    throw error;
  }
}

/**
 * Create a draft email response
 * @param {Object} connection - Gmail connection object
 * @param {Object} emailData - Email data to draft
 * @returns {Object} Draft creation result
 */
export const createDraft = async (connection, emailData) => {
  try {
    if (!connection || !connection.gmail) {
      throw new Error("No valid Gmail connection provided");
    }

    // Extract necessary data
    const { to, subject, content, from } = emailData;

    // Ensure content is not empty
    if (!content || content.trim() === "") {
      throw new Error("Email content cannot be empty when creating a draft");
    }

    // Prepare email content
    const emailContent =
      `From: ${from}\n` +
      `To: ${to}\n` +
      `Subject: ${subject || "(No Subject)"}\n\n` +
      `${content}`;

    // Base64 encode the email content
    const encodedEmail = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Create the draft using Gmail API
    const response = await connection.gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw: encodedEmail,
        },
      },
    });

    console.log(`Draft created successfully with ID: ${response.data.id}`);

    return {
      success: true,
      draftId: response.data.id,
      messageId: response.data.message?.id || null,
      threadId: response.data.message?.threadId || null,
    };
  } catch (error) {
    console.error("Error creating draft email:", error);
    throw new Error(`Failed to create draft: ${error.message}`);
  }
};

export default {
  initializeGoogleConnection,
  processGoogleMessage,
  checkForNewGoogleEmails,
  saveSentEmail,
  sendEmail,
  createDraft,
};
