/**
 * Privacy-respecting telemetry extractor.
 * Derives coarse categories from headers without storing IP addresses or raw User-Agent strings.
 */
export function parseScanMetadata(req) {
  const ua = String(req.headers['user-agent'] || '');

  // Device category
  let deviceCategory = 'Desktop';
  if (/bot|crawl|spider|slurp|curl|wget|headless/i.test(ua)) {
    deviceCategory = 'Bot';
  } else if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
    deviceCategory = 'Tablet';
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile/i.test(ua)) {
    deviceCategory = 'Mobile';
  } else if (!ua) {
    deviceCategory = 'Other';
  }

  // OS category
  let osCategory = 'Other';
  if (/iphone|ipad|ipod/i.test(ua)) osCategory = 'iOS';
  else if (/android/i.test(ua)) osCategory = 'Android';
  else if (/windows/i.test(ua)) osCategory = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) osCategory = 'macOS';
  else if (/linux/i.test(ua)) osCategory = 'Linux';

  // Browser category
  let browserCategory = 'Other';
  if (/edg\//i.test(ua)) browserCategory = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browserCategory = 'Opera';
  else if (/chrome|crios/i.test(ua)) browserCategory = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browserCategory = 'Firefox';
  else if (/safari/i.test(ua)) browserCategory = 'Safari';

  // Approximate country/region from standard CDN/proxy headers (never stores IP)
  const rawCountry =
    req.headers['cf-ipcountry'] ||
    req.headers['x-vercel-ip-country'] ||
    req.headers['x-country-code'] ||
    '';

  let country = 'Unknown';
  if (typeof rawCountry === 'string' && /^[A-Za-z]{2}$/.test(rawCountry.trim())) {
    country = rawCountry.trim().toUpperCase();
  } else {
    const acceptLang = String(req.headers['accept-language'] || '');
    const regionMatch = acceptLang.match(/[a-z]{2}-([A-Z]{2})/);
    if (regionMatch) {
      country = regionMatch[1];
    }
  }

  return {
    deviceCategory,
    browserCategory,
    osCategory,
    country,
  };
}
