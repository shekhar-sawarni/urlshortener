const { getRedisClient } = require('../config/redis');
const { getMongoConnection } = require('../config/mongodb');
const { 
  generateCompleteShortCode, 
  extractCodeParts, 
  isValidShortCode 
} = require('../utils/shortCodeGenerator');

class UrlService {
  constructor() {
    // Don't initialize Redis client in constructor
    this.redisClient = null;
  }

  /**
   * Get Redis client lazily
   */
  getRedisClient() {
    if (!this.redisClient) {
      this.redisClient = getRedisClient();
    }
    return this.redisClient;
  }

  /**
   * Create a shortened URL
   * @param {string} longUrl - The original URL to shorten
   * @param {number} daysToLive - Number of days the URL should be valid
   * @returns {object} Object containing shortCode and shortUrl
   */
  async createShortUrl(longUrl, daysToLive = 30) {
    try {
      // Validate input
      if (!longUrl || typeof longUrl !== 'string') {
        throw new Error('Long URL is required and must be a string');
      }

      if (!this.isValidUrl(longUrl)) {
        throw new Error('Invalid URL format');
      }

      if (daysToLive < 1 || daysToLive > 365) {
        throw new Error('Days to live must be between 1 and 365');
      }

      const redisClient = this.getRedisClient();

      // Generate short code and ensure uniqueness
      let shortCode;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        shortCode = generateCompleteShortCode();
        attempts++;

        // Check if code already exists in Redis
        const existingInRedis = await redisClient.get(`short:${shortCode}`);
        if (existingInRedis) {
          continue;
        }

        // Check if code exists in MongoDB
        const { postfix } = extractCodeParts(shortCode);
        const { model } = getMongoConnection(postfix);
        const existingInMongo = await model.findOne({ shortCode: shortCode.slice(0, -1) });
        
        if (!existingInMongo) {
          break;
        }
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique short code after maximum attempts');
      }

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + daysToLive);

      // Extract payload and postfix
      const { payload, postfix } = extractCodeParts(shortCode);

      // Store in MongoDB
      const { model } = getMongoConnection(postfix);
      await model.create({
        shortCode: payload,
        longUrl,
        expiresAt,
      });

      // Store in Redis with TTL
      const ttlSeconds = daysToLive * 24 * 60 * 60;
      await redisClient.setEx(`short:${shortCode}`, ttlSeconds, longUrl);

      // Generate short URL
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const shortUrl = `${baseUrl}/api/${shortCode}`;

      return {
        shortCode,
        shortUrl,
        longUrl,
        expiresAt,
        daysToLive,
      };
    } catch (error) {
      console.error('Error creating short URL:', error);
      throw error;
    }
  }

  /**
   * Get the original URL for a short code
   * @param {string} shortCode - The short code to resolve
   * @returns {string} The original long URL
   */
  async getLongUrl(shortCode) {
    try {
      // Validate short code format
      if (!isValidShortCode(shortCode)) {
        throw new Error('Invalid short code format');
      }

      const redisClient = this.getRedisClient();

      // Try to get from Redis first
      const cachedUrl = await redisClient.get(`short:${shortCode}`);
      if (cachedUrl) {
        return cachedUrl;
      }

      // If not in Redis, check MongoDB
      const { payload, postfix } = extractCodeParts(shortCode);
      const { model } = getMongoConnection(postfix);

      const urlDoc = await model.findOne({ shortCode: payload });
      if (!urlDoc) {
        throw new Error('Short URL not found');
      }

      // Check if URL has expired
      if (urlDoc.expiresAt < new Date()) {
        // Remove from database if expired
        await model.deleteOne({ _id: urlDoc._id });
        throw new Error('Short URL has expired');
      }

      // Cache in Redis with remaining TTL
      const remainingSeconds = Math.floor((urlDoc.expiresAt - new Date()) / 1000);
      if (remainingSeconds > 0) {
        await redisClient.setEx(`short:${shortCode}`, remainingSeconds, urlDoc.longUrl);
      }

      return urlDoc.longUrl;
    } catch (error) {
      console.error('Error getting long URL:', error);
      throw error;
    }
  }

  /**
   * Check if a URL is valid
   * @param {string} url - The URL to validate
   * @returns {boolean} True if valid, false otherwise
   */
  isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get URL statistics (for future enhancement)
   * @param {string} shortCode - The short code to get stats for
   * @returns {object} URL statistics
   */
  async getUrlStats(shortCode) {
    try {
      if (!isValidShortCode(shortCode)) {
        throw new Error('Invalid short code format');
      }

      const { payload, postfix } = extractCodeParts(shortCode);
      const { model } = getMongoConnection(postfix);

      const urlDoc = await model.findOne({ shortCode: payload });
      if (!urlDoc) {
        throw new Error('Short URL not found');
      }

      return {
        shortCode,
        longUrl: urlDoc.longUrl,
        createdAt: urlDoc.createdAt,
        expiresAt: urlDoc.expiresAt,
        isExpired: urlDoc.expiresAt < new Date(),
      };
    } catch (error) {
      console.error('Error getting URL stats:', error);
      throw error;
    }
  }

  /**
   * Clean up expired URLs (for housekeeping)
   * @returns {number} Number of expired URLs removed
   */
  async cleanupExpiredUrls() {
    try {
      let totalRemoved = 0;
      const { getAllMongoConnections } = require('../config/mongodb');
      const connections = getAllMongoConnections();

      for (const [postfix, { model }] of connections) {
        const result = await model.deleteMany({
          expiresAt: { $lt: new Date() }
        });
        totalRemoved += result.deletedCount;
      }

      console.log(`Cleaned up ${totalRemoved} expired URLs`);
      return totalRemoved;
    } catch (error) {
      console.error('Error cleaning up expired URLs:', error);
      throw error;
    }
  }
}

module.exports = new UrlService(); 