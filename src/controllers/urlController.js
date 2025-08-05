const { body, param, validationResult } = require('express-validator');
const urlService = require('../services/urlService');
const { getRedisClient } = require('../config/redis');

class UrlController {
  /**
   * Create a shortened URL
   * POST /api/shorten
   */
  async shortenUrl(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { longUrl, daysToLive = 30 } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress;

      // Check rate limiting
      const rateLimitKey = `rate_limit:${clientIp}`;
      const redisClient = getRedisClient();
      
      const currentRequests = await redisClient.get(rateLimitKey);
      const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 30;
      
      if (currentRequests && parseInt(currentRequests) >= maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Maximum 30 shorten requests per day.',
        });
      }

      // Increment rate limit counter
      const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 86400000; // 24 hours
      await redisClient.multi()
        .incr(rateLimitKey)
        .expire(rateLimitKey, Math.floor(windowMs / 1000))
        .exec();

      // Create short URL
      const result = await urlService.createShortUrl(longUrl, daysToLive);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error in shortenUrl controller:', error);
      
      if (error.message.includes('Invalid URL')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format. Please provide a valid HTTP or HTTPS URL.',
        });
      }

      if (error.message.includes('Days to live')) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * Redirect to the original URL
   * GET /api/:code
   */
  async redirectToUrl(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid short code format',
        });
      }

      const { code } = req.params;

      // Get the original URL
      const longUrl = await urlService.getLongUrl(code);

      // Redirect to the original URL
      res.redirect(301, longUrl);
    } catch (error) {
      console.error('Error in redirectToUrl controller:', error);
      
      if (error.message.includes('Invalid short code') || 
          error.message.includes('Short URL not found') ||
          error.message.includes('expired')) {
        return res.status(404).json({
          success: false,
          error: 'Short URL not found or has expired',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * Get URL statistics
   * GET /api/stats/:code
   */
  async getUrlStats(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid short code format',
        });
      }

      const { code } = req.params;
      const stats = await urlService.getUrlStats(code);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error in getUrlStats controller:', error);
      
      if (error.message.includes('Short URL not found')) {
        return res.status(404).json({
          success: false,
          error: 'Short URL not found',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * Clean up expired URLs (admin endpoint)
   * POST /api/cleanup
   */
  async cleanupExpiredUrls(req, res) {
    try {
      const removedCount = await urlService.cleanupExpiredUrls();

      res.json({
        success: true,
        message: `Cleaned up ${removedCount} expired URLs`,
        removedCount,
      });
    } catch (error) {
      console.error('Error in cleanupExpiredUrls controller:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}

module.exports = new UrlController(); 