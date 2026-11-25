import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSafeHttpUrl, validateQrDestination } from '../src/utils/urlSecurity.js';

test('validateSafeHttpUrl accepts valid https and http URLs', () => {
  const res = validateSafeHttpUrl('https://qrstudio.app/pricing?ref=qr');
  assert.equal(res.valid, true);
  assert.equal(res.url, 'https://qrstudio.app/pricing?ref=qr');
});

test('validateSafeHttpUrl rejects javascript:, data:, and vbscript: schemes', () => {
  assert.equal(validateSafeHttpUrl('javascript:alert(1)').valid, false);
  assert.equal(validateSafeHttpUrl('data:text/html,<script>alert(1)</script>').valid, false);
  assert.equal(validateSafeHttpUrl('vbscript:msgbox(1)').valid, false);
});

test('validateSafeHttpUrl rejects embedded credentials in URLs', () => {
  const res = validateSafeHttpUrl('https://admin:secret@evil.example.com');
  assert.equal(res.valid, false);
});

test('validateSafeHttpUrl blocks private/loopback IPs when allowLocal=false', () => {
  assert.equal(validateSafeHttpUrl('http://127.0.0.1:8080/admin', { allowLocal: false }).valid, false);
  assert.equal(validateSafeHttpUrl('http://192.168.1.10/login', { allowLocal: false }).valid, false);
  assert.equal(validateSafeHttpUrl('http://localhost:3000', { allowLocal: false }).valid, false);
});

test('validateQrDestination validates HTTP types strictly and allows safe Wi-Fi payloads', () => {
  assert.equal(validateQrDestination('url', 'javascript:alert(1)').valid, false);
  assert.equal(validateQrDestination('wifi', 'WIFI:T:WPA;S:Guest;P:pass123;H:false;;').valid, true);
  assert.equal(validateQrDestination('text', 'Hello QR Studio!').valid, true);
});
