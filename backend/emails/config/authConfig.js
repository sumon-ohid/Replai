import dotenv from 'dotenv';

dotenv.config();

/**
 * Authentication configuration for different email providers
 * Contains client IDs, secrets, redirect URIs and required scopes
 */
export default {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${process.env.VITE_API_BASE_URL}/api/emails/auth/google/callback`,
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  },
  
  outlook: {
    clientId: process.env.OUTLOOK_CLIENT_ID,
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
    redirectUri: `${process.env.VITE_API_BASE_URL}/api/emails/auth/outlook/callback`,
    scopes: [
      'offline_access',
      'User.Read',
      'Mail.Read',
      'Mail.ReadWrite',
      'Mail.Send'
    ],
    authority: 'https://login.microsoftonline.com/common'
  },
  
  // For custom IMAP/SMTP email accounts
  custom: {
    // Default ports for common email providers
    defaults: {
      imap: {
        port: 993,
        secure: true
      },
      smtp: {
        port: 587,
        secure: false
      }
    },
    // Common email provider settings
    providers: {
      gmail: {
        imap: {
          host: 'imap.gmail.com',
          port: 993,
          secure: true
        },
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false
        }
      },
      outlook: {
        imap: {
          host: 'outlook.office365.com',
          port: 993,
          secure: true
        },
        smtp: {
          host: 'smtp.office365.com',
          port: 587,
          secure: false
        }
      },
      yahoo: {
        imap: {
          host: 'imap.mail.yahoo.com',
          port: 993,
          secure: true
        },
        smtp: {
          host: 'smtp.mail.yahoo.com',
          port: 587,
          secure: false
        }
      }
    }
  },
  
  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'replai-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    }
  },
  
  // Token settings
  tokens: {
    accessTokenLifetime: 3600, // 1 hour in seconds
    refreshTokenLifetime: 30 * 24 * 60 * 60 // 30 days in seconds
  },
  
  // Encryption for sensitive data
  encryption: {
    algorithm: 'aes-256-gcm',
    secretKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-must-change-in-production'
  }
};