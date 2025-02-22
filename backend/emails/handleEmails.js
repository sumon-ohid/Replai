import express from 'express';
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import getSentEmailModel from '../models/SentEmail.js';
import User from '../models/User.js';
import BlockList from '../models/BlockList.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import auth from '../middleware/auth.js';
import TextData from '../models/TextData.js';

dotenv.config();

const apiBaseUrl = process.env.VITE_API_BASE_URL;
const dashboardUrl = process.env.DASHBOARD_URL;

const router = express.Router();
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  `${apiBaseUrl}/api/emails/auth/google/callback`
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

const TOKENS_FILE = path.resolve('tokens.json');
const repliedEmails = new Set();
const userIntervals = new Map();

const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
let localUserId;

router.get('/auth/google', auth, (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  localUserId = req.user._id;
  res.json({ authUrl });
});

const getUser = async (auth) => {
  const oauth2 = google.oauth2({ version: 'v2', auth });
  const res = await oauth2.userinfo.get();
  return res.data;
};

router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code parameter');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const googleUser = await getUser(oauth2Client);
    const googleUserId = googleUser.id;
    const googleUserEmail = googleUser.email;

    await User.findByIdAndUpdate(localUserId, {
      $addToSet: { connectedEmails: { email: googleUserEmail, provider: 'google' } }
    });

    await createEmailBot(tokens, googleUserId, localUserId);

    res.redirect(dashboardUrl);
  } catch (error) {
    console.error('Error authenticating:', error);
    res.status(500).send('Authentication failed.');
  }
});

const createEmailBot = async (tokens, googleUserId, localUserId) => {
  try {
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const checkForNewEmails = async () => {
      try {
        const res = await gmail.users.messages.list({
          userId: 'me',
          q: 'is:unread -in:chats -from:me',
          maxResults: 5
        });
        const messages = res.data.messages || [];

        // user custom data to generate response router.get('/get-text', async (req, res)
        let userPrompt = await TextData.findOne({ userId: localUserId });

        for (const message of messages) {
          if (!repliedEmails.has(message.id)) {
            await respondToEmail(message.id, localUserId, userPrompt?.text + userPrompt?.fileData );
            repliedEmails.add(message.id);
            await gmail.users.messages.modify({
              userId: 'me',
              id: message.id,
              requestBody: { removeLabelIds: ['UNREAD'] }
            });
          }
        }
      } catch (error) {
        console.error('Error checking emails:', error);
      }
    };

    const respondToEmail = async (emailId, localUserId, userPrompt = '') => {
      try {
        const emailRes = await gmail.users.messages.get({ userId: 'me', id: emailId, format: 'full' });
        const { payload } = emailRes.data;
        const headers = payload.headers;
        const fromHeader = headers.find(h => h.name === 'From');
        const subjectHeader = headers.find(h => h.name === 'Subject');
        const toHeader = headers.find(h => h.name === 'To');
        const from = fromHeader?.value || '';
        const subject = subjectHeader?.value || 'Your email';
        const originalBody = getEmailBody(payload);

        // Check if the email or domain is in the block list
        const blockList = await BlockList.findOne({ userId: localUserId });

        if (blockList) {
          const blockedEmails = blockList.entries.map(entry => entry.toLowerCase()); // Normalize
          const emailMatch = from.match(/<([^<>]+)>/);
          const fromEmail = emailMatch ? emailMatch[1] : from;
          const fromDomain = fromEmail.includes('@') ? fromEmail.split('@')[1].toLowerCase() : null;

          // Check if full email, domain, or subdomain match
          if (
            blockedEmails.includes(fromEmail.toLowerCase()) ||
            (fromDomain && blockedEmails.some(blocked => fromDomain === blocked || fromDomain.endsWith(`.${blocked}`)))
          ) {
            console.log(`Email from ${fromEmail} is in the block list. Skipping reply.`);
            return;
          }
        }

        // Fetch the user's name
        const user = await User.findById(localUserId);
        const userName = user ? user.name : '';

        // Generate AI response
        const defaultPrompt = `Respond to this email briefly and naturally as a real person:
From: ${from}
Subject: ${subject}
Body: ${originalBody}

Guidelines:
- Keep response short and simple
- Use casual language
- Sign with "Best regards, ${userName}"
- Avoid markdown formatting`;

        // let prompt = userPrompt + defaultPrompt;

        // // Limit prompt to 500 characters take last 500 characters
        // if (prompt.length > 500)
        //   prompt = prompt.slice(prompt.length - 500);

        // if (!prompt) {
        //   console.log('No prompt found. Using default prompt.');
        //   prompt = defaultPrompt;
        // }

        const prompt = defaultPrompt;

        const aiRes = await model.generateContent(prompt);
        const responseText = aiRes.response.text();
        const rawMessage = [
          `From: ${toHeader?.value}`,
          `To: ${from}`,
          `Subject: ${subject}`,
          'Content-Type: text/plain; charset=utf-8',
          '',
          responseText
        ].join('\n');

        const encodedMessage = Buffer.from(rawMessage)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encodedMessage } });
        console.log(`Replied to email from ${from}`);

        // Save sent email to database
        const SentEmail = getSentEmailModel(localUserId);
        const sentEmail = new SentEmail({ userId: localUserId, from: toHeader?.value, to: from, subject: `${subject}`, body: responseText });
        await sentEmail.save();
        // console.log(`Saved email to database: ${sentEmail}`);

      } catch (error) {
        console.error('Error responding to email:', error);
        repliedEmails.delete(emailId);
      }
    };

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

    const interval = setInterval(checkForNewEmails, 60000);
    userIntervals.set(googleUserId, interval);
    console.log('Email bot created successfully!');
  } catch (error) {
    console.error('Error creating email bot:', error);
    throw new Error('Error creating email bot.');
  }
};

export default router;