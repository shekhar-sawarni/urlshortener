const mongoose = require('mongoose');

// MongoDB connection cache
const mongoConnections = new Map();

// Base62 characters for postfix mapping (0-9, a-z, excluding some chars)
const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
const VALID_POSTFIXES = BASE62_CHARS.split('');

const connectMongoDB = async () => {
  try {
    console.log('Connecting to MongoDB clusters...');
    
    let connectedClusters = 0;
    let firstConnection = null;
    
    // Connect to each MongoDB cluster based on postfix
    for (const postfix of VALID_POSTFIXES) {
      const uriKey = `MONGODB_URI_${postfix}`;
      const uri = process.env[uriKey];
      
      if (!uri) {
        console.warn(`Warning: ${uriKey} not found in environment variables`);
        continue;
      }

      try {
        const connection = await mongoose.createConnection(uri, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          heartbeatFrequencyMS: 10000,
          retryWrites: true,
          retryReads: true,
        });

        // Set up connection event handlers
        connection.on('connected', () => {
          console.log(`✅ MongoDB cluster ${postfix} connected`);
        });

        connection.on('error', (err) => {
          console.error(`❌ MongoDB cluster ${postfix} error:`, err.message);
          // Don't remove from cache, let it try to reconnect
        });

        connection.on('disconnected', () => {
          console.log(`🔌 MongoDB cluster ${postfix} disconnected`);
        });

        connection.on('reconnected', () => {
          console.log(`🔄 MongoDB cluster ${postfix} reconnected`);
        });

        // Create URL schema and model for this cluster
        const urlSchema = new mongoose.Schema({
          shortCode: {
            type: String,
            required: true,
            unique: true,
            index: true,
          },
          longUrl: {
            type: String,
            required: true,
          },
          expiresAt: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 0 }, // TTL index
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        });

        // Create indexes
        urlSchema.index({ shortCode: 1 });
        urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

        const UrlModel = connection.model('Url', urlSchema);
        
        mongoConnections.set(postfix, {
          connection,
          model: UrlModel,
        });

        // Store first connection for fallback
        if (!firstConnection) {
          firstConnection = { connection, model: UrlModel };
        }

        connectedClusters++;
      } catch (error) {
        console.error(`Failed to connect to MongoDB cluster ${postfix}:`, error.message);
        // Continue with other clusters instead of throwing
        continue;
      }
    }

    // If only one cluster is available, use it for all postfixes
    if (connectedClusters === 1 && firstConnection) {
      console.log('⚠️  Only one MongoDB cluster available. Using it for all postfixes.');
      for (const postfix of VALID_POSTFIXES) {
        if (!mongoConnections.has(postfix)) {
          mongoConnections.set(postfix, firstConnection);
        }
      }
    }

    if (connectedClusters === 0) {
      throw new Error('No MongoDB clusters could be connected. Please check your environment variables.');
    }

    console.log(`✅ Connected to ${connectedClusters} MongoDB cluster(s)`);
    return mongoConnections;
  } catch (error) {
    console.error('Failed to connect to MongoDB clusters:', error);
    throw error;
  }
};

const getMongoConnection = (postfix) => {
  if (!mongoConnections.has(postfix)) {
    // If the specific postfix cluster is not available, use the first available one
    const firstAvailable = Array.from(mongoConnections.values())[0];
    if (firstAvailable) {
      console.log(`⚠️  Using fallback cluster for postfix: ${postfix}`);
      return firstAvailable;
    }
    throw new Error(`No MongoDB connection found for postfix: ${postfix}`);
  }
  return mongoConnections.get(postfix);
};

const getAllMongoConnections = () => {
  return mongoConnections;
};

const disconnectMongoDB = async () => {
  const disconnectPromises = Array.from(mongoConnections.values()).map(
    ({ connection }) => connection.close()
  );
  
  await Promise.all(disconnectPromises);
  mongoConnections.clear();
  console.log('All MongoDB connections closed');
};

module.exports = {
  connectMongoDB,
  getMongoConnection,
  getAllMongoConnections,
  disconnectMongoDB,
  VALID_POSTFIXES,
}; 