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
 * Share result to social media
 * @param {Object} result - Roast result data
 * @returns {string} Share URL
 */
export function generateShareUrl(result) {
  const text = `I got a ${result.score}/100 on my portfolio! 🔥 Check yours at ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
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
