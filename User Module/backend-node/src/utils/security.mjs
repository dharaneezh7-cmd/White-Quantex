/**
 * Security & Sanitization Utilities for White Quantex Node.js Service
 */

/**
 * Escapes special characters for use in regular expressions to prevent ReDoS and NoSQL injection.
 * @param {string} str - User provided input string
 * @param {number} maxLength - Maximum allowable length for search patterns
 * @returns {string} - Escaped regex-safe string
 */
export function escapeRegex(str, maxLength = 100) {
  if (typeof str !== "string") return ""
  const truncated = str.slice(0, maxLength).trim()
  return truncated.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

/**
 * Sanitizes user-generated HTML/text to prevent Cross-Site Scripting (XSS).
 * @param {string} str - Raw input
 * @returns {string} - Escaped safe string
 */
export function sanitizeHtml(str) {
  if (typeof str !== "string") return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

/**
 * Validates and bounds pagination parameters to protect against integer overflows or DoS.
 * @param {any} page - Page index
 * @param {any} limit - Items per page
 * @param {number} maxLimit - Upper bound for limit
 * @returns {{ safePage: number, safeLimit: number }}
 */
export function sanitizePagination(page, limit, maxLimit = 100) {
  const p = Math.max(0, parseInt(page, 10) || 0)
  const l = Math.min(maxLimit, Math.max(1, parseInt(limit, 10) || 20))
  return { safePage: p, safeLimit: l }
}
