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

    const user = await User.findById(userId).select(
      "connectedEmails emailPreferences"
    );

    if (!user || !user.connectedEmails) {
      return res.json([]);
    }

    // Map connected emails to include additional status information
    const connectedEmails = user.connectedEmails.map((email) => {
      const emailAddress = email.email;
      const preferences = user.emailPreferences?.[emailAddress] || {};

      // Get connection status
      const connectionKey = `${userId}:${emailAddress}`;
      const connection = getConnection(userId, emailAddress);

      return {
        email: emailAddress,
        provider: email.provider || "google",
        connected: email.connected || true,
        connectedAt: email.connectedAt || new Date(),
        syncEnabled: preferences.syncEnabled !== false, // Default to true
        autoReplyEnabled: preferences.mode === "auto-reply", // Check mode
        mode: preferences.mode || "auto-reply", // Default mode
        lastSync: connection?.lastSync || email.lastSync || null,
        status: connection ? (connection.error ? "error" : "active") : "paused",
        name: email.name || "",
        picture: email.picture || null,
      };
    });

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

    // Update the email preferences
    await User.findByIdAndUpdate(userId, {
      $set: { [`emailPreferences.${email}.mode`]: mode },
    });

    // Update live connection if it exists
    const connectionUpdated = await updateConnectionConfig(userId, email, {
      mode,
    });

    res.json({
      success: true,
      email,
      mode,
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
      // Update connection config
      await updateConnectionConfig(userId, email, { syncEnabled: enabled });

      // If enabling sync, trigger an immediate check
      if (enabled && connection.checkForNewEmails) {
        try {
          await connection.checkForNewEmails();
          lastSync = new Date();

          // Update last sync time in database
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

    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    if (!["draft", "normal", "auto-reply"].includes(mode)) {
      return res
        .status(400)
        .json({ error: "Invalid mode. Must be draft, normal, or auto-reply" });
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
      $set: { [`emailPreferences.${email}.mode`]: mode },
    });

    // Update live connection if it exists
    const connectionUpdated = await updateConnectionConfig(userId, email, {
      mode,
    });

    res.json({
      success: true,
      email,
      mode,
      connectionUpdated,
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

    // Check if user has this email connected
    const user = await User.findById(userId);
    const connectedEmail = user.connectedEmails.find((e) => e.email === email);

    if (!connectedEmail) {
      return res
        .status(404)
        .json({ error: "Email not found in connected accounts" });
    }

    // Get the connection
    const connection = getConnection(userId, email);
    // console.log(" Connection:", connection, "for", email, "user", userId);

    // Handle case when we have a connection
    if (connection && connection.checkForNewEmails) {
      try {
        // Use the existing connection to check for emails
        await connection.checkForNewEmails();
        lastSync = new Date();

        // Enable sync if it was disabled
        await updateConnectionConfig(userId, email, { syncEnabled: true });

        // Update last sync time in database
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
    } 
    // Handle case when we don't have a connection
    else {
      console.log(`No active connection found for ${email}, using temporary connection`);
      
      // Create a simple connection just for this request
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
        // Use the temporary connection
        await tempConnection.checkForNewEmails();
        lastSync = new Date();
        
        // Update last sync time in database
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
      lastSync: syncError ? null : lastSync,
      error: syncError,
      temporary: !connection || !connection.checkForNewEmails
    });
  } catch (error) {
    console.error("Error refreshing email sync:", error);
    res.status(500).json({ error: "Failed to refresh email sync" });
  }
};
