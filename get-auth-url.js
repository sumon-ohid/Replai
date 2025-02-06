import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  '1089804080468-v6b2mrl3bnm6jbfn7kkll89n739fk6co.apps.googleusercontent.com',
  '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',
  'http://localhost:3000/auth/google/callback'
);

const authorizationCode = '4/0ASVgi3ICYrnkS4BGD4faMq-Kd6D6kscCU-WSLLKYpydm0zQgiDdt28WumR28pnAsPvBFcQ';

async function getTokens() {
  try {
    const { tokens } = await oauth2Client.getToken(authorizationCode);
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Tokens:', tokens);
  } catch (error) {
    console.error('Error getting tokens:', error);
  }
}

getTokens();
