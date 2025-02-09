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

let repliedEmails = new Set();

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

async function saveRepliedEmails() {
  try {
    await fs.writeFile(STORAGE_FILE, JSON.stringify([...repliedEmails]));
  } catch (error) {
    console.error('Error saving replied emails:', error);
  }
}

const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens));
    res.send('Authentication successful! You can close this tab.');
  } catch (error) {
    console.error('Error authenticating:', error);
    res.status(500).send('Authentication failed.');
  }
});

async function loadOAuthTokens() {
  try {
    const tokens = JSON.parse(await fs.readFile(TOKENS_FILE, 'utf8'));
    oauth2Client.setCredentials(tokens);
  } catch (error) {
    console.warn('No saved tokens found. Please authenticate via /auth/google');
  }
}

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

        if (!fromHeader) continue;

        const senderEmail = extractEmail(fromHeader.value);

        if (
          senderEmail &&
          (senderEmail.endsWith('@gmail.com') || senderEmail.endsWith('@yahoo.com'))
        ) {
          await respondToEmail(message.id, senderEmail);
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

const respondToEmail = async (emailId, senderEmail) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const emailRes = await gmail.users.messages.get({
      userId: 'me',
      id: emailId,
      format: 'full'
    });

    const { payload } = emailRes.data;
    const headers = payload.headers;

    const subjectHeader = headers.find(h => h.name === 'Subject');
    const toHeader = headers.find(h => h.name === 'To');

    const subject = subjectHeader?.value || 'Your email';
    const originalBody = getEmailBody(payload);

    const prompt = `Respond to this email briefly and naturally as a real person:
    From: ${senderEmail}
    Subject: ${subject}
    Body: ${originalBody}

    Guidelines:
    - Keep response short and simple
    - Use casual language
    - Sign with "Best regards, Md Ohiduzzaman Sumon"
    - Avoid markdown formatting`;

    const aiRes = await model.generateContent(prompt);
    const responseText = aiRes.response.text();

    const rawMessage = [
      `From: ${toHeader?.value}`,
      `To: ${senderEmail}`,
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

    console.log(`Replied to email from ${senderEmail}`);
  } catch (error) {
    console.error('Error responding to email:', error);
    repliedEmails.delete(emailId);
  }
};

function extractEmail(fromHeaderValue) {
  const match = fromHeaderValue.match(/<([^>]+)>/);
  return match ? match[1] : fromHeaderValue;
}

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

async function initialize() {
  await loadRepliedEmails();
  await loadOAuthTokens();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    setInterval(checkForNewEmails, 60000);
  });
}

initialize();
