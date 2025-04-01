import express from "express";
import { requireAuth } from "../middleware/emailAuthMiddleware.js";
import authConfig from "../config/authConfig.js";
import { google } from "googleapis";
import * as msal from "@azure/msal-node";
import User from "../../models/User.js";
import ConnectedEmail from "../../models/ConnectedEmail.js";
import getConnectedEmailModels, {
  validateEmailCollections,
} from "../../models/ConnectedEmailModels.js";
import { initializeGoogleConnection } from "../services/googleEmailService.js";
import outlookEmailService from "../services/outlookEmailService.js";
import customEmailService from "../services/customEmailService.js";
import connectionManager from "../managers/connectionManager.js";
import dotenv from "dotenv";
import auth from "../../middleware/auth.js";
import NotificationManager from "../managers/notificationManager.js";

dotenv.config();
const dashboardUrl = process.env.DASHBOARD_URL;

const router = express.Router();

/**
 * Set up email collections for a connected email
 */
async function setupEmailCollections(userId, email, connectedEmailId) {
  try {
    console.log(
      `Setting up email collections for ${email} (${connectedEmailId})`
    );

    // First validate/create collections
    await validateEmailCollections(connectedEmailId);

    // Initialize models
    const models = getConnectedEmailModels(connectedEmailId);

    // Verify collections by trying to access them
    await Promise.all([
      models.Email.findOne(),
      models.Draft.findOne(),
      models.Sent.findOne(),
    ]);

    console.log(`Successfully set up collections for ${email}`);
    return true;
  } catch (error) {
    console.error(`Error setting up collections for ${email}:`, error);
    throw error;
  }
}

/**
 * Google OAuth routes
 */
router.get("/google", requireAuth, async (req, res) => {
  try {
    // Get the user with connectedEmails count
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has a Pro plan
    const isPro = ["pro_monthly", "pro_yearly", "business"].includes(
      user.subscriptionPlan
    );
    const emailCount = user.connectedEmailsCount || 0;

    // Free users can only connect one email
    if (!isPro && emailCount >= 0) {
      return res.status(403).json({
        error: "subscription_required",
        message:
          "Free plan users can not connect email account. Please upgrade to a Pro plan.",
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      authConfig.google.clientId,
      authConfig.google.clientSecret,
      authConfig.google.redirectUri
    );

    const state = Buffer.from(
      JSON.stringify({
        userId: req.user._id.toString(),
        timestamp: Date.now(),
      })
    ).toString("base64");

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: authConfig.google.scopes,
      prompt: "consent",
      state: state,
    });

    req.session.userId = req.user._id;
    res.json({ authUrl });
  } catch (error) {
    console.error("Error starting Google auth:", error);
    res.status(500).json({ error: "Failed to start Google authentication" });
  }
});

router.get("/google/callback", async (req, res) => {
  const { code, state } = req.query;
  let userId = req.session.userId;

  if (state) {
    try {
      const parsedState = JSON.parse(Buffer.from(state, "base64").toString());
      userId = parsedState.userId;

      if (Date.now() - parsedState.timestamp > 10 * 60 * 1000) {
        console.warn("State parameter expired");
      }
    } catch (error) {
      console.error("Error parsing state:", error);
    }
  }

  if (!code || !userId) {
    return res.redirect(`${dashboardUrl}?error=missing_params`);
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      authConfig.google.clientId,
      authConfig.google.clientSecret,
      authConfig.google.redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (!tokens.refresh_token) {
      console.warn("No refresh token returned by Google");
      return res.redirect(
        `${dashboardUrl}?error=no_refresh_token&message=${encodeURIComponent(
          "Please disconnect your Google account from Google security settings and try again."
        )}`
      );
    }

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const googleUser = await oauth2.userinfo.get();
    const { email: googleUserEmail, name: googleUserName } = googleUser.data;

    // Create/update ConnectedEmail record
    const connectedEmail = await ConnectedEmail.findOneAndUpdate(
      { userId, email: googleUserEmail },
      {
        userId,
        email: googleUserEmail,
        name: googleUserName || googleUserEmail.split("@")[0],
        provider: "google",
        tokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiry: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
        },
        status: "active",
        aiSettings: {
          enabled: true,
        },
      },
      { upsert: true, new: true }
    );

    // Set up collections before proceeding
    await setupEmailCollections(userId, googleUserEmail, connectedEmail._id);

    // Update user's connected emails array
    await User.findByIdAndUpdate(userId, {
      $pull: { connectedEmails: { email: googleUserEmail } },
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        connectedEmails: {
          email: googleUserEmail,
          provider: "google",
          name: googleUserName || googleUserEmail.split("@")[0],
          status: "active",
        },
      },
    });

    // Send initial notification that email connection has started
    await NotificationManager.createNotification({
      userId: userId,
      type: "info",
      title: "Email Account Connected",
      message: `Your Google account ${googleUserEmail} has been successfully connected.`,
      metadata: {
        category: "email",
        action: "connected",
        provider: "google",
        email: googleUserEmail,
        url: "/email-manager",
        timestamp: new Date().toISOString(),
      },
    });

    // Initialize the Google connection in the background
    setTimeout(async () => {
      try {
        await initializeGoogleConnection(
          userId,
          googleUserEmail,
          tokens.refresh_token,
          tokens.access_token,
          { syncEnabled: true }
        );
        console.log(
          `Google email successfully connected for ${googleUserEmail}`
        );
      } catch (syncError) {
        console.error(
          `Failed to set up email sync for ${googleUserEmail}:`,
          syncError
        );
      }
    }, 100);

    res.redirect(`${dashboardUrl}?success=true`);
  } catch (error) {
    console.error("Error in Google callback:", error);
    res.redirect(
      `${dashboardUrl}?error=auth_failed&message=${encodeURIComponent(
        error.message
      )}`
    );
  }
});

/**
 * Disconnect email route
 */
router.post("/disconnect", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { email, _id } = req.body;

    console.log(`Processing disconnect request for ${email}`);

    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    // Find the connected email account
    const connectedEmail = await ConnectedEmail.findOne({
      userId,
      email,
      ...(_id ? { _id } : {}),
    });

    if (!connectedEmail) {
      console.log(`Connected email not found for user ${userId}: ${email}`);
      return res.status(404).json({ error: "Connected email not found" });
    }

    console.log(`Found connected email: ${connectedEmail.provider} - ${email}`);
    const connectedEmailId = connectedEmail._id;

    // Call the appropriate disconnect function based on provider
    let disconnectResult;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Filter out the email to disconnect
    user.connectedEmails = user.connectedEmails.filter(
      (e) => e.email !== email
    );

    // Update connectedEmailsCount explicitly
    user.connectedEmailsCount = user.connectedEmails.length;

    // Save user with updated connectedEmails and count
    await user.save();

    switch (connectedEmail.provider) {
      case "google":
        disconnectResult = await connectionManager.disconnectGoogleEmail(
          userId,
          email
        );
        break;
      case "outlook":
        disconnectResult = await connectionManager.disconnectOutlookEmail(
          userId,
          email
        );
        break;
      default:
        // For other providers, just update the database
        await ConnectedEmail.findByIdAndUpdate(connectedEmail._id, {
          status: "disconnected",
          disconnectedAt: new Date(),
          "tokens.accessToken": null,
          "tokens.refreshToken": null,
        });
        disconnectResult = { success: true };
    }

    if (!disconnectResult.success) {
      console.error(`Failed to disconnect ${email}:`, disconnectResult.error);
      return res.status(500).json({
        error: "Failed to disconnect email",
        details: disconnectResult.error,
      });
    }

    // COMPLETE CLEANUP STEPS
    try {
      // 1. Remove from user's connectedEmails array
      await User.updateOne(
        { _id: userId },
        { $pull: { connectedEmails: { email: email } } }
      );

      console.log(`Removed ${email} from user's connectedEmails array`);

      // 2. Delete email collections directly using Mongoose connection
      const mongoose = (await import("mongoose")).default;
      const connectedEmailIdStr = connectedEmailId.toString();

      // Define collection names based on the ID
      const collectionNames = [
        `email_${connectedEmailIdStr}_emails`,
        `email_${connectedEmailIdStr}_drafts`,
        `email_${connectedEmailIdStr}_sent`,
      ];

      // Drop each collection if it exists
      for (const collectionName of collectionNames) {
        try {
          const collectionExists = await mongoose.connection.db
            .listCollections({ name: collectionName })
            .hasNext();

          if (collectionExists) {
            console.log(`Dropping collection: ${collectionName}`);
            await mongoose.connection.db.collection(collectionName).drop();
            console.log(`Successfully dropped collection: ${collectionName}`);
          } else {
            console.log(
              `Collection ${collectionName} does not exist, skipping`
            );
          }
        } catch (dropError) {
          console.error(
            `Error dropping collection ${collectionName}:`,
            dropError
          );
          // Continue with other collections
        }
      }

      // 3. Clean up any scheduled jobs or intervals related to this email
      connectionManager.removeAllIntervals(userId, email);

      // 4. Delete the ConnectedEmail document entirely
      await ConnectedEmail.findByIdAndDelete(connectedEmailId);
      console.log(`Deleted ConnectedEmail document for ${email}`);
    } catch (cleanupError) {
      console.error(`Error during cleanup for ${email}:`, cleanupError);
      // Don't fail the request if cleanup has issues
      // We've already disconnected the main service, so this is secondary
    }

    console.log(`Successfully disconnected ${email}`);

    // Return success response
    res.json({
      success: true,
      message: `Successfully disconnected ${email}`,
    });
  } catch (error) {
    console.error(`Error in disconnect route:`, error);
    res
      .status(500)
      .json({ error: "Failed to disconnect email", details: error.message });
  }
});

/**
 * List connected emails
 */
router.get("/connected", requireAuth, async (req, res) => {
  try {
    console.log("Fetching connected emails for user:", req.user._id);

    const connectedEmails = await ConnectedEmail.find({
      userId: req.user._id,
    }).select("-tokens -credentials");

    const mappedEmails = connectedEmails.map((email) => {
      console.log(`Mapped email account: ${email.email} with ID: ${email._id}`);
      return {
        id: email._id,
        email: email.email,
        provider: email.provider,
        name: email.name,
        status: email.status,
        syncEnabled: email.syncConfig?.enabled ?? true,
        lastSync: email.stats?.lastSync,
        aiEnabled: email.aiSettings?.enabled ?? false,
      };
    });

    console.log(
      `Returning ${mappedEmails.length} connected email(s)`,
      mappedEmails
    );
    res.json(mappedEmails);
  } catch (error) {
    console.error("Error fetching connected emails:", error);
    res.status(500).json({ error: "Failed to fetch connected emails" });
  }
});

export default router;
