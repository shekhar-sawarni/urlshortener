# URL Shortener Service

A scalable URL shortening service built with Node.js, Express, MongoDB Atlas (sharded), and Redis caching.

## Features

- **Scalable Architecture**: MongoDB Atlas with sharded clusters based on postfix characters
- **High Performance**: Redis caching for fast URL lookups
- **Rate Limiting**: 30 requests per day per IP address
- **Automatic Expiration**: URLs expire based on configurable TTL
- **Docker Ready**: Containerized for easy deployment
- **Serverless Ready**: Compatible with Vercel, Render, and other platforms
- **Flexible Setup**: Start with one MongoDB cluster, add more as needed

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas (start with 1 cluster, scale to 30 for sharding)
- **Cache**: Redis (Upstash/Redis Cloud free tier)
- **Deployment**: Docker, Vercel, Render ready

## Architecture

### URL Structure
- **Short Code**: 7 characters total
  - **Payload**: 6 characters (Base62)
  - **Postfix**: 1 character (0-9, a-z) - maps to MongoDB cluster

### Sharding Strategy
- Last character of short code determines MongoDB cluster
- Start with 1 cluster, scale to 30 clusters (0-9, a-z)
- Each cluster stores: `{ shortCode: payload, longUrl, expiresAt }`
- **Smart Fallback**: If specific cluster unavailable, uses first available cluster

### Caching Strategy
- Redis key: `short:<fullCode>` → `longUrl`
- TTL: `daysToLive * 86400` seconds
- Cache-first approach for fast lookups

## Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB Atlas account (1 free cluster to start)
- Redis account (Upstash/Redis Cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd url-shortener
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Quick Setup (Recommended)**
   ```bash
   npm run setup
   ```
   This interactive wizard will help you configure your environment variables.

4. **Manual Setup (Alternative)**
   ```bash
   cp env.example .env
   ```
   Then edit `.env` file with your credentials.

5. **Start the server**
   ```bash
   npm run dev
   ```

### Environment Configuration

The setup wizard will ask for:
- **MongoDB Atlas**: Username, password, cluster URL
- **Redis**: Host, port, password (optional)
- **Server**: Port, base URL

**Example .env file:**
```env
# Required: At least one MongoDB cluster
MONGODB_URI_0=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Redis Configuration
REDIS_URL=redis://username:password@host:port

# Server Configuration
PORT=3000
BASE_URL=http://localhost:3000
```

## API Documentation

### Create Short URL
**POST** `/api/shorten`

**Request Body:**
```json
{
  "longUrl": "https://example.com/very/long/url",
  "daysToLive": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shortCode": "abc123x",
    "shortUrl": "http://localhost:3000/api/abc123x",
    "longUrl": "https://example.com/very/long/url",
    "expiresAt": "2024-01-15T10:30:00.000Z",
    "daysToLive": 30
  }
}
```

### Redirect to Original URL
**GET** `/api/:code`

Redirects to the original URL (301 redirect)

### Get URL Statistics
**GET** `/api/stats/:code`

**Response:**
```json
{
  "success": true,
  "data": {
    "shortCode": "abc123x",
    "longUrl": "https://example.com/very/long/url",
    "createdAt": "2024-01-01T10:30:00.000Z",
    "expiresAt": "2024-01-15T10:30:00.000Z",
    "isExpired": false
  }
}
```

### Cleanup Expired URLs
**POST** `/api/cleanup`

**Response:**
```json
{
  "success": true,
  "message": "Cleaned up 5 expired URLs",
  "removedCount": 5
}
```

### Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T10:30:00.000Z",
  "uptime": 3600
}
```

## Rate Limiting

- **Limit**: 30 requests per day per IP
- **Window**: 24 hours
- **Storage**: Redis with automatic expiration

## Scaling Strategy

### Phase 1: Single Cluster (Recommended to start)
- Use one MongoDB Atlas free cluster
- All short codes use the same cluster
- Perfect for testing and small-scale usage

### Phase 2: Multiple Clusters (Scale when needed)
- Add more MongoDB Atlas clusters
- Configure additional `MONGODB_URI_1`, `MONGODB_URI_2`, etc.
- Automatic sharding based on postfix characters
- Better performance and scalability

## Docker Deployment

### Build and Run
```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

### Docker Compose (Optional)
```yaml
version: '3.8'
services:
  url-shortener:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Serverless Deployment

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

### Render
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy automatically

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment | development | No |
| `MONGODB_URI_0` | First MongoDB Atlas URI | - | **Yes** |
| `MONGODB_URI_*` | Additional MongoDB URIs | - | No |
| `REDIS_URL` | Redis connection URL | - | **Yes** |
| `BASE_URL` | Base URL for short URLs | http://localhost:3000 | No |
| `RATE_LIMIT_MAX_REQUESTS` | Daily rate limit | 30 | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 86400000 | No |

## Database Setup

### MongoDB Atlas (Required)
1. Create a free MongoDB Atlas cluster
2. Get connection string
3. Set `MONGODB_URI_0` environment variable

### Additional MongoDB Clusters (Optional)
1. Create more free-tier clusters as needed
2. Set `MONGODB_URI_1`, `MONGODB_URI_2`, etc.
3. Application automatically uses available clusters

### Redis Setup
1. Create Redis instance (Upstash/Redis Cloud)
2. Get connection URL
3. Set `REDIS_URL` environment variable

## Monitoring and Maintenance

### Health Checks
- Endpoint: `/health`
- Docker health check included
- Monitors server status and uptime

### Housekeeping
- Automatic TTL cleanup via MongoDB indexes
- Manual cleanup via `/api/cleanup` endpoint
- Expired URLs automatically removed

### Logging
- Request/response logging
- Error tracking
- Performance monitoring

## Security Features

- **Input Validation**: All inputs validated and sanitized
- **Rate Limiting**: Prevents abuse
- **CORS**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Error Handling**: No sensitive data in error responses

## Performance Optimizations

- **Redis Caching**: Fast URL lookups
- **MongoDB Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections
- **Smart Sharding**: Distributed load across available clusters

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check connection string format
   - Verify network access (IP whitelist)
   - Ensure cluster is active

2. **Redis Connection Failed**
   - Verify Redis URL format
   - Check credentials
   - Ensure Redis instance is running

3. **Rate Limit Exceeded**
   - Wait 24 hours or use different IP
   - Check Redis connection

4. **Short Code Not Found**
   - URL may have expired
   - Check MongoDB cluster mapping
   - Verify short code format

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and stack traces.

### Testing
```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

MIT License - see LICENSE file for details. 