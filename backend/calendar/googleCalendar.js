import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import { google } from 'googleapis';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const router = express.Router();
const { OAuth2 } = google.auth;

// Helper function to create an OAuth2 client
const createOAuth2Client = () => {
  return new OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUrl
  );
};

// Helper function to get an authenticated calendar client
const getCalendarClient = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user?.googleAuth?.accessToken || !user?.googleAuth?.refreshToken) {
    throw new Error('NOT_CONNECTED');
  }
  
  const oAuth2Client = createOAuth2Client();
  
  oAuth2Client.setCredentials({
    access_token: user.googleAuth.accessToken,
    refresh_token: user.googleAuth.refreshToken,
    expiry_date: user.googleAuth.expiryDate
  });
  
  // Handle token refresh
  oAuth2Client.on('tokens', async (tokens) => {
    const updateData = {};
    
    if (tokens.access_token) {
      updateData['googleAuth.accessToken'] = tokens.access_token;
      updateData['googleAuth.expiryDate'] = tokens.expiry_date;
    }
    
    if (tokens.refresh_token) {
      updateData['googleAuth.refreshToken'] = tokens.refresh_token;
    }
    
    if (Object.keys(updateData).length > 0) {
      try {
        await User.findByIdAndUpdate(userId, updateData);
        logger.info('Updated Google auth tokens', { userId });
      } catch (error) {
        logger.error('Failed to update tokens', { error, userId });
      }
    }
  });
  
  return google.calendar({ version: 'v3', auth: oAuth2Client });
};

// Get connection status
router.get('/status', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isConnected = Boolean(
      user.googleAuth?.accessToken && 
      user.googleAuth?.refreshToken
    );
    
    res.json({
      connected: isConnected,
      email: user.googleAuth?.email || null,
      name: user.googleAuth?.name || null
    });
  } catch (error) {
    logger.error('Failed to check calendar connection status', { error, userId: req.user.id });
    res.status(500).json({ error: 'Failed to check Google Calendar connection' });
  }
});

// Generate Google OAuth URL
router.get('/auth/google', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const oAuth2Client = createOAuth2Client();
    
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
    //   prompt: 'consent',
      state: userId
    });
    
    res.json({ authUrl });
  } catch (error) {
    logger.error('Failed to generate Google auth URL', { error, userId: req.user.id });
    res.status(500).json({ error: 'Failed to generate Google authorization URL' });
  }
});

// Handle OAuth callback
router.get('/auth/google/callback', async (req, res) => {
  const { code, state: userId } = req.query;
  
  if (!code || !userId) {
    return res.status(400).send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({type: 'google-calendar-error', message: 'Missing authorization code'}, '*');
            setTimeout(() => window.close(), 1000);
          </script>
          <div style="text-align:center; font-family:sans-serif; padding-top:50px;">
            <h2>Error: Invalid Authorization</h2>
            <p>Missing required parameters. This window will close automatically.</p>
          </div>
        </body>
      </html>
    `);
  }
  
  try {
    const oAuth2Client = createOAuth2Client();
    
    // Exchange code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    
    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    // Update user in database
    await User.findByIdAndUpdate(userId, {
      googleAuth: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture
      }
    });
    
    // Return success page
    return res.status(200).send(`
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              text-align: center;
              padding-top: 50px;
              background-color: #f7f9fc;
              color: #333;
            }
            .card {
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              max-width: 500px;
              margin: 0 auto;
              padding: 30px;
            }
            .success-icon {
              color: #4caf50;
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              margin-bottom: 16px;
              color: #2e7d32;
            }
            p {
              color: #666;
              margin-bottom: 20px;
            }
            .progress {
              width: 100%;
              height: 4px;
              background: #e0e0e0;
              position: relative;
              margin-top: 30px;
              overflow: hidden;
              border-radius: 2px;
            }
            .progress-bar {
              position: absolute;
              height: 100%;
              background: #4caf50;
              width: 0%;
              animation: progress 2s linear forwards;
            }
            @keyframes progress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="success-icon">✓</div>
            <h1>Connection Successful!</h1>
            <p>Your Google Calendar has been successfully connected.</p>
            <p>This window will close automatically in a few seconds.</p>
            <div class="progress"><div class="progress-bar"></div></div>
          </div>
          <script>
            window.opener.postMessage({type: 'google-calendar-connected', email: '${userInfo.data.email}'}, '*');
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    logger.error('OAuth callback error', { error, userId });
    
    return res.status(500).send(`
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              text-align: center;
              padding-top: 50px;
              background-color: #f7f9fc;
              color: #333;
            }
            .card {
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              max-width: 500px;
              margin: 0 auto;
              padding: 30px;
            }
            .error-icon {
              color: #f44336;
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              margin-bottom: 16px;
              color: #c62828;
            }
            p {
              color: #666;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="error-icon">✕</div>
            <h1>Connection Failed</h1>
            <p>We couldn't connect to your Google Calendar.</p>
            <p>Please try again or contact support if the issue persists.</p>
          </div>
          <script>
            window.opener.postMessage({type: 'google-calendar-error', message: 'Authentication failed'}, '*');
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `);
  }
});

// List calendar events
router.get('/events', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const calendar = await getCalendarClient(userId);
    
    // Parse date range parameters or use defaults
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);
    
    const oneMonthFromNow = new Date(now);
    oneMonthFromNow.setMonth(now.getMonth() + 1);
    
    const timeMin = req.query.timeMin || oneMonthAgo.toISOString();
    const timeMax = req.query.timeMax || oneMonthFromNow.toISOString();
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 2500
    });
    
    res.json({ 
      events: response.data.items,
      nextSyncToken: response.data.nextSyncToken
    });
  } catch (error) {
    if (error.message === 'NOT_CONNECTED') {
      return res.status(401).json({ error: 'Not connected to Google Calendar' });
    }
    
    logger.error('Failed to list calendar events', { error, userId: req.user.id });
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Create a new event
router.post('/events', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const calendar = await getCalendarClient(userId);
    
    // Validate required fields
    if (!req.body.title) {
      return res.status(400).json({ error: 'Event title is required' });
    }
    
    if (!req.body.start) {
      return res.status(400).json({ error: 'Event start time is required' });
    }
    
    // Build event resource
    const eventData = {
      summary: req.body.title,
      location: req.body.location || undefined,
      description: req.body.description || undefined,
      start: {},
      end: {},
      colorId: req.body.colorId || undefined
    };
    
    // Add attendees if provided
    if (req.body.attendees && Array.isArray(req.body.attendees) && req.body.attendees.length > 0) {
      eventData.attendees = req.body.attendees.map(attendee => ({
        email: attendee.email,
        displayName: attendee.name || undefined
      }));
    }
    
    // Add Google Meet if requested
    if (req.body.enableMeet) {
      eventData.conferenceData = {
        createRequest: {
          requestId: `${Date.now()}-${userId}-${Math.random().toString(36).substring(2, 7)}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      };
    }
    
    // Handle all-day vs timed events
    if (req.body.allDay) {
      const startDate = req.body.start.split('T')[0];
      let endDate;
      
      if (req.body.end) {
        endDate = req.body.end.split('T')[0];
      } else {
        endDate = startDate;
      }
      
      // Google Calendar requires +1 day for all-day events
      const endDateObj = new Date(endDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      endDate = endDateObj.toISOString().split('T')[0];
      
      eventData.start.date = startDate;
      eventData.end.date = endDate;
    } else {
      eventData.start.dateTime = req.body.start;
      
      if (!req.body.end) {
        const endTime = new Date(new Date(req.body.start).getTime() + 60*60*1000);
        eventData.end.dateTime = endTime.toISOString();
      } else {
        eventData.end.dateTime = req.body.end;
      }
      
      if (req.body.timeZone) {
        eventData.start.timeZone = req.body.timeZone;
        eventData.end.timeZone = req.body.timeZone;
      }
    }
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: eventData,
      conferenceDataVersion: req.body.enableMeet ? 1 : 0,
      sendUpdates: req.body.notifyAttendees ? 'all' : 'none'
    });
    
    res.status(201).json({ event: response.data });
  } catch (error) {
    if (error.message === 'NOT_CONNECTED') {
      return res.status(401).json({ error: 'Not connected to Google Calendar' });
    }
    
    logger.error('Failed to create calendar event', { error, userId: req.user.id });
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// Update an existing event
router.put('/events/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }
    
    const calendar = await getCalendarClient(userId);
    
    // Get existing event first
    const existingEvent = await calendar.events.get({
      calendarId: 'primary',
      eventId
    });
    
    // Build update payload
    const eventData = {
      summary: req.body.title || existingEvent.data.summary,
      location: 'location' in req.body ? req.body.location : existingEvent.data.location,
      description: 'description' in req.body ? req.body.description : existingEvent.data.description,
      colorId: 'colorId' in req.body ? req.body.colorId : existingEvent.data.colorId,
      start: {},
      end: {}
    };
    
    // Update attendees if provided
    if (req.body.attendees && Array.isArray(req.body.attendees)) {
      eventData.attendees = req.body.attendees.map(attendee => ({
        email: attendee.email,
        displayName: attendee.name || undefined
      }));
    }
    
    // Handle all-day vs timed events
    const isAllDay = 'allDay' in req.body ? req.body.allDay : Boolean(existingEvent.data.start.date);
    
    if (isAllDay) {
      let startDate;
      let endDate;
      
      if (req.body.start) {
        startDate = req.body.start.split('T')[0];
      } else {
        startDate = existingEvent.data.start.date;
      }
      
      if (req.body.end) {
        endDate = req.body.end.split('T')[0];
        
        // Add a day to end date for all-day events
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        endDate = endDateObj.toISOString().split('T')[0];
      } else if (existingEvent.data.end.date) {
        endDate = existingEvent.data.end.date;
      } else {
        endDate = startDate;
      }
      
      eventData.start.date = startDate;
      eventData.end.date = endDate;
    } else {
      eventData.start.dateTime = req.body.start || existingEvent.data.start.dateTime;
      
      if (req.body.end) {
        eventData.end.dateTime = req.body.end;
      } else if (existingEvent.data.end.dateTime) {
        eventData.end.dateTime = existingEvent.data.end.dateTime;
      } else {
        const endTime = new Date(new Date(eventData.start.dateTime).getTime() + 60*60*1000);
        eventData.end.dateTime = endTime.toISOString();
      }
      
      // Preserve timezone if it exists
      if (existingEvent.data.start.timeZone) {
        eventData.start.timeZone = req.body.timeZone || existingEvent.data.start.timeZone;
        eventData.end.timeZone = req.body.timeZone || existingEvent.data.end.timeZone;
      }
    }
    
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      resource: eventData,
      sendUpdates: req.body.notifyAttendees ? 'all' : 'none'
    });
    
    res.json({ event: response.data });
  } catch (error) {
    if (error.message === 'NOT_CONNECTED') {
      return res.status(401).json({ error: 'Not connected to Google Calendar' });
    }
    
    logger.error('Failed to update calendar event', { 
      error, 
      userId: req.user.id,
      eventId: req.params.id 
    });
    
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
});

// Delete an event
router.delete('/events/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }
    
    const calendar = await getCalendarClient(userId);
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: req.query.notifyAttendees === 'true' ? 'all' : 'none'
    });
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    if (error.message === 'NOT_CONNECTED') {
      return res.status(401).json({ error: 'Not connected to Google Calendar' });
    }
    
    logger.error('Failed to delete calendar event', { 
      error, 
      userId: req.user.id,
      eventId: req.params.id 
    });
    
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

// Disconnect Google Calendar
router.post('/disconnect', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await User.findByIdAndUpdate(userId, {
      $unset: { googleAuth: "" }
    });
    
    res.json({
      success: true,
      message: 'Google Calendar disconnected successfully'
    });
  } catch (error) {
    logger.error('Failed to disconnect Google Calendar', { error, userId: req.user.id });
    res.status(500).json({ error: 'Failed to disconnect Google Calendar' });
  }
});

export default router;