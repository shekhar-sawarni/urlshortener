const request = require('supertest');
const express = require('express');
const urlRoutes = require('../src/routes/urlRoutes');

// Mock the dependencies for testing
jest.mock('../src/config/redis', () => ({
  getRedisClient: jest.fn(() => ({
    get: jest.fn(),
    setEx: jest.fn(),
    multi: jest.fn(() => ({
      incr: jest.fn(),
      expire: jest.fn(),
      exec: jest.fn(),
    })),
  })),
}));

jest.mock('../src/config/mongodb', () => ({
  getMongoConnection: jest.fn(() => ({
    model: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
  })),
}));

jest.mock('../src/services/urlService', () => ({
  createShortUrl: jest.fn(),
  getLongUrl: jest.fn(),
  getUrlStats: jest.fn(),
  cleanupExpiredUrls: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api', urlRoutes);

describe('URL Shortener API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/shorten', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate URL format', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({
          longUrl: 'invalid-url',
          daysToLive: 30,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate daysToLive range', async () => {
      const response = await request(app)
        .post('/api/shorten')
        .send({
          longUrl: 'https://example.com',
          daysToLive: 400,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/:code', () => {
    it('should validate short code format', async () => {
      const response = await request(app)
        .get('/api/invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid short code format');
    });

    it('should accept valid 7-character codes', async () => {
      const response = await request(app)
        .get('/api/abc123x');

      expect(response.status).toBe(500); // Will fail due to mocked service
    });
  });

  describe('GET /api/stats/:code', () => {
    it('should validate short code format', async () => {
      const response = await request(app)
        .get('/api/stats/invalid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid short code format');
    });
  });
});

// Test utility functions
describe('Utility Functions', () => {
  const { 
    generateCompleteShortCode, 
    extractCodeParts, 
    isValidShortCode 
  } = require('../src/utils/shortCodeGenerator');

  it('should generate 7-character codes', () => {
    const code = generateCompleteShortCode();
    expect(code).toHaveLength(7);
    expect(/^[0-9a-zA-Z]{7}$/.test(code)).toBe(true);
  });

  it('should extract payload and postfix correctly', () => {
    const code = 'abc123x';
    const { payload, postfix } = extractCodeParts(code);
    expect(payload).toBe('abc123');
    expect(postfix).toBe('x');
  });

  it('should validate short codes', () => {
    expect(isValidShortCode('abc123x')).toBe(true);
    expect(isValidShortCode('abc123')).toBe(false); // too short
    expect(isValidShortCode('abc123xy')).toBe(false); // too long
    expect(isValidShortCode('abc123!')).toBe(false); // invalid character
  });
}); 