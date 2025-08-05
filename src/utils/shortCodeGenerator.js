const { customAlphabet } = require('nanoid');

// Base62 characters (0-9, a-z, A-Z)
const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Valid postfix characters (0-9, a-z, excluding some chars for simplicity)
const VALID_POSTFIXES = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');

// Create nanoid generator for 6-character codes
const generateShortCode = customAlphabet(BASE62_CHARS, 6);

/**
 * Generate a complete short code with postfix
 * @returns {string} 7-character short code (6 chars payload + 1 char postfix)
 */
const generateCompleteShortCode = () => {
  const payload = generateShortCode();
  const postfix = VALID_POSTFIXES[Math.floor(Math.random() * VALID_POSTFIXES.length)];
  return payload + postfix;
};

/**
 * Extract payload and postfix from a complete short code
 * @param {string} completeCode - The 7-character complete short code
 * @returns {object} Object containing payload and postfix
 */
const extractCodeParts = (completeCode) => {
  if (!completeCode || completeCode.length !== 7) {
    throw new Error('Invalid short code format. Expected 7 characters.');
  }

  const payload = completeCode.slice(0, -1);
  const postfix = completeCode.slice(-1);

  if (!VALID_POSTFIXES.includes(postfix)) {
    throw new Error(`Invalid postfix character: ${postfix}`);
  }

  return { payload, postfix };
};

/**
 * Validate if a complete short code is properly formatted
 * @param {string} completeCode - The short code to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidShortCode = (completeCode) => {
  try {
    if (!completeCode || completeCode.length !== 7) {
      return false;
    }

    const { postfix } = extractCodeParts(completeCode);
    return VALID_POSTFIXES.includes(postfix);
  } catch (error) {
    return false;
  }
};

/**
 * Get the MongoDB cluster postfix for a given short code
 * @param {string} completeCode - The complete short code
 * @returns {string} The postfix character
 */
const getPostfixForCode = (completeCode) => {
  const { postfix } = extractCodeParts(completeCode);
  return postfix;
};

/**
 * Generate a short code for a specific postfix
 * @param {string} postfix - The desired postfix character
 * @returns {string} 7-character short code with the specified postfix
 */
const generateShortCodeForPostfix = (postfix) => {
  if (!VALID_POSTFIXES.includes(postfix)) {
    throw new Error(`Invalid postfix: ${postfix}`);
  }

  const payload = generateShortCode();
  return payload + postfix;
};

module.exports = {
  generateCompleteShortCode,
  extractCodeParts,
  isValidShortCode,
  getPostfixForCode,
  generateShortCodeForPostfix,
  VALID_POSTFIXES,
  BASE62_CHARS,
}; 