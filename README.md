# 🔗 URL Shortener Service

A scalable URL shortening service built with Node.js, Express, MongoDB Atlas (sharded), and Redis caching.

## 🚀 Features

- **URL Shortening**: Create short URLs with custom expiration
- **MongoDB Sharding**: Distributed across 36 clusters for scalability
- **Redis Caching**: Fast response times with intelligent caching
- **Rate Limiting**: Protection against abuse (30 requests/day per IP)
- **Web Interface**: Beautiful, modern UI for URL shortening
- **API Endpoints**: RESTful API for programmatic access
- **Docker Ready**: Containerized deployment
- **Serverless Ready**: Deploy on Vercel, Render, or any platform

## 🏗️ Architecture

### Load Balancing Strategy
- **36 MongoDB clusters** (0-9, a-z postfixes)
- **Automatic sharding** based on URL postfix character
- **Redis caching** for frequently accessed URLs
- **Horizontal scaling** ready

### Database Design
```
URL Document:
{
  shortCode: "abc123",     // 6-char payload
  longUrl: "https://...",  // Original URL
  expiresAt: Date,         // TTL for automatic cleanup
  createdAt: Date          // Creation timestamp
}
```

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/shekhar-sawarni/urlshortener.git
cd urlshortener
npm install
```

### 2. Configure Environment
```bash
# Interactive setup
npm run setup

# Or manually create .env file
cp env.example .env
# Edit .env with your credentials
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access the Application
- **Web Interface**: http://localhost:3000/
- **Health Check**: http://localhost:3000/health
- **API Docs**: See below

## 📡 API Endpoints

### Create Short URL
```bash
POST /api/shorten
Content-Type: application/json

{
  "longUrl": "https://example.com/very-long-url",
  "daysToLive": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shortUrl": "http://localhost:3000/api/abc123u",
    "shortCode": "abc123u",
    "longUrl": "https://example.com/very-long-url",
    "expiresAt": "2024-02-05T10:30:00.000Z"
  }
}
```

### Redirect to Original URL
```bash
GET /api/{shortCode}
```

**Response:** 302 Redirect to original URL

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-05T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "port": 3000
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI_0` | Primary MongoDB cluster | Required |
| `REDIS_URL` | Redis connection string | Required |
| `BASE_URL` | Base URL for short URLs | `http://localhost:3000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per day | `30` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `86400000` |
| `SHORT_CODE_LENGTH` | Short code length | `6` |

### MongoDB Setup
1. Create MongoDB Atlas cluster(s)
2. Get connection string
3. Set `MONGODB_URI_0` environment variable
4. For sharding, add more `MONGODB_URI_1`, `MONGODB_URI_2`, etc.

### Redis Setup
1. Create Redis Cloud instance
2. Get connection string
3. Set `REDIS_URL` environment variable

## 🚀 Deployment

### Render (Recommended)
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Render
# - Go to render.com
# - Connect your GitHub repo
# - Set environment variables
# - Deploy!
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Docker
```bash
# Build image
docker build -t url-shortener .

# Run container
docker run -p 3000:3000 --env-file .env url-shortener
```

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test specific endpoint
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://www.google.com", "daysToLive": 30}'
```

## 📊 Monitoring

### Health Checks
- **Application**: `/health`
- **Database**: Automatic connection monitoring
- **Redis**: Connection status logging

### Logs
- **Development**: Console output
- **Production**: Structured logging
- **Errors**: Detailed error tracking

## 🔒 Security

- **Rate Limiting**: Prevents abuse
- **Input Validation**: Sanitizes all inputs
- **CORS**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Environment Variables**: Secure credential management

## 🏗️ Project Structure

```
url-shortener/
├── src/
│   ├── config/
│   │   ├── mongodb.js      # MongoDB connection management
│   │   └── redis.js        # Redis connection management
│   ├── controllers/
│   │   └── urlController.js # Request handlers
│   ├── middleware/
│   │   └── errorHandler.js  # Global error handling
│   ├── routes/
│   │   └── urlRoutes.js     # API route definitions
│   ├── services/
│   │   └── urlService.js    # Business logic
│   ├── utils/
│   │   └── shortCodeGenerator.js # URL generation utilities
│   └── server.js           # Main application file
├── public/
│   └── index.html          # Web interface
├── test/
│   └── basic.test.js       # Unit tests
├── package.json
├── Dockerfile
├── render.yaml
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/shekhar-sawarni/urlshortener/issues)
- **Documentation**: See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
- **Configuration**: See [CONFIGURATION.md](CONFIGURATION.md) for setup help

---

**Built with ❤️ using Node.js, Express, MongoDB, and Redis** 