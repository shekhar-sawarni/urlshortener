# 🔧 Manual Configuration Guide

This guide helps you manually configure your URL shortener application.

## 📝 Environment Variables

Create a `.env` file in your project root with the following content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Atlas (Single cluster for production)
MONGODB_URI_0=mongodb+srv://username:password@cluster0.mongodb.net/?retryWrites=true&w=majority

# Redis Cloud
REDIS_URL=redis://username:password@host:port

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=30
RATE_LIMIT_WINDOW_MS=86400000

# URL Configuration
BASE_URL=http://localhost:3000
SHORT_CODE_LENGTH=6
```

## 🔧 Configuration Steps

### 1. Update MongoDB URI
Replace `username:password@cluster0.mongodb.net` with your actual MongoDB Atlas credentials.

### 2. Update Redis URL
Replace `username:password@host:port` with your actual Redis Cloud credentials.

### 3. Start the Application
```bash
npm install
npm run dev
```

## 🚀 Your app will be available at:
- **Web Interface**: http://localhost:3000/
- **Health Check**: http://localhost:3000/health
- **API Endpoint**: http://localhost:3000/api/shorten

## 📖 For deployment instructions, see DEPLOYMENT.md 