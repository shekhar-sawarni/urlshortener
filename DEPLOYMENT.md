# 🚀 Deploy URL Shortener to Render

This guide will help you deploy your URL shortener to Render's free tier.

## 📋 Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas**: Your existing MongoDB cluster
4. **Redis Cloud**: Your existing Redis instance

## 🔧 Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 1.2 Verify Files
Make sure these files are in your repository:
- ✅ `package.json`
- ✅ `src/server.js`
- ✅ `render.yaml`
- ✅ `public/index.html`
- ✅ All source files

## 🌐 Step 2: Deploy to Render

### 2.1 Connect GitHub to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with your GitHub account
3. Click "New +" → "Web Service"
4. Connect your GitHub repository

### 2.2 Configure the Service
- **Name**: `url-shortener` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 2.3 Environment Variables
Add these environment variables in Render dashboard:

#### Required Variables:
```
NODE_ENV=production
PORT=10000
BASE_URL=https://your-app-name.onrender.com
MONGODB_URI_0=mongodb+srv://username:password@cluster0.mongodb.net/?retryWrites=true&w=majority
REDIS_URL=redis://username:password@host:port
```

#### Optional Variables:
```
RATE_LIMIT_MAX_REQUESTS=30
RATE_LIMIT_WINDOW_MS=86400000
SHORT_CODE_LENGTH=6
```

### 2.4 Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. Wait for the build to complete (usually 2-5 minutes)

## 🔍 Step 3: Verify Deployment

### 3.1 Check Health Endpoint
```
https://your-app-name.onrender.com/health
```
Should return:
```json
{
  "status": "OK",
  "timestamp": "2025-08-05T...",
  "uptime": 123.456
}
```

### 3.2 Test Web Interface
```
https://your-app-name.onrender.com/
```
Should show the URL shortener web interface.

### 3.3 Test API Endpoints
```bash
# Create short URL
curl -X POST https://your-app-name.onrender.com/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://www.google.com", "daysToLive": 30}'

# Test redirect
curl -I https://your-app-name.onrender.com/api/YOUR_SHORT_CODE
```

## ⚙️ Step 4: Configure Custom Domain (Optional)

1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add your domain (e.g., `short.yourdomain.com`)
4. Update DNS records as instructed
5. Update `BASE_URL` environment variable

## 🔧 Step 5: Monitoring & Scaling

### 5.1 Free Tier Limitations
- **Sleep after 15 minutes** of inactivity
- **512 MB RAM**
- **Shared CPU**
- **750 hours/month** (enough for 24/7)

### 5.2 Upgrade to Paid (Optional)
- **Starter Plan**: $7/month for always-on service
- **Standard Plan**: $25/month for better performance

### 5.3 Monitoring
- **Logs**: Available in Render dashboard
- **Metrics**: CPU, memory, response times
- **Alerts**: Set up for errors and downtime

## 🚨 Troubleshooting

### Common Issues:

#### 1. Build Fails
```bash
# Check logs in Render dashboard
# Common causes:
# - Missing dependencies in package.json
# - Syntax errors in code
# - Environment variables not set
```

#### 2. App Crashes
```bash
# Check application logs
# Common causes:
# - Database connection issues
# - Missing environment variables
# - Port conflicts
```

#### 3. Slow Response Times
```bash
# Free tier limitations:
# - Cold starts after 15 minutes of inactivity
# - Shared resources
# - Consider upgrading to paid plan
```

#### 4. Database Connection Issues
```bash
# Check:
# - MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
# - Redis Cloud network access
# - Connection strings are correct
```

## 🔄 Step 6: Continuous Deployment

### Automatic Deployments
- Render automatically deploys when you push to `main` branch
- You can configure branch-specific deployments
- Set up preview environments for pull requests

### Manual Deployments
```bash
# Trigger manual deployment from Render dashboard
# Or push a new commit to trigger automatic deployment
```

## 📊 Step 7: Performance Optimization

### 1. Enable Caching
- Redis is already configured for caching
- Monitor cache hit rates in logs

### 2. Database Optimization
- MongoDB indexes are already configured
- Monitor query performance

### 3. CDN (Optional)
- Consider using Cloudflare for static assets
- Configure custom domain with CDN

## 🎉 Success!

Your URL shortener is now live at:
```
https://your-app-name.onrender.com/
```

### Features Available:
- ✅ Web interface for URL shortening
- ✅ API endpoints for programmatic access
- ✅ Automatic scaling and monitoring
- ✅ SSL/HTTPS enabled
- ✅ Global CDN

### Next Steps:
1. **Test thoroughly** with real URLs
2. **Monitor performance** and logs
3. **Set up alerts** for errors
4. **Consider upgrading** to paid plan for production use
5. **Add custom domain** for branding

## 📞 Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Render Support**: Available in dashboard
- **GitHub Issues**: For code-related problems

---

**Happy Deploying! 🚀** 