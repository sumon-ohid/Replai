# 📧 Replai.tech - AI-Powered Email Automation

Replai is an intelligent email automation platform that connects to your Google account, monitors your inbox in real-time, and generates context-aware responses using advanced AI. Maintain seamless communication while enhancing productivity with automated, professional email handling.

## 🚀 Features

- **🔐 Secure Google Integration** - Enterprise-grade OAuth 2.0 authentication for safe Gmail account connection.
- **🤖 Smart Response Engine** - Context-aware AI generates natural, professional email responses.
- **⏱️ Real-Time Processing** - 60-second monitoring interval with instant reply delivery.
- **🔒 Privacy First** - Best encryption and strict data protection protocols.

## 📸 Application Preview

## 🛠 Installation & Usage

### **Requirements**
- Google Workspace Account
- Vite
- Node.js

### **Quick Start**
```sh
# Clone repository
git clone https://github.com/yourrepo/email-agent.git

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start the service
npm run start
```

## 🔧 Configuration
Set up your Google OAuth 2.0 credentials and AI parameters in the `.env` file:
```ini
MONGO_URL='' # Database provider
GENERATIVE_AI_API_KEY='' # Gemini API key
AUTHORIZATION_CODE="" # Figure it out
JWT_SECRET='' # Random string for JWT token genaration
PORT='' # Where Vite app will run
CLIENT_ID="" # Get from Goolge Console
CLIENT_SECRET="" # Get from Goolge Console
VITE_API_BASE_URL='' # Backend api url
DASHBOARD_URL='' # Where to redirect after auth
```

Frontend `.env`file:
```ini
VITE_API_BASE_URL='http://localhost:3000'
```

## 📄 License
ISC License © 2025 Replai Team

## 📬 Contact
For support and inquiries: [support@replai.tech](mailto:support@replai.tech)
