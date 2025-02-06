import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// OAuth2 Client for Gmail API
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:3000/auth/google/callback'
);

const refreshToken = process.env.REFRESH_TOKEN;

if (!refreshToken) {
  console.error('Missing refresh token! Set it in the environment variables.');
  process.exit(1);
}

oauth2Client.setCredentials({ refresh_token: refreshToken });

// Initialize Google Generative AI (Gemini)
const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log('Tokens acquired:', tokens);
    res.redirect('/');
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Function to check for new emails and respond
const checkForNewEmails = async () => {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const response = await gmail.users.messages.list({ userId: 'me', maxResults: 1 });

    if (response.data.messages && response.data.messages.length > 0) {
      const message = response.data.messages[0];
      const email = await gmail.users.messages.get({ userId: 'me', id: message.id });
      const headers = email.data.payload.headers;
      const fromHeader = headers.find(header => header.name === 'From');
      const subjectHeader = headers.find(header => header.name === 'Subject');
      const from = fromHeader ? fromHeader.value : '';
      const subject = subjectHeader ? subjectHeader.value : '';

      console.log(`New email from ${from} with subject "${subject}"`);

      // Wait for 10 seconds before responding
      setTimeout(() => respondToEmail(message.id), 10000);
    } else {
      console.log('No new emails found.');
    }
  } catch (error) {
    console.error('Error checking for new emails:', error);
  }
};

// Function to respond to an email
const respondToEmail = async (emailId) => {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const email = await gmail.users.messages.get({ userId: 'me', id: emailId });
    const headers = email.data.payload.headers;
    const fromHeader = headers.find(header => header.name === 'From');
    const subjectHeader = headers.find(header => header.name === 'Subject');
    const from = fromHeader ? fromHeader.value : '';
    const subject = subjectHeader ? subjectHeader.value : '';
    const body = email.data.payload.parts ? email.data.payload.parts.map(part => part.body.data).join('') : email.data.payload.body.data;
    const decodedBody = Buffer.from(body, 'base64').toString('utf-8');

    // Use Google Generative AI API (Gemini) to generate a response
    const aiResponse = await model.generateContent(decodedBody);
    const responseText = aiResponse.response.text();

    // Send the generated response back to the sender
    const rawMessage = [
      `From: me`,
      `To: ${from}`,
      `Subject: Re: ${subject}`,
      '',
      responseText,
    ].join('\n');

    const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`Responded to email from ${from}`);
  } catch (error) {
    console.error('Error responding to email:', error);
  }
};

// Poll for new emails every minute
setInterval(checkForNewEmails, 60000);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
