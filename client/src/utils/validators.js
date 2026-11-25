export function isValidHttpUrl(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function normalizeUrl(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
}

export function isValidPhone(value) {
  const cleaned = (value || '').replace(/[\s\-()]/g, '');
  return /^\+?[0-9]{7,16}$/.test(cleaned);
}

export function isValidUpiId(value) {
  return /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test((value || '').trim());
}

export function hexToRgb(hex) {
  const clean = (hex || '#000000').replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function getRelativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * WCAG contrast ratio between foreground and background colors (1..21).
 * QR scanners reliably need >= 3.0 (ideally >= 4.5) and dark foreground on light background.
 */
export function getContrastRatio(fgHex, bgHex) {
  const l1 = getRelativeLuminance(fgHex);
  const l2 = getRelativeLuminance(bgHex);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function checkQrScannability({ fgColor, bgColor, hasLogo, logoSizePct, ecc }) {
  const contrast = getContrastRatio(fgColor, bgColor);
  const fgLum = getRelativeLuminance(fgColor);
  const bgLum = getRelativeLuminance(bgColor);
  const warnings = [];

  if (contrast < 3.0) {
    warnings.push('Low contrast between foreground and background colors may prevent scanning.');
  }
  if (fgLum > bgLum) {
    warnings.push('Inverted colors (light modules on dark background) are unsupported by some older scanners.');
  }
  if (hasLogo && logoSizePct > 28) {
    warnings.push('Logo size above 28% can cover critical QR data modules.');
  }
  if (hasLogo && (ecc === 'L' || ecc === 'M')) {
    warnings.push('Higher error correction (Q or H) is recommended when embedding a center logo.');
  }

  return {
    contrast: Number(contrast.toFixed(2)),
    isHealthy: contrast >= 3.0 && (!hasLogo || logoSizePct <= 30),
    warnings,
  };
}
