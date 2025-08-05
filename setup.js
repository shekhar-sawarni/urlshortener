#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 URL Shortener Setup Wizard');
console.log('==============================\n');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  try {
    // Check if .env already exists
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }

    console.log('📝 Let\'s configure your environment variables:\n');

    // MongoDB Configuration
    console.log('🔗 MongoDB Atlas Configuration:');
    const mongoUsername = await question('MongoDB Username (SHEKHARSAWARNI): ') || 'SHEKHARSAWARNI';
    const mongoPassword = await question('MongoDB Password: ');
    const mongoCluster = await question('MongoDB Cluster URL (cluster0.jutcywq.mongodb.net): ') || 'cluster0.jutcywq.mongodb.net';
    const mongoAppName = await question('MongoDB App Name (Cluster0): ') || 'Cluster0';

    // Redis Configuration
    console.log('\n🔴 Redis Configuration:');
    console.log('For Redis Cloud, you can use the full URL or enter details separately.');
    const useRedisUrl = await question('Use full Redis URL? (y/N): ');
    
    let redisUrl, redisHost, redisPort, redisPassword;
    
    if (useRedisUrl.toLowerCase() === 'y') {
      redisUrl = await question('Redis URL (e.g., redis://default:password@host:port): ');
    } else {
      redisHost = await question('Redis Host: ');
      redisPort = await question('Redis Port (6379): ') || '6379';
      redisPassword = await question('Redis Password: ');
      redisUrl = `redis://${redisPassword ? `${redisPassword}@` : ''}${redisHost}:${redisPort}`;
    }

    // Server Configuration
    console.log('\n⚙️  Server Configuration:');
    const port = await question('Server Port (3000): ') || '3000';
    const baseUrl = await question('Base URL (http://localhost:3000): ') || 'http://localhost:3000';

    // Build environment content
    const envContent = `# Server Configuration
PORT=${port}
NODE_ENV=development

# MongoDB Atlas URIs (30 clusters for sharding)
# Each URI maps to a specific postfix character (0-9, a-z, excluding some chars)
# You can start with just one cluster and add more as needed
# The application will automatically use the available clusters

# Required: At least one MongoDB cluster
MONGODB_URI_0=mongodb+srv://${mongoUsername}:${mongoPassword}@${mongoCluster}/?retryWrites=true&w=majority&appName=${mongoAppName}

# Optional: Add more clusters for better sharding (uncomment and configure as needed)
# MONGODB_URI_1=mongodb+srv://SHEKHARSAWARNI:shekhar@cluster1.mongodb.net/urlshortener?retryWrites=true&w=majority
# MONGODB_URI_2=mongodb+srv://username:password@cluster2.mongodb.net/urlshortener?retryWrites=true&w=majority
# ... (add more as needed)

# Redis Configuration (Upstash/Redis Cloud)
REDIS_URL=${redisUrl}
${redisHost ? `REDIS_HOST=${redisHost}` : '# REDIS_HOST='}
${redisPort ? `REDIS_PORT=${redisPort}` : '# REDIS_PORT='}
${redisPassword ? `REDIS_PASSWORD=${redisPassword}` : '# REDIS_PASSWORD='}

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=30
RATE_LIMIT_WINDOW_MS=86400000

# URL Configuration
BASE_URL=${baseUrl}
SHORT_CODE_LENGTH=6
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Environment configuration saved to .env file!');
    console.log('\n📋 Next steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Start the server: npm run dev');
    console.log('3. Test the API: curl http://localhost:3000/health');
    console.log('\n🔗 API Endpoints:');
    console.log('- POST /api/shorten - Create short URL');
    console.log('- GET /api/:code - Redirect to original URL');
    console.log('- GET /health - Health check');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setup(); 