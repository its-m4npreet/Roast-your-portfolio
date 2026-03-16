/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize user URL input (e.g. adds https:// when protocol is missing)
 * @param {string} input - Raw URL input
 * @returns {string} Normalized URL-like string
 */
export function normalizeUrlInput(input) {
  const value = String(input || '').trim();
  if (!value) return '';

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // If user pastes domain without protocol, default to https
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) {
    return `https://${value}`;
  }

  return value;
}

/**
 * Validate portfolio URL with clear error reasons
 * @param {string} input - URL input
 * @returns {{isValid: boolean, normalizedUrl: string, reason: string, code: string}}
 */
export function validatePortfolioUrl(input) {
  const normalizedUrl = normalizeUrlInput(input);

  if (!normalizedUrl) {
    return {
      isValid: false,
      normalizedUrl: '',
      reason: 'Please enter a URL',
      code: 'EMPTY_URL',
    };
  }

  let parsed;
  try {
    parsed = new URL(normalizedUrl);
  } catch {
    return {
      isValid: false,
      normalizedUrl,
      reason: 'Invalid URL format. Example: https://yourportfolio.com',
      code: 'INVALID_FORMAT',
    };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return {
      isValid: false,
      normalizedUrl,
      reason: 'Only http and https URLs are supported',
      code: 'INVALID_PROTOCOL',
    };
  }

  if (!parsed.hostname || !parsed.hostname.includes('.')) {
    return {
      isValid: false,
      normalizedUrl,
      reason: 'Please enter a complete public domain (e.g. https://yourportfolio.com)',
      code: 'INVALID_HOST',
    };
  }

  // Prevent local/private targets
  const host = parsed.hostname.toLowerCase();
  const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  const isPrivateIPv4 =
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);

  if (isLocalhost || isPrivateIPv4) {
    return {
      isValid: false,
      normalizedUrl,
      reason: 'Local/private URLs are not allowed. Use a public portfolio URL.',
      code: 'PRIVATE_HOST',
    };
  }

  return {
    isValid: true,
    normalizedUrl: parsed.toString(),
    reason: '',
    code: 'OK',
  };
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get score color based on value
 * @param {number} score - Score value (0-100)
 * @returns {string} Tailwind color class
 */
export function getScoreColor(score) {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-blue-500';
  if (score >= 40) return 'text-yellow-500';
  if (score >= 20) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Get score emoji based on value
 * @param {number} score - Score value (0-100)
 * @returns {string} Emoji
 */
export function getScoreEmoji(score) {
  if (score >= 90) return '🔥';
  if (score >= 80) return '🌟';
  if (score >= 70) return '😊';
  if (score >= 60) return '👍';
  if (score >= 50) return '😐';
  if (score >= 40) return '😬';
  if (score >= 30) return '😕';
  if (score >= 20) return '😰';
  return '💀';
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

/**
 * Build shareable result URL
 * @returns {string} Shareable result URL
 */
export function getShareableResultUrl() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return cleanBase;
}

/**
 * Share result to social media
 * @param {Object} result - Roast result data
 * @returns {Object} Share links by platform
 */
export function generateShareLinks(result) {
  const link = getShareableResultUrl();
  const modeMap = {
    roast: 'Roast Mode 😄',
    recruiter: 'Recruiter Mode 💼',
    brutal: 'Brutal Mode 💀',
  };

  const modeLabel = modeMap[result?.mode] || 'Roast Mode 😄';
  const score = Number(result?.score) || 0;
  const text = `🔥 Roastfolio Score: ${score}/100

My portfolio just got roasted in ${modeLabel} mode.

Think yours can survive? 👀

Try it here:
${link}`;

  return {
    link,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(link)}&title=${encodeURIComponent(`I got ${score}/100 on Roastfolio (${modeLabel})`)}`,
  };
}

/**
 * Backward-compatible single share URL (X)
 * @param {Object} result - Roast result data
 * @returns {string} Share URL for X
 */
export function generateShareUrl(result) {
  return generateShareLinks(result).x;
}

/**
 * Get mode display name
 * @param {string} mode - Mode identifier
 * @returns {string} Display name
 */
export function getModeDisplayName(mode) {
  const names = {
    roast: 'Roast Mode',
    recruiter: 'Recruiter Mode',
    brutal: 'Brutal Mode',
  };
  return names[mode] || 'Roast Mode';
}

/**
 * Get mode description
 * @param {string} mode - Mode identifier
 * @returns {string} Description
 */
export function getModeDescription(mode) {
  const descriptions = {
    roast: '😄 Funny and entertaining feedback',
    recruiter: '💼 Professional evaluation from a recruiter perspective',
    brutal: '💀 Brutally honest, savage roasting',
  };
  return descriptions[mode] || descriptions.roast;
}
