import { isValidEmail, isValidHttpUrl, isValidPhone, isValidUpiId, normalizeUrl } from './validators.js';

export const QR_TYPES = [
  { id: 'url', label: 'Website URL', shortDesc: 'Link to any web page', supportsDirectRedirect: true },
  { id: 'text', label: 'Plain Text', shortDesc: 'Display any text message', supportsDirectRedirect: false },
  { id: 'wifi', label: 'Wi-Fi', shortDesc: 'Instant Wi-Fi login', supportsDirectRedirect: false },
  { id: 'email', label: 'Email', shortDesc: 'Pre-filled email message', supportsDirectRedirect: false },
  { id: 'phone', label: 'Phone', shortDesc: 'One-tap phone call', supportsDirectRedirect: false },
  { id: 'sms', label: 'SMS', shortDesc: 'Pre-filled text message', supportsDirectRedirect: false },
  { id: 'whatsapp', label: 'WhatsApp', shortDesc: 'Open WhatsApp chat', supportsDirectRedirect: true },
  { id: 'vcard', label: 'Contact / vCard', shortDesc: 'Digital business card', supportsDirectRedirect: false },
  { id: 'location', label: 'Google Maps', shortDesc: 'Share GPS or address', supportsDirectRedirect: true },
  { id: 'upi', label: 'UPI Payment', shortDesc: 'Instant India UPI pay', supportsDirectRedirect: false },
  { id: 'social', label: 'Social Media', shortDesc: 'Profile & creator links', supportsDirectRedirect: true },
  { id: 'pdf', label: 'PDF / Document', shortDesc: 'Share hosted docs & menus', supportsDirectRedirect: true },
  { id: 'event', label: 'Event', shortDesc: 'Calendar event invite', supportsDirectRedirect: false },
];

export const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', baseUrl: 'https://instagram.com/' },
  { id: 'twitter', label: 'X / Twitter', baseUrl: 'https://x.com/' },
  { id: 'linkedin', label: 'LinkedIn', baseUrl: 'https://linkedin.com/in/' },
  { id: 'youtube', label: 'YouTube', baseUrl: 'https://youtube.com/@' },
  { id: 'github', label: 'GitHub', baseUrl: 'https://github.com/' },
  { id: 'tiktok', label: 'TikTok', baseUrl: 'https://tiktok.com/@' },
  { id: 'facebook', label: 'Facebook', baseUrl: 'https://facebook.com/' },
  { id: 'custom', label: 'Custom Social URL', baseUrl: '' },
];

export const DEFAULT_FORM_DATA = {
  url: { url: 'https://qrstudio.app' },
  text: { text: 'Welcome to QR Studio — smart, customizable QR codes.' },
  wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
  email: { to: '', subject: '', body: '' },
  phone: { number: '' },
  sms: { number: '', message: '' },
  whatsapp: { number: '', message: '' },
  vcard: {
    firstName: '',
    lastName: '',
    organization: '',
    title: '',
    phone: '',
    email: '',
    website: '',
    address: '',
  },
  location: { mode: 'coords', latitude: '', longitude: '', query: '' },
  upi: { vpa: '', name: '', amount: '', note: '' },
  social: { platform: 'instagram', handle: '', customUrl: '' },
  pdf: { url: '', documentTitle: '' },
  event: { title: '', location: '', startDate: '', endDate: '', description: '' },
};

function escapeWifi(str = '') {
  return String(str).replace(/([\\;,:"])/g, '\\$1');
}

function formatIcsDate(datetimeLocal) {
  if (!datetimeLocal) return '';
  const d = new Date(datetimeLocal);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Validates form inputs for the active QR type and constructs:
 * - `content`: encoded string for static QR
 * - `destinationUrl`: redirectable URL (or action payload) for dynamic QR
 * - `errors`: field-level validation errors
 */
export function buildQrPayload(type, data = {}) {
  const errors = {};

  switch (type) {
    case 'url': {
      const normalized = normalizeUrl(data.url);
      if (!data.url?.trim()) {
        errors.url = 'Website URL is required.';
      } else if (!isValidHttpUrl(normalized)) {
        errors.url = 'Enter a valid URL (e.g. https://example.com).';
      }
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        content: normalized,
        destinationUrl: normalized,
      };
    }

    case 'text': {
      const text = (data.text || '').trim();
      if (!text) errors.text = 'Plain text content cannot be empty.';
      else if (text.length > 2000) errors.text = 'Text must be 2,000 characters or fewer.';
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        content: text,
        destinationUrl: '',
      };
    }

    case 'wifi': {
      const ssid = (data.ssid || '').trim();
      const encryption = data.encryption || 'WPA';
      const password = data.password || '';
      if (!ssid) errors.ssid = 'Network name (SSID) is required.';
      if (encryption !== 'nopass' && !password) {
        errors.password = 'Password is required for secured networks.';
      }
      const hiddenFlag = data.hidden ? 'true' : 'false';
      const content = `WIFI:T:${encryption};S:${escapeWifi(ssid)};P:${
        encryption === 'nopass' ? '' : escapeWifi(password)
      };H:${hiddenFlag};;`;
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        content,
        destinationUrl: '',
      };
    }

    case 'email': {
      const to = (data.to || '').trim();
      if (!to) errors.to = 'Recipient email is required.';
      else if (!isValidEmail(to)) errors.to = 'Enter a valid email address.';
      const params = new URLSearchParams();
      if (data.subject?.trim()) params.set('subject', data.subject.trim());
      if (data.body?.trim()) params.set('body', data.body.trim());
      const query = params.toString();
      const content = `mailto:${to}${query ? `?${query}` : ''}`;
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        content,
        destinationUrl: '',
      };
    }

    case 'phone': {
      const number = (data.number || '').trim();
      if (!number) errors.number = 'Phone number is required.';
      else if (!isValidPhone(number)) errors.number = 'Enter a valid phone number (with country code).';
      const cleaned = number.replace(/[\s\-()]/g, '');
      const content = `tel:${cleaned}`;
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        content,
        destinationUrl: '',
      };
    }

    case 'sms': {
      const number = (data.number || '').trim();
      if (!number) errors.number = 'Recipient phone number is required.';
      else if (!isValidPhone(number)) errors.number = 'Enter a valid phone number.';
      const cleaned = number.replace(/[\s\-()]/g, '');
      const msg = (data.message || '').trim();
      const content = `smsto:${cleaned}:${msg}`;
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        content,
        destinationUrl: '',
      };
    }

    case 'whatsapp': {
      const number = (data.number || '').trim();
      const digits = number.replace(/[^0-9]/g, '');
      if (!number) errors.number = 'WhatsApp number is required.';
      else if (digits.length < 7 || digits.length > 15) {
        errors.number = 'Include country code and 7–15 digits (e.g. +15551234567).';
      }
      const msg = (data.message || '').trim();
      const url = `https://wa.me/${digits}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        content: url,
        destinationUrl: url,
      };
    }

    case 'vcard': {
      const firstName = (data.firstName || '').trim();
      const lastName = (data.lastName || '').trim();
      if (!firstName && !lastName) errors.firstName = 'Enter at least a first or last name.';
      if (data.email?.trim() && !isValidEmail(data.email)) errors.email = 'Invalid email address.';
      if (data.website?.trim() && !isValidHttpUrl(normalizeUrl(data.website))) {
        errors.website = 'Invalid website URL.';
      }
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName};${firstName};;;`,
        `FN:${[firstName, lastName].filter(Boolean).join(' ')}`,
      ];
      if (data.organization?.trim()) lines.push(`ORG:${data.organization.trim()}`);
      if (data.title?.trim()) lines.push(`TITLE:${data.title.trim()}`);
      if (data.phone?.trim()) lines.push(`TEL;TYPE=CELL:${data.phone.trim()}`);
      if (data.email?.trim()) lines.push(`EMAIL:${data.email.trim()}`);
      if (data.website?.trim()) lines.push(`URL:${normalizeUrl(data.website)}`);
      if (data.address?.trim()) lines.push(`ADR;TYPE=WORK:;;${data.address.trim()};;;;`);
      lines.push('END:VCARD');
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        content: lines.join('\n'),
        destinationUrl: '',
      };
    }

    case 'location': {
      const mode = data.mode || 'coords';
      let url = '';
      if (mode === 'coords') {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        if (Number.isNaN(lat) || lat < -90 || lat > 90) {
          errors.latitude = 'Latitude must be between -90 and 90.';
        }
        if (Number.isNaN(lng) || lng < -180 || lng > 180) {
          errors.longitude = 'Longitude must be between -180 and 180.';
        }
        url = `https://www.google.com/maps?q=${lat},${lng}`;
      } else {
        const q = (data.query || '').trim();
        if (!q) errors.query = 'Place name or address is required.';
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
      }
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        content: url,
        destinationUrl: url,
      };
    }

    case 'upi': {
      const vpa = (data.vpa || '').trim();
      const name = (data.name || '').trim();
      if (!vpa) errors.vpa = 'UPI ID (VPA) is required.';
      else if (!isValidUpiId(vpa)) errors.vpa = 'Enter a valid UPI ID (e.g. merchant@okaxis).';
      if (!name) errors.name = 'Payee name is required.';
      if (data.amount && (Number.isNaN(Number(data.amount)) || Number(data.amount) <= 0)) {
        errors.amount = 'Amount must be greater than 0.';
      }
      const params = new URLSearchParams({ pa: vpa, pn: name, cu: 'INR' });
      if (data.amount) params.set('am', Number(data.amount).toFixed(2));
      if (data.note?.trim()) params.set('tn', data.note.trim());
      const content = `upi://pay?${params.toString()}`;
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        content,
        destinationUrl: '',
      };
    }

    case 'social': {
      const platform = SOCIAL_PLATFORMS.find((p) => p.id === (data.platform || 'instagram')) || SOCIAL_PLATFORMS[0];
      let url = '';
      if (platform.id === 'custom') {
        url = normalizeUrl(data.customUrl);
        if (!data.customUrl?.trim()) errors.customUrl = 'Profile URL is required.';
        else if (!isValidHttpUrl(url)) errors.customUrl = 'Enter a valid social profile URL.';
      } else {
        const handle = (data.handle || '').trim().replace(/^@/, '');
        if (!handle) errors.handle = 'Username or handle is required.';
        url = /^https?:\/\//i.test(handle) ? handle : `${platform.baseUrl}${encodeURIComponent(handle)}`;
      }
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        content: url,
        destinationUrl: url,
      };
    }

    case 'pdf': {
      const normalized = normalizeUrl(data.url);
      if (!data.url?.trim()) errors.url = 'Document or PDF URL is required.';
      else if (!isValidHttpUrl(normalized)) errors.url = 'Enter a valid HTTPS/HTTP document URL.';
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        content: normalized,
        destinationUrl: normalized,
      };
    }

    case 'event': {
      const title = (data.title || '').trim();
      if (!title) errors.title = 'Event title is required.';
      const start = formatIcsDate(data.startDate);
      const end = formatIcsDate(data.endDate);
      if (!start) errors.startDate = 'Start date and time are required.';
      if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
        errors.endDate = 'End time must be after start time.';
      }
      const lines = ['BEGIN:VEVENT', `SUMMARY:${title}`];
      if (start) lines.push(`DTSTART:${start}`);
      if (end) lines.push(`DTEND:${end}`);
      if (data.location?.trim()) lines.push(`LOCATION:${data.location.trim()}`);
      if (data.description?.trim()) lines.push(`DESCRIPTION:${data.description.trim()}`);
      lines.push('END:VEVENT');
      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        content: lines.join('\n'),
        destinationUrl: '',
      };
    }

    default:
      return { isValid: false, errors: { general: 'Unsupported QR type.' }, content: '', destinationUrl: '' };
  }
}
