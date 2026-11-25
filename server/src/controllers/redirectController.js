import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { parseScanMetadata } from '../utils/userAgent.js';
import { isHttpDestination, validateSafeHttpUrl } from '../utils/urlSecurity.js';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderStatusHtml(title, message, statusCode = 404) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} — QR Studio</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 24px; }
    .card { max-width: 460px; width: 100%; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; text-align: center; box-shadow: 0 10px 30px rgba(15,23,42,0.06); }
    .badge { display: inline-block; background: #eef2ff; color: #4f46e5; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; margin-bottom: 12px; }
    h1 { font-size: 20px; margin: 0 0 10px; }
    p { font-size: 14px; color: #475569; line-height: 1.6; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">HTTP ${statusCode}</span>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
  </div>
</body>
</html>`;
}

function renderPayloadActionHtml(qr) {
  const safeName = escapeHtml(qr.name);
  const safeType = escapeHtml(qr.qrType.toUpperCase());
  const safeContent = escapeHtml(qr.destinationUrl);
  const canOpenDirect = /^(mailto:|tel:|upi:\/\/)/i.test(qr.destinationUrl);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeName} — QR Studio</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 24px; }
    .card { max-width: 520px; width: 100%; background: #fff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 28px; box-shadow: 0 10px 30px rgba(15,23,42,0.06); }
    .badge { display: inline-block; background: #eef2ff; color: #4f46e5; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; }
    h1 { font-size: 20px; margin: 12px 0; }
    pre { background: #f1f5f9; border-radius: 12px; padding: 14px; font-size: 13px; white-space: pre-wrap; word-break: break-word; color: #1e293b; }
    .btn { display: inline-block; margin-top: 14px; background: #4f46e5; color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 10px 18px; border-radius: 10px; border: none; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">${safeType} · QR STUDIO</span>
    <h1>${safeName}</h1>
    <pre id="payload">${safeContent}</pre>
    ${canOpenDirect ? `<a class="btn" href="${safeContent}">Open Action</a>` : ''}
  </div>
</body>
</html>`;
}

export async function handleRedirect(req, res, next) {
  try {
    const codeId = String(req.params.codeId || '').trim();
    if (!codeId || !/^[A-Za-z0-9_-]{4,32}$/.test(codeId)) {
      return res.status(404).send(renderStatusHtml('QR Code Not Found', 'This dynamic QR link is invalid.', 404));
    }

    const qr = await prisma.qRCode.findUnique({ where: { codeId } });
    if (!qr) {
      return res.status(404).send(renderStatusHtml('QR Code Not Found', 'No dynamic QR code matches this link.', 404));
    }

    if (!qr.isActive) {
      return res
        .status(410)
        .send(renderStatusHtml('QR Code Paused', 'This dynamic QR code has been deactivated by its owner.', 410));
    }

    if (qr.expiresAt && new Date(qr.expiresAt) <= new Date()) {
      return res
        .status(410)
        .send(renderStatusHtml('QR Code Expired', 'This dynamic QR code has passed its expiration date.', 410));
    }

    const meta = parseScanMetadata(req);

    // Log privacy-preserving scan event and increment counter atomically
    await prisma.$transaction([
      prisma.qRScan.create({
        data: {
          qrCodeId: qr.id,
          deviceCategory: meta.deviceCategory,
          browserCategory: meta.browserCategory,
          osCategory: meta.osCategory,
          country: meta.country,
        },
      }),
      prisma.qRCode.update({
        where: { id: qr.id },
        data: { scanCount: { increment: 1 } },
      }),
    ]);

    if (isHttpDestination(qr.destinationUrl)) {
      const safe = validateSafeHttpUrl(qr.destinationUrl, { allowLocal: env.allowLocalRedirects });
      if (!safe.valid) {
        return res
          .status(400)
          .send(renderStatusHtml('Blocked Destination', 'Destination URL failed security validation.', 400));
      }
      return res.redirect(302, safe.url);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(renderPayloadActionHtml(qr));
  } catch (err) {
    return next(err);
  }
}
