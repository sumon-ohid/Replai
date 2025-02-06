import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

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

app.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
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

app.get('/api/emails', async (req, res) => {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const response = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });

    if (!response.data.messages) {
      return res.json([]);
    }

    const emails = await Promise.all(
      response.data.messages.map(async (message) => {
        const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
        return msg.data;
      })
    );

    res.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to retrieve emails' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
