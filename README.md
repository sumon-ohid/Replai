# 📧 Email Agent - AI-Powered Email Automation

Email Agent is an intelligent email automation platform that connects to your Google account, monitors your inbox in real-time, and generates context-aware responses using advanced AI. Maintain seamless communication while enhancing productivity with automated, professional email handling.

## 🚀 Features

- **🔐 Secure Google Integration** - Enterprise-grade OAuth 2.0 authentication for safe Gmail account connection.
- **🤖 Smart Response Engine** - Context-aware AI generates natural, professional email responses.
- **⏱️ Real-Time Processing** - 60-second monitoring interval with instant reply delivery.
- **🔒 Privacy First** - Best encryption and strict data protection protocols.

## 📸 Application Preview

<img width="1443" alt="Screenshot 2025-02-18 at 20 21 37" src="https://github.com/user-attachments/assets/b0742953-0f85-4e93-83a1-e6357ddd53bb" />
<img width="1449" alt="Screenshot 2025-02-18 at 20 21 19" src="https://github.com/user-attachments/assets/7f3de410-8d55-456b-a575-d963dbc8c77c" />
<img width="1468" alt="Screenshot 2025-02-18 at 20 22 22" src="https://github.com/user-attachments/assets/d338a8bd-749b-45b6-9089-12257985168b" />
<img width="1470" alt="Screenshot 2025-02-18 at 20 22 49" src="https://github.com/user-attachments/assets/60f9facc-d0ba-47bd-a412-d834a93b5140" />
<img width="1470" alt="Screenshot 2025-02-18 at 20 23 15" src="https://github.com/user-attachments/assets/c2bca2e9-7ec7-43d7-8e7c-87fe6155bafd" />
<img width="1469" alt="Screenshot 2025-02-18 at 20 23 47" src="https://github.com/user-attachments/assets/0802b4e5-250b-489a-b30d-657372016d99" />

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
ISC License © 2025 Email Agent Team

## 📬 Contact
For support and inquiries: [support@email-agent.com](mailto:support@email-agent.com)

