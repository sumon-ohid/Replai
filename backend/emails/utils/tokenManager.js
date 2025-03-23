import { google } from 'googleapis';
import EmailAccount from '../../models/emailSchema.js';
import { AuthenticationError } from './errorHandler.js';

// Google OAuth2 client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

class TokenManager {
  /**
   * Exchange Google OAuth code for tokens
   */
  static async exchangeGoogleCode(code) {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      };
    } catch (error) {
      throw new AuthenticationError('Failed to exchange Google code', { error: error.message });
    }
  }

  /**
   * Exchange Outlook OAuth code for tokens
   */
  static async exchangeOutlookCode(code) {
    try {
      const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: process.env.OUTLOOK_CLIENT_ID,
          client_secret: process.env.OUTLOOK_CLIENT_SECRET,
          code,
          redirect_uri: process.env.OUTLOOK_REDIRECT_URI,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in
      };
    } catch (error) {
      throw new AuthenticationError('Failed to exchange Outlook code', { error: error.message });
    }
  }

  /**
   * Refresh OAuth2 token
   */
  static async refreshToken(userId, email, provider) {
    try {
      const account = await EmailAccount.findOne({ userId, email });
      if (!account) {
        throw new AuthenticationError('Email account not found', { userId, email });
      }

      switch (provider) {
        case 'google':
          return await this.refreshGoogleToken(account);
        case 'outlook':
          return await this.refreshOutlookToken(account);
        default:
          throw new AuthenticationError('Unsupported provider', { provider });
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Refresh Google OAuth2 token
   */
  static async refreshGoogleToken(account) {
    try {
      oauth2Client.setCredentials({
        refresh_token: account.tokens.refreshToken
      });

      const { tokens } = await oauth2Client.refreshAccessToken();

      await this.updateTokens(account, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || account.tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expiry_date)
      });

      return tokens;
    } catch (error) {
      throw new AuthenticationError('Failed to refresh Google token', { 
        email: account.email, 
        error: error.message 
      });
    }
  }

  /**
   * Refresh Outlook OAuth2 token
   */
  static async refreshOutlookToken(account) {
    try {
      const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: process.env.OUTLOOK_CLIENT_ID,
          client_secret: process.env.OUTLOOK_CLIENT_SECRET,
          refresh_token: account.tokens.refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tokens = await response.json();

      await this.updateTokens(account, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || account.tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
      });

      return tokens;
    } catch (error) {
      throw new AuthenticationError('Failed to refresh Outlook token', {
        email: account.email,
        error: error.message
      });
    }
  }

  /**
   * Update tokens in database
   */
  static async updateTokens(account, tokens) {
    try {
      account.tokens = {
        ...account.tokens,
        ...tokens
      };
      await account.save();
    } catch (error) {
      throw new AuthenticationError('Failed to update tokens', {
        email: account.email,
        error: error.message
      });
    }
  }

  /**
   * Check if token needs refresh
   */
  static needsRefresh(account) {
    if (!account.tokens.expiresAt) return true;

    // Refresh if token expires in less than 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    return account.tokens.expiresAt.getTime() - Date.now() < fiveMinutes;
  }

  /**
   * Get valid access token
   */
  static async getValidToken(userId, email) {
    const account = await EmailAccount.findOne({ userId, email });
    if (!account) {
      throw new AuthenticationError('Email account not found', { userId, email });
    }

    if (this.needsRefresh(account)) {
      await this.refreshToken(userId, email, account.provider);
    }

    return account.tokens.accessToken;
  }

  /**
   * Revoke tokens
   */
  static async revokeTokens(userId, email) {
    const account = await EmailAccount.findOne({ userId, email });
    if (!account) return;

    try {
      switch (account.provider) {
        case 'google':
          await this.revokeGoogleTokens(account);
          break;
        case 'outlook':
          await this.revokeOutlookTokens(account);
          break;
      }

      // Clear tokens from database
      account.tokens = {};
      await account.save();
    } catch (error) {
      console.error('Error revoking tokens:', error);
      // Continue with token removal even if revocation fails
    }
  }

  /**
   * Revoke Google tokens
   */
  static async revokeGoogleTokens(account) {
    if (account.tokens.accessToken) {
      try {
        await oauth2Client.revokeToken(account.tokens.accessToken);
      } catch (error) {
        console.error('Error revoking Google access token:', error);
      }
    }

    if (account.tokens.refreshToken) {
      try {
        await oauth2Client.revokeToken(account.tokens.refreshToken);
      } catch (error) {
        console.error('Error revoking Google refresh token:', error);
      }
    }
  }

  /**
   * Revoke Outlook tokens
   */
  static async revokeOutlookTokens(account) {
    // Microsoft Graph doesn't provide a direct way to revoke tokens
    // They eventually expire on their own
    // Could implement a token blacklist if needed
  }
}

export default TokenManager;
