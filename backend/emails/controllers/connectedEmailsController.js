import mongoose from "mongoose";
import User from "../../models/User.js";
import {
  getConnection,
  updateConnectionConfig,
} from "../managers/connectionManager.js";

/**
 * Get all connected email accounts for a user
 */
export const getConnectedEmails = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Fetching connected emails for user:", userId);

    const user = await User.findById(userId).select(
      "connectedEmails emailPreferences"
    );

    if (!user || !user.connectedEmails) {
      console.log("No connected emails found for user:", userId);
      return res.json([]);
    }

    // Map connected emails to include additional status information
    const connectedEmails = user.connectedEmails.map((email) => {
      const emailAddress = email.email;
      const preferences = user.emailPreferences?.[emailAddress] || {};

      // Get connection status
      const connection = getConnection(userId, emailAddress);
      
      const mappedEmail = {
        _id: email._id.toString(), // Convert ObjectId to string
        email: emailAddress,
        provider: email.provider || "google",
        connected: email.connected || true,
        connectedAt: email.connectedAt || new Date(),
        syncEnabled: preferences.syncEnabled !== false,
        autoReplyEnabled: preferences.mode === "auto-reply",
        aiEnabled: preferences.aiEnabled || false, // Include AI enabled status
        mode: preferences.mode || "auto-reply",
        lastSync: connection?.lastSync || email.lastSync || null,
        status: connection ? (connection.error ? "error" : "active") : "paused",
        name: email.name || emailAddress.split("@")[0],
        picture: email.picture || null,
      };

      console.log("Mapped email account:", emailAddress, "with ID:", mappedEmail._id);
      return mappedEmail;
    });

    console.log(`Returning ${connectedEmails.length} connected email(s)`, 
      connectedEmails.map(e => ({ id: e._id, email: e.email }))
    );
    
    res.json(connectedEmails);
  } catch (error) {
    console.error("Error getting connected emails:", error);
    res.status(500).json({ error: "Failed to get connected emails" });
  }
};

/**
 * Toggle auto-reply mode for an email
 */
export const toggleAutoReply = async (req, res) => {
  try {
    const { email } = req.params;
    const { enabled } = req.body;
    const userId = req.user._id;

    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    // Update user preferences
    const mode = enabled ? "auto-reply" : "draft";

    // Check if user has this email connected
    const user = await User.findById(userId);
    const connectedEmail = user.connectedEmails.find((e) => e.email === email);

    if (!connectedEmail) {
      return res
        .status(404)
        .json({ error: "Email not found in connected accounts" });
    }

    // Update the email preferences with both mode and aiEnabled status
    await User.findByIdAndUpdate(userId, {
      $set: { 
        [`emailPreferences.${email}.mode`]: mode,
        [`emailPreferences.${email}.aiEnabled`]: enabled // Set AI enabled based on auto-reply state
      },
    });

    // Update live connection if it exists
    const connectionUpdated = await updateConnectionConfig(userId, email, {
      mode,
      aiEnabled: enabled
    });

    res.json({
      success: true,
      email,
      mode,
      aiEnabled: enabled,
      connectionUpdated,
    });
  } catch (error) {
    console.error("Error toggling auto-reply:", error);
    res.status(500).json({ error: "Failed to update auto-reply settings" });
  }
};

/**
 * Toggle sync status for an email
 */
export const toggleSync = async (req, res) => {
  try {
    const { email } = req.params;
    const { enabled } = req.body;
    const userId = req.user._id;

    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    // Check if user has this email connected
    const user = await User.findById(userId);
    const connectedEmail = user.connectedEmails.find((e) => e.email === email);

    if (!connectedEmail) {
      return res
        .status(404)
        .json({ error: "Email not found in connected accounts" });
    }

    // Update the email preferences
    await User.findByIdAndUpdate(userId, {
      $set: { [`emailPreferences.${email}.syncEnabled`]: enabled },
    });

    // Update live connection if it exists
    const connection = getConnection(userId, email);
    let lastSync = null;

    if (connection) {
      await updateConnectionConfig(userId, email, { syncEnabled: enabled });

      if (enabled && connection.checkForNewEmails) {
        try {
          await connection.checkForNewEmails();
          lastSync = new Date();

          await User.findByIdAndUpdate(
            userId,
            {
              $set: { [`connectedEmails.$[elem].lastSync`]: lastSync },
            },
            {
              arrayFilters: [{ "elem.email": email }],
            }
          );
        } catch (syncError) {
          console.error(
            `Error checking for new emails on sync toggle: ${syncError}`
          );
        }
      }
    }

    res.json({
      success: true,
      email,
      syncEnabled: enabled,
      lastSync,
    });
  } catch (error) {
    console.error("Error toggling sync:", error);
    res.status(500).json({ error: "Failed to update sync settings" });
  }
};

/**
 * Update email mode (draft/normal)
 */
export const updateEmailMode = async (req, res) => {
  try {
    const { email } = req.params;
    const { mode } = req.body;
    const userId = req.user._id;

    console.log("Updating email mode:", email, mode);

    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    if (!["draft", "normal", "auto-reply"].includes(mode)) {
      return res
        .status(400)
        .json({ error: "Invalid mode. Must be draft, normal, or auto-reply" });
    }

    const user = await User.findById(userId);
    const connectedEmail = user.connectedEmails.find((e) => e.email === email);

    if (!connectedEmail) {
      return res
        .status(404)
        .json({ error: "Email not found in connected accounts" });
    }

    // Update mode and aiEnabled status
    const aiEnabled = mode === "auto-reply";
    
    await User.findByIdAndUpdate(userId, {
      $set: { 
        [`emailPreferences.${email}.mode`]: mode,
        [`emailPreferences.${email}.aiEnabled`]: aiEnabled
      },
    });

    const connectionUpdated = await updateConnectionConfig(userId, email, {
      mode,
      aiEnabled
    });

    res.json({
      success: true,
      email,
      mode,
      aiEnabled,
      connectionUpdated,
      emailId: connectedEmail._id,
    });
  } catch (error) {
    console.error("Error updating email mode:", error);
    res.status(500).json({ error: "Failed to update email mode" });
  }
};

/**
 * Refresh email account sync
 */
export const refreshEmailSync = async (req, res) => {
  try {
    const { email } = req.params;
    const userId = req.user._id;
    let syncError = null;
    let lastSync = null;

    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    const user = await User.findById(userId);
    const connectedEmail = user.connectedEmails.find((e) => e.email === email);

    if (!connectedEmail) {
      return res
        .status(404)
        .json({ error: "Email not found in connected accounts" });
    }

    const connection = getConnection(userId, email);
    console.log("Got connection for refresh:", connection ? "yes" : "no");

    if (connection && connection.checkForNewEmails) {
      try {
        await connection.checkForNewEmails();
        lastSync = new Date();

        await updateConnectionConfig(userId, email, { syncEnabled: true });

        await User.findByIdAndUpdate(
          userId,
          {
            $set: {
              [`connectedEmails.$[elem].lastSync`]: lastSync,
              [`emailPreferences.${email}.syncEnabled`]: true,
            },
          },
          {
            arrayFilters: [{ "elem.email": email }],
          }
        );
      } catch (error) {
        console.error("Error during email sync:", error);
        syncError = error.message;
      }
    } else {
      console.log(`Using temporary connection for ${email}`);
      
      const tempConnection = {
        checkForNewEmails: async () => {
          console.log(`[Temporary Connection] Checking emails for ${email}`);
          return { count: 0 };
        },
        status: "temporary",
        lastSync: new Date(),
        error: null,
      };

      try {
        await tempConnection.checkForNewEmails();
        lastSync = new Date();
        
        await User.findByIdAndUpdate(
          userId,
          {
            $set: {
              [`connectedEmails.$[elem].lastSync`]: lastSync,
              [`emailPreferences.${email}.syncEnabled`]: true,
            },
          },
          {
            arrayFilters: [{ "elem.email": email }],
          }
        );
      } catch (error) {
        console.error("Error with temporary connection:", error);
        syncError = error.message;
      }
    }

    res.json({
      success: !syncError,
      email,
      emailId: connectedEmail._id,
      lastSync: syncError ? null : lastSync,
      error: syncError,
      temporary: !connection || !connection.checkForNewEmails
    });
  } catch (error) {
    console.error("Error refreshing email sync:", error);
    res.status(500).json({ error: "Failed to refresh email sync" });
  }
};

/**
 * Toggle AI-enabled status directly
 */
export const toggleAI = async (req, res) => {
  try {
    const { email } = req.params;
    const { enabled } = req.body;
    const userId = req.user._id;

    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    // Check if user has this email connected
    const user = await User.findById(userId);
    const connectedEmail = user.connectedEmails.find((e) => e.email === email);

    if (!connectedEmail) {
      return res
        .status(404)
        .json({ error: "Email not found in connected accounts" });
    }

    // Update the email preferences for AI
    await User.findByIdAndUpdate(userId, {
      $set: { 
        [`emailPreferences.${email}.aiEnabled`]: enabled,
        // If enabling AI, also set mode to auto-reply
        ...(enabled ? { [`emailPreferences.${email}.mode`]: "auto-reply" } : {})
      },
    });

    // Update config with AI settings
    const connectionUpdated = await updateConnectionConfig(userId, email, {
      aiEnabled: enabled,
      ...(enabled ? { mode: "auto-reply" } : {})
    });

    res.json({
      success: true,
      email,
      aiEnabled: enabled,
      mode: enabled ? "auto-reply" : user.emailPreferences?.[email]?.mode || "draft",
      connectionUpdated,
    });
  } catch (error) {
    console.error("Error toggling AI:", error);
    res.status(500).json({ error: "Failed to update AI settings" });
  }
};

export default {
  getConnectedEmails,
  toggleAutoReply,
  toggleSync,
  updateEmailMode,
  refreshEmailSync,
  toggleAI,
};