import test from 'node:test';
import assert from 'node:assert/strict';
import { parseScanMetadata } from '../src/utils/userAgent.js';
import { generateCodeId } from '../src/utils/idGenerator.js';

test('parseScanMetadata extracts mobile iOS Safari metadata without IP', () => {
  const req = {
    headers: {
      'user-agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      'cf-ipcountry': 'US',
    },
  };
  const meta = parseScanMetadata(req);
  assert.deepEqual(meta, {
    deviceCategory: 'Mobile',
    browserCategory: 'Safari',
    osCategory: 'iOS',
    country: 'US',
  });
});

test('parseScanMetadata extracts desktop Windows Chrome metadata and falls back to Accept-Language', () => {
  const req = {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'accept-language': 'en-GB,en;q=0.9',
    },
  };
  const meta = parseScanMetadata(req);
  assert.equal(meta.deviceCategory, 'Desktop');
  assert.equal(meta.browserCategory, 'Chrome');
  assert.equal(meta.osCategory, 'Windows');
  assert.equal(meta.country, 'GB');
});

test('generateCodeId returns cryptographically random URL-safe strings', () => {
  const a = generateCodeId(10);
  const b = generateCodeId(10);
  assert.equal(a.length, 10);
  assert.equal(b.length, 10);
  assert.notEqual(a, b);
  assert.match(a, /^[A-Za-z0-9]+$/);
});
