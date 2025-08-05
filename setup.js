#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 URL Shortener Setup Wizard');
  console.log('==============================\n');

  try {
    // Check if .env already exists
    if (fs.existsSync('.env')) {
      const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/n): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }

    console.log('📝 Please provide the following information:\n');

    // Server Configuration
    const port = await question('Server Port (3000): ') || '3000';
    const nodeEnv = await question('Node Environment (development): ') || 'development';

    // MongoDB Configuration
    console.log('\n🗄️  MongoDB Configuration:');
    const mongoUsername = await question('MongoDB Username: ') || 'username';
    const mongoPassword = await question('MongoDB Password: ') || 'password';
    const mongoCluster = await question('MongoDB Cluster URL (cluster0.mongodb.net): ') || 'cluster0.mongodb.net';

    // Redis Configuration
    console.log('\n🔴 Redis Configuration:');
    const redisMethod = await question('Use Redis URL (y) or separate config (n)? (y/n): ') || 'y';
    
    let redisConfig = '';
    if (redisMethod.toLowerCase() === 'y') {
      const redisUrl = await question('Redis URL (redis://username:password@host:port): ') || 'redis://username:password@host:port';
      redisConfig = `REDIS_URL=${redisUrl}`;
    } else {
      const redisHost = await question('Redis Host: ') || 'host';
      const redisPort = await question('Redis Port: ') || 'port';
      const redisPassword = await question('Redis Password: ') || 'password';
      redisConfig = `REDIS_HOST=${redisHost}\nREDIS_PORT=${redisPort}\nREDIS_PASSWORD=${redisPassword}`;
    }

    // Rate Limiting
    console.log('\n⚡ Rate Limiting:');
    const rateLimitMax = await question('Max requests per day (30): ') || '30';
    const rateLimitWindow = await question('Window in milliseconds (86400000): ') || '86400000';

    // URL Configuration
    console.log('\n🔗 URL Configuration:');
    const baseUrl = await question('Base URL (http://localhost:3000): ') || 'http://localhost:3000';
    const shortCodeLength = await question('Short code length (6): ') || '6';

    // Generate .env content
    const envContent = `# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}

# MongoDB Atlas (Single cluster for production)
MONGODB_URI_0=mongodb+srv://${mongoUsername}:${mongoPassword}@${mongoCluster}/?retryWrites=true&w=majority

# Redis Configuration
${redisConfig}

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=${rateLimitMax}
RATE_LIMIT_WINDOW_MS=${rateLimitWindow}

# URL Configuration
BASE_URL=${baseUrl}
SHORT_CODE_LENGTH=${shortCodeLength}
`;

    // Write .env file
    fs.writeFileSync('.env', envContent);

    console.log('\n✅ Setup completed successfully!');
    console.log('📁 .env file created with your configuration.');
    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm run dev');
    console.log('3. Visit: http://localhost:3000');
    console.log('\n📖 For deployment, see DEPLOYMENT.md');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setup(); 