const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required');
    }

    // Create Redis client with retry strategy
    redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          console.log(`🔄 Redis reconnection attempt ${retries}`);
          if (retries > 10) {
            console.error('❌ Redis max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000); // Exponential backoff, max 3 seconds
        },
        connectTimeout: 10000, // 10 seconds
        commandTimeout: 5000,  // 5 seconds
      },
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });

    // Set up event handlers
    redisClient.on('connect', () => {
      console.log('🔗 Redis client connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis client ready');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err.message);
      // Don't throw error, let it try to reconnect
    });

    redisClient.on('end', () => {
      console.log('🔌 Redis client disconnected');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis client reconnecting...');
    });

    // Connect to Redis
    await redisClient.connect();
    
    console.log('✅ Redis connected successfully');
    return redisClient;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error.message);
    throw error;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('🔌 Redis disconnected');
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  disconnectRedis,
}; 