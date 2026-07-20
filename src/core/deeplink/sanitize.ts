const ALLOWED_URL_PATTERNS = [
  /^https:\/\/([a-z0-9-]+\.)*picsart\.com(\/|$)/i,
  /^https:\/\/([a-z0-9-]+\.)*pastatic\.com(\/|$)/i,
  /^https:\/\/([a-z0-9-]+\.)*cdn-picsart\.com(\/|$)/i,
];

/** Check if a URL is in the CDN allowlist (https only). */
export function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
  } catch {
    return false;
  }
  return ALLOWED_URL_PATTERNS.some(re => re.test(url));
}

/** Strip HTML/script tags from prompt text. */
export function sanitizePrompt(text: string): string {
  return text
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}
