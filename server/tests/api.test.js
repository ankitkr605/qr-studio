import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

test('API health, QR image generation, and auth protection checks', async () => {
  const { server, baseUrl } = await startServer();
  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthJson = await healthRes.json();
    assert.equal(healthJson.status, 'ok');

    // 2. Public QR SVG generation
    const svgRes = await fetch(`${baseUrl}/api/qrcodes/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'https://qrstudio.app', format: 'svg', size: 240 }),
    });
    assert.equal(svgRes.status, 200);
    assert.match(svgRes.headers.get('content-type') || '', /image\/svg\+xml/);
    const svgText = await svgRes.text();
    assert.match(svgText, /<svg/);

    // 3. Public QR PNG generation
    const pngRes = await fetch(`${baseUrl}/api/qrcodes/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'https://qrstudio.app', format: 'png' }),
    });
    assert.equal(pngRes.status, 200);
    assert.match(pngRes.headers.get('content-type') || '', /image\/png/);

    // 4. Protected routes enforce JWT authentication
    const unauthQr = await fetch(`${baseUrl}/api/qrcodes`);
    assert.equal(unauthQr.status, 401);

    const unauthAnalytics = await fetch(`${baseUrl}/api/analytics/overview`);
    assert.equal(unauthAnalytics.status, 401);

    // 5. Validation error returns 400
    const badLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '' }),
    });
    assert.equal(badLogin.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
