/**
 * URL Helper Utility
 *
 * Automatically handles CORS proxy wrapping for external URLs.
 * In dev mode: wraps URLs with https://corsproxy.io/?
 * In production: returns original URL unchanged
 */

const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Check if a URL should be wrapped with CORS proxy
 * Excludes Google Fonts and other URLs that don't need proxying
 */
export function shouldWrapUrl(url) {
  if (!url || typeof url !== 'string') return false;

  // Don't wrap Google Fonts
  if (url.includes('fonts.googleapis.com')) return false;

  // Don't wrap if already wrapped
  if (url.startsWith(CORS_PROXY)) return false;

  // Only wrap external HTTP(S) URLs
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;

  return true;
}

/**
 * Wrap URL with CORS proxy in dev mode only
 * @param {string} url - The URL to wrap
 * @returns {string} - Wrapped URL in dev mode, original URL in production
 */
export function wrapWithCorsProxy(url) {
  if (!url) return url;

  // Check if we're in development mode
  const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

  if (isDev && shouldWrapUrl(url)) {
    return `${CORS_PROXY}${url}`;
  }

  return url;
}

/**
 * Wrap URL for use in CSS url() function
 * @param {string} url - The URL to wrap
 * @returns {string} - CSS url() with proper wrapping
 */
export function wrapCssUrl(url) {
  if (!url) return '';
  const wrappedUrl = wrapWithCorsProxy(url);
  return `url('${wrappedUrl}')`;
}
