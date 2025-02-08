import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const STORAGE_FILE = path.resolve('repliedEmails.json');
const TOKENS_FILE = path.resolve('tokens.json');

app.use(cors());
app.use(express.json());

// OAuth2 Client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:3000/auth/google/callback'
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send'
];

// Initialize replied emails storage
let repliedEmails = new Set();

// Load existing replied emails
async function loadRepliedEmails() {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    repliedEmails = new Set(JSON.parse(data));
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(STORAGE_FILE, '[]');
    } else {
      console.error('Error loading replied emails:', error);
    }
  }
}

// Save replied emails to file
async function saveRepliedEmails() {
  try {
    await fs.writeFile(STORAGE_FILE, JSON.stringify([...repliedEmails]));
  } catch (error) {
    console.error('Error saving replied emails:', error);
  }
}

// Google Generative AI Setup
const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// OAuth login endpoint
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  res.redirect(authUrl);
});

// OAuth callback endpoint
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens securely
    await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens));
    res.send('Authentication successful! You can close this tab.');
  } catch (error) {
    console.error('Error authenticating:', error);
    res.status(500).send('Authentication failed.');
  }
});

// Load saved OAuth tokens
async function loadOAuthTokens() {
  try {
    const tokens = JSON.parse(await fs.readFile(TOKENS_FILE, 'utf8'));
    oauth2Client.setCredentials(tokens);
  } catch (error) {
    console.warn('No saved tokens found. Please authenticate via /auth/google');
  }
}

// Function to check for new emails and reply
const checkForNewEmails = async () => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread -in:chats -from:me',
      maxResults: 5
    });

    const messages = res.data.messages || [];
    
    for (const message of messages) {
      if (!repliedEmails.has(message.id)) {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });

        const headers = email.data.payload.headers;
        const fromHeader = headers.find(h => h.name === 'From');

        if (!fromHeader?.value.includes(process.env.USER_EMAIL)) {
          await respondToEmail(message.id);
          repliedEmails.add(message.id);
          await saveRepliedEmails();

          await gmail.users.messages.modify({
            userId: 'me',
            id: message.id,
            requestBody: { removeLabelIds: ['UNREAD'] }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking emails:', error);
  }
};

// Function to respond to an email
const respondToEmail = async (emailId) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const emailRes = await gmail.users.messages.get({
      userId: 'me',
      id: emailId,
      format: 'full'
    });

    const { payload } = emailRes.data;
    const headers = payload.headers;

    const fromHeader = headers.find(h => h.name === 'From');
    const subjectHeader = headers.find(h => h.name === 'Subject');
    const toHeader = headers.find(h => h.name === 'To');

    const from = fromHeader?.value || '';
    const subject = subjectHeader?.value || 'Your email';
    const originalBody = getEmailBody(payload);

    // Generate AI response
    const prompt = `Respond to this email briefly and naturally as a real person:
    From: ${from}
    Subject: ${subject}
    Body: ${originalBody}

    Guidelines:
    - Keep response short and simple
    - Use casual language
    - Sign with "Best regards, Md Ohiduzzaman Sumon"
    - Avoid markdown formatting`;

    const aiRes = await model.generateContent(prompt);
    const responseText = aiRes.response.text();

    // Create email reply
    const rawMessage = [
      `From: ${toHeader?.value}`,
      `To: ${from}`,
      `Subject: Re: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      responseText
    ].join('\n');

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage }
    });

    console.log(`Replied to email from ${from}`);
  } catch (error) {
    console.error('Error responding to email:', error);
    repliedEmails.delete(emailId);
  }
};

// Function to extract email body
function getEmailBody(payload) {
  if (payload.parts) {
    const textPart = payload.parts.find(part => part.mimeType === 'text/plain');
    if (textPart && textPart.body.data) {
      return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
    }
  }
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  return '(No content found)';
}

// Initialize server
async function initialize() {
  await loadRepliedEmails();
  await loadOAuthTokens();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    setInterval(checkForNewEmails, 60000); // Check every minute
  });
}

initialize();
