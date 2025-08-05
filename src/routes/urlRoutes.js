const express = require('express');
const { body, param } = require('express-validator');
const urlController = require('../controllers/urlController');

const router = express.Router();

// Validation middleware
const validateShortenRequest = [
  body('longUrl')
    .trim()
    .notEmpty()
    .withMessage('Long URL is required')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid HTTP or HTTPS URL')
    .isLength({ max: 2048 })
    .withMessage('URL is too long (max 2048 characters)'),
  body('daysToLive')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days to live must be between 1 and 365'),
];

const validateShortCode = [
  param('code')
    .trim()
    .isLength({ min: 7, max: 7 })
    .withMessage('Short code must be exactly 7 characters')
    .matches(/^[0-9a-zA-Z]{7}$/)
    .withMessage('Short code must contain only alphanumeric characters'),
];

// Routes
router.post('/shorten', validateShortenRequest, urlController.shortenUrl);
router.get('/:code', validateShortCode, urlController.redirectToUrl);
router.get('/stats/:code', validateShortCode, urlController.getUrlStats);
router.post('/cleanup', urlController.cleanupExpiredUrls);

module.exports = router; 