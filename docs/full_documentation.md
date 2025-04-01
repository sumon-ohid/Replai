# Replai.tech - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Key Features](#key-features)
6. [APIs and Services](#apis-and-services)
7. [Database Models](#database-models)
8. [Security and Authentication](#security-and-authentication)
9. [Configuration](#configuration)
10. [Development Setup](#development-setup)

## Overview
Replai.tech is an AI-powered email automation platform that integrates with Google Workspace to provide intelligent email monitoring and response generation. The system processes emails in real-time and generates context-aware responses using advanced AI technologies.

## System Architecture

### Email Processing Flow
1. **Email Reception**
   - Real-time monitoring of connected email accounts
   - 60-second interval checks for new emails
   - OAuth-based secure access to mailboxes

2. **Processing Pipeline**
   - Email categorization and priority assignment
   - Sentiment analysis of email content
   - Context extraction and understanding
   - AI-powered response generation
   - Draft creation and review
   - Automated or manual sending based on settings

3. **Monitoring and Feedback**
   - Performance metrics collection
   - Response accuracy tracking
   - User feedback integration
   - System health monitoring
   - Error handling and recovery

### Core Components
1. **Frontend (React + TypeScript)**
   - Built with Vite
   - Material UI components
   - Protected and public routing
   - Responsive dashboard interface

2. **Backend (Node.js)**
   - Express.js server
   - MongoDB database
   - Real-time email monitoring
   - AI integration for response generation

3. **Email Processing System**
   - Real-time inbox monitoring (60-second intervals)
   - Email categorization and analysis
   - Automated response generation
   - Scheduling and notification management

## Backend Architecture

### Email Module (/backend/emails/)
The email module provides comprehensive email management functionality with support for multiple email providers.

#### Core Components
1. **Managers**
   - `connectionManager.js` - Handles email connections lifecycle and recovery
   - `schedulingManager.js` - Manages periodic email checking and sync
   - `notificationManager.js` - System notifications and alerts
   - `monitoringManager.js` - System health and performance monitoring

2. **Services**
   - `automatedResponseService.js` - AI-powered response generation
   - `emailProcessingService.js` - Core email processing pipeline
   - `googleEmailService.js` - Gmail API integration
   - `outlookEmailService.js` - Outlook/Microsoft 365 integration
   - `customEmailService.js` - IMAP/SMTP support
   - `emailServiceFactory.js` - Email service provider factory
   - `draftService.js` - Email draft management

3. **Controllers**
   - `automationController.js` - Automation settings and rules
   - `connectedEmailsController.js` - Email account connections
   - `connectionController.js` - Connection lifecycle management
   - `emailController.js` - Core email operations
   - `statsController.js` - Analytics and metrics
   - `statusController.js` - System status monitoring
   - `draftController.js` - Draft operations

4. **Utils**
   - `emailCategorizer.js` - Smart email classification
   - `emailParser.js` - Email content parsing and analysis
   - `sentimentAnalyzer.js` - Email sentiment analysis
   - `tokenManager.js` - OAuth token management
   - `activeIntervalManager.js` - Sync interval management
   - `errorHandler.js` - Centralized error handling

#### Rate Limiting
- 60 sync requests per minute
- 5 authentication attempts per minute
- 100 automated responses per day

#### Error Handling
The system implements a structured error handling approach:
- Connection errors
- Authentication errors
- Rate limiting errors
- Processing errors
- Token refresh failures

#### Monitoring and Maintenance
1. **Health Checks**
   - Connection status monitoring
   - System health metrics
   - Performance monitoring

2. **Metrics**
   - Response times
   - Processing success rates
   - Email volume statistics
   - AI response accuracy

3. **Logging**
   - Detailed error logging
   - Operation auditing
   - Performance tracking

### Calendar Integration (/backend/calendar/)
- Google Calendar integration for scheduling
- Meeting coordination and availability management

## Frontend Architecture

### Core Components (/frontend/src/)
1. **Authentication**
   - `AuthContext.tsx` - Authentication state management
   - `ProtectedRoute.tsx` - Route protection
   - `PublicRoute.tsx` - Public access routes

2. **Templates**
   - Dashboard interface
   - Email management
   - Settings and configuration
   - User profile management

3. **Features**
   - Real-time email monitoring
   - AI response management
   - Calendar integration
   - Analytics and reporting

## Key Features

### Email Management
- Real-time inbox monitoring
- Context-aware response generation
- Email categorization
- Sentiment analysis
- Custom response templates

### Security
- OAuth 2.0 authentication
- JWT token management
- Encrypted data storage
- Secure API endpoints

### User Management
- User authentication
- Profile management
- Connected email accounts
- Preference settings

## APIs and Services

### Email APIs
1. **Authentication Routes**
   - `/auth/google` - Google OAuth
   - `/auth/connect-email` - Email account connection
   - `/auth/token` - Token management

2. **Email Operations**
   - `/emails/process` - Email processing
   - `/emails/send` - Send emails
   - `/emails/draft` - Draft management

3. **Analytics**
   - `/stats/usage` - Usage statistics
   - `/stats/performance` - System performance

## Database Models

### Core Models
1. **User Model**
   - User authentication
   - Profile information
   - Connected emails
   - Preferences

2. **Email Models**
   - `ConnectedEmail.js` - Connected email accounts
   - `TextData.js` - Email content and metadata
   - `TrainAI.js` - AI training data

3. **System Models**
   - `BlockList.js` - Blocked addresses
   - `Feedback.js` - User feedback
   - `Token.js` - Authentication tokens

## Security and Authentication

### Authentication Flow
1. Google OAuth 2.0 integration
2. JWT token management
3. Secure session handling
4. Email account verification

### Data Protection
- Encrypted storage
- Secure API endpoints
- Privacy-first data handling
- Regular security audits

## Configuration

### Backend Configuration
1. **Database Configuration**
```ini
MONGO_URL='' # MongoDB connection string
```

2. **AI Configuration**
```ini
GENERATIVE_AI_API_KEY='' # Gemini API key for AI processing
```

3. **Authentication**
```ini
JWT_SECRET='' # Random string for JWT token generation
CLIENT_ID='' # Google OAuth client ID
CLIENT_SECRET='' # Google OAuth client secret
```

4. **Server Configuration**
```ini
PORT='' # Server port number
DASHBOARD_URL='' # Dashboard redirect URL after authentication
```

### Frontend Configuration
```ini
VITE_API_BASE_URL='' # Backend API URL (e.g., http://localhost:3000)
```

### Email Provider Configuration
1. **Google Workspace**
```javascript
// emailConfig.js
export const emailConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  }
};
```

2. **Outlook/Microsoft 365**
```javascript
outlook: {
  clientId: process.env.OUTLOOK_CLIENT_ID,
  clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
  redirectUri: process.env.OUTLOOK_REDIRECT_URI
}
```

3. **Custom IMAP/SMTP**
```javascript
custom: {
  imapSettings: {
    maxConnections: 10,
    timeout: 30000
  },
  smtpSettings: {
    pool: true,
    maxConnections: 5
  }
}
```

## Development Setup

### Prerequisites
- Node.js
- MongoDB
- Google Workspace Account
- Vite

### Installation Steps
```bash
# Clone repository
git clone https://github.com/yourrepo/email-agent.git

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run start
```

### Testing and Quality Assurance

#### Unit Testing
```bash
# Run all tests
npm test

# Run specific module tests
npm test emails
npm test calendar
```

#### Integration Testing
```bash
# Run integration tests
npm run test:integration

# Run API tests
npm run test:api
```

#### Notification Testing
```bash
# Test notification system (dry run)
node backend/scripts/sendNotificationToAllUsers.js --title "Test" --message "Test Message" --type info --dry-run

# Test with filters
node backend/scripts/sendNotificationToAllUsers.js --title "Gmail Update" --message "New Gmail features" --filter "@gmail.com"

# Batch testing
node backend/scripts/sendNotificationToAllUsers.js --title "Test" --message "Test Message" --batch-size 100
```

#### Performance Testing
```bash
# Run load tests
npm run test:load

# Test email processing performance
npm run test:email-processing

# Website performance test
npx lighthouse https://replai.tech --view
```

#### Code Quality
- ESLint configuration for consistent code style
- TypeScript for type safety
- Prettier for code formatting
- Husky for pre-commit hooks
- Jest for testing framework

### Maintenance
```bash
# Database management
mongosh
use replai

# Common operations
db.users.find().pretty()
db.tokens.find().pretty()
db.users.deleteMany({}) # Clear users
```

## Support
For technical support and inquiries, contact: support@replai.tech
