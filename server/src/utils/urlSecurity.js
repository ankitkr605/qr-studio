const BLOCKED_SCHEMES = ['javascript:', 'data:', 'vbscript:', 'file:', 'blob:'];
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];

const SAFE_ACTION_PREFIXES = ['mailto:', 'tel:', 'smsto:', 'sms:', 'upi://pay?', 'WIFI:', 'BEGIN:VCARD', 'BEGIN:VEVENT'];

/**
 * Validates HTTP(S) redirect destination URLs to prevent open-redirect abuse,
 * credential-stuffed phishing URLs, XSS schemes, and internal SSRF targets.
 */
export function validateSafeHttpUrl(rawUrl, { allowLocal = false } = {}) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, reason: 'Destination URL is required.' };
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length > 2048) {
    return { valid: false, reason: 'Destination URL exceeds 2048 characters.' };
  }

  const lower = trimmed.toLowerCase();
  if (BLOCKED_SCHEMES.some((scheme) => lower.startsWith(scheme))) {
    return { valid: false, reason: 'Disallowed URI scheme.' };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, reason: 'Invalid URL format.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: 'Only http:// and https:// URLs are permitted for redirects.' };
  }

  if (parsed.username || parsed.password) {
    return { valid: false, reason: 'URLs containing embedded credentials are not allowed.' };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || hostname.includes('..')) {
    return { valid: false, reason: 'Invalid destination hostname.' };
  }

  if (!allowLocal && PRIVATE_HOST_PATTERNS.some((re) => re.test(hostname))) {
    return { valid: false, reason: 'Private or loopback hostnames are not permitted.' };
  }

  return { valid: true, url: parsed.toString() };
}

/**
 * Validates dynamic QR destination based on qrType.
 * HTTP-based QR types must pass strict HTTP(S) URL validation.
 * Non-HTTP QR types (wifi, vcard, text, upi, email, phone, sms, event) must match safe non-script payloads.
 */
export function validateQrDestination(qrType, destinationUrl, { allowLocal = false } = {}) {
  const httpTypes = new Set(['url', 'whatsapp', 'location', 'social', 'pdf']);
  const trimmed = String(destinationUrl || '').trim();

  if (!trimmed) {
    return { valid: false, reason: 'Destination content cannot be empty.' };
  }

  if (httpTypes.has(qrType)) {
    return validateSafeHttpUrl(trimmed, { allowLocal });
  }

  const lower = trimmed.toLowerCase();
  if (BLOCKED_SCHEMES.some((s) => lower.startsWith(s))) {
    return { valid: false, reason: 'Unsafe scheme detected in QR payload.' };
  }

  // If user saved a plain HTTP URL even under another type, validate it strictly
  if (/^https?:\/\//i.test(trimmed)) {
    return validateSafeHttpUrl(trimmed, { allowLocal });
  }

  if (qrType === 'text') {
    if (trimmed.length > 2000) return { valid: false, reason: 'Text exceeds 2000 characters.' };
    return { valid: true, url: trimmed };
  }

  if (SAFE_ACTION_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
    return { valid: true, url: trimmed };
  }

  return { valid: true, url: trimmed };
}

export function isHttpDestination(value = '') {
  return /^https?:\/\//i.test(String(value).trim());
}
