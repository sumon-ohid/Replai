# Email Management Module

## Overview
This module provides comprehensive email management functionality including connection management, automation, and monitoring for multiple email providers (Google, Outlook, IMAP/SMTP).

## Features
- Multiple email provider support (Gmail, Outlook, custom IMAP/SMTP)
- OAuth2 authentication and token management
- Real-time email monitoring and sync
- AI-powered email automation
- Comprehensive error handling and monitoring
- Connection health checks and auto-recovery
- Detailed status reporting and metrics

## Architecture

### Core Components
1. **Managers**
   - `connectionManager.js`: Handles email connections lifecycle
   - `schedulingManager.js`: Manages periodic email checking
   - `notificationManager.js`: Handles system notifications

2. **Services**
   - `googleEmailService.js`: Gmail integration
   - `outlookEmailService.js`: Outlook/Microsoft 365 integration
   - `customEmailService.js`: IMAP/SMTP support
   - `emailProcessingService.js`: AI email processing

3. **Controllers**
   - `connectionController.js`: Connection management
   - `automationController.js`: Automation settings
   - `statusController.js`: Status monitoring

4. **Routes**
   - `connectionRoutes.js`: Connection endpoints
   - `automationRoutes.js`: Automation endpoints
   - `statusRoutes.js`: Status endpoints

### Utils
- `errorHandler.js`: Centralized error handling
- `tokenManager.js`: OAuth token management
- `emailConfig.js`: Configuration management

## Setup

1. Environment Variables
```bash
cp .env.example .env
```

2. Required dependencies
```json
{
  "dependencies": {
    "@google-cloud/local-auth": "^2.1.0",
    "@microsoft/microsoft-graph-client": "^3.0.0",
    "googleapis": "^105.0.0",
    "imapflow": "^1.0.0",
    "nodemailer": "^6.0.0"
  }
}
```

3. Configuration
```javascript
// In emailConfig.js
export const emailConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // ...
  },
  // ...
};
```

## Usage

### Connecting Email Accounts

1. Google Account
```javascript
const result = await ConnectionManager.setupGoogleEmailSync(userId, tokens);
```

2. Outlook Account
```javascript
const result = await ConnectionManager.setupOutlookEmailSync(userId, tokens);
```

3. Custom IMAP/SMTP
```javascript
const result = await ConnectionManager.setupCustomEmailSync(userId, credentials);
```

### Email Automation

1. Configure automation settings
```javascript
await AutomationController.updateSettings(email, {
  mode: 'auto-reply',
  templates: [...],
  rules: [...]
});
```

2. Process emails
```javascript
const result = await EmailProcessingService.processEmail(email, config);
```

### Monitoring

1. Check connection status
```javascript
const status = await StatusController.getConnectionStatus(email);
```

2. Get performance metrics
```javascript
const metrics = await StatusController.getPerformanceMetrics(email);
```

## Error Handling
The module uses a structured error handling system:

```javascript
try {
  await someOperation();
} catch (error) {
  if (error instanceof ConnectionError) {
    // Handle connection errors
  } else if (error instanceof AuthenticationError) {
    // Handle auth errors
  }
}
```

## Best Practices

1. Token Management
   - Always use TokenManager for handling OAuth tokens
   - Implement proper token refresh mechanisms
   - Securely store tokens

2. Error Handling
   - Use appropriate error classes
   - Implement proper error recovery
   - Log errors with context

3. Performance
   - Use connection pooling
   - Implement batch processing
   - Monitor memory usage

4. Security
   - Validate all inputs
   - Encrypt sensitive data
   - Implement rate limiting

## Monitoring and Maintenance

1. Health Checks
```javascript
const health = await StatusController.getSystemHealth();
```

2. Metrics
```javascript
const metrics = await StatusController.getPerformanceMetrics(email);
```

3. Logs
```javascript
const logs = await StatusController.getLogs(email);
```

## Rate Limiting
The module implements rate limiting to prevent abuse:
- 60 sync requests per minute
- 5 auth attempts per minute
- 100 automated responses per day

## Development

1. Running Tests
```bash
npm test emails
```

2. Linting
```bash
npm run lint
```

3. Development Mode
```bash
npm run dev
```

## Troubleshooting

1. Connection Issues
   - Check network connectivity
   - Verify credentials
   - Check token validity

2. Sync Issues
   - Check sync intervals
   - Verify folder permissions
   - Check for rate limiting

3. Authentication Issues
   - Verify OAuth credentials
   - Check token expiration
   - Verify redirect URIs

## Contributing
1. Follow the project's coding style
2. Write tests for new features
3. Update documentation
4. Submit PRs with detailed descriptions

## License
MIT
