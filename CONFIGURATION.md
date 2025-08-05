# Configuration Guide

## Quick Setup with Your Redis Cloud

Based on your Redis CLI command, here's how to configure your URL shortener:

### 1. Create .env file

Create a `.env` file in the root directory with the following content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Atlas URIs (30 clusters for sharding)
# Each URI maps to a specific postfix character (0-9, a-z, excluding some chars)
# You can start with just one cluster and add more as needed
# The application will automatically use the available clusters

# Required: At least one MongoDB cluster
# TODO: Replace <your_mongodb_password> with your actual MongoDB password
MONGODB_URI_0=mongodb+srv://SHEKHARSAWARNI:<your_mongodb_password>@cluster0.jutcywq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Optional: Add more clusters for better sharding (uncomment and configure as needed)
# MONGODB_URI_1=mongodb+srv://SHEKHARSAWARNI:shekhar@cluster1.mongodb.net/urlshortener?retryWrites=true&w=majority
# MONGODB_URI_2=mongodb+srv://username:password@cluster2.mongodb.net/urlshortener?retryWrites=true&w=majority
# ... (add more as needed)

# Redis Configuration (Redis Cloud)
REDIS_URL=redis://default:VzIJrdedWbGGVKKhWh9brZ72sTVV0K44@redis-19433.c12.us-east-1-4.ec2.redns.redis-cloud.com:19433

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=30
RATE_LIMIT_WINDOW_MS=86400000

# URL Configuration
BASE_URL=http://localhost:3000
SHORT_CODE_LENGTH=6
```

### 2. Update MongoDB Password

Replace `<your_mongodb_password>` in the `MONGODB_URI_0` line with your actual MongoDB Atlas password.

### 3. Install and Run

```bash
# Install dependencies
npm install

# Start the server
npm run dev
```

### 4. Test the Setup

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test URL shortening
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://example.com", "daysToLive": 30}'
```

## Your Redis Configuration

Your Redis Cloud instance is already configured:
- **Host**: redis-19433.c12.us-east-1-4.ec2.redns.redis-cloud.com
- **Port**: 19433
- **Password**: VzIJrdedWbGGVKKhWh9brZ72sTVV0K44
- **Username**: default

## MongoDB Configuration

You need to:
1. Get your MongoDB Atlas password
2. Replace `<your_mongodb_password>` in the `.env` file
3. Ensure your MongoDB cluster is accessible from your IP address

## Troubleshooting

### Redis Connection Issues
- Verify your Redis Cloud instance is active
- Check if the password is correct
- Ensure network connectivity

### MongoDB Connection Issues
- Verify your MongoDB Atlas cluster is active
- Check if the password is correct
- Ensure your IP is whitelisted in MongoDB Atlas

### Test Redis Connection
```bash
redis-cli -u redis://default:VzIJrdedWbGGVKKhWh9brZ72sTVV0K44@redis-19433.c12.us-east-1-4.ec2.redns.redis-cloud.com:19433
```

## API Endpoints

Once running, you can use:
- `POST /api/shorten` - Create short URLs
- `GET /api/:code` - Redirect to original URLs
- `GET /health` - Health check
- `GET /api/stats/:code` - Get URL statistics 