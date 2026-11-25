import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

function aggregateScans(scans, days) {
  // Build continuous day buckets
  const dateMap = new Map();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dateMap.set(key, 0);
  }

  const deviceMap = new Map();
  const browserMap = new Map();
  const osMap = new Map();
  const countryMap = new Map();

  for (const scan of scans) {
    const dayKey = new Date(scan.scannedAt).toISOString().slice(0, 10);
    if (dateMap.has(dayKey)) {
      dateMap.set(dayKey, dateMap.get(dayKey) + 1);
    }

    deviceMap.set(scan.deviceCategory, (deviceMap.get(scan.deviceCategory) || 0) + 1);
    browserMap.set(scan.browserCategory, (browserMap.get(scan.browserCategory) || 0) + 1);
    osMap.set(scan.osCategory, (osMap.get(scan.osCategory) || 0) + 1);
    countryMap.set(scan.country, (countryMap.get(scan.country) || 0) + 1);
  }

  const toSortedArray = (map) =>
    Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

  return {
    scansOverTime: Array.from(dateMap.entries()).map(([date, count]) => ({ date, count })),
    byDevice: toSortedArray(deviceMap),
    byBrowser: toSortedArray(browserMap),
    byOs: toSortedArray(osMap),
    byCountry: toSortedArray(countryMap).slice(0, 10),
  };
}

export async function getOverviewAnalytics(req, res, next) {
  try {
    const userId = req.user.id;
    const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 30));
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [qrCodes, scans] = await Promise.all([
      prisma.qRCode.findMany({
        where: { userId },
        orderBy: { scanCount: 'desc' },
        select: { id: true, codeId: true, name: true, scanCount: true, isActive: true, expiresAt: true },
      }),
      prisma.qRScan.findMany({
        where: {
          qrCode: { userId },
          scannedAt: { gte: since },
        },
        orderBy: { scannedAt: 'desc' },
      }),
    ]);

    const totalQrCodes = qrCodes.length;
    const totalScans = qrCodes.reduce((sum, q) => sum + q.scanCount, 0);
    const now = new Date();
    const activeQrCodes = qrCodes.filter((q) => q.isActive && (!q.expiresAt || q.expiresAt > now)).length;

    return res.json({
      summary: { totalQrCodes, totalScans, activeQrCodes },
      topQrCodes: qrCodes.slice(0, 5),
      ...aggregateScans(scans, days),
    });
  } catch (err) {
    return next(err);
  }
}

export async function getQrAnalytics(req, res, next) {
  try {
    const qrCode = await prisma.qRCode.findUnique({ where: { id: req.params.id } });
    if (!qrCode) throw new AppError('QR code not found.', 404);
    if (qrCode.userId !== req.user.id) throw new AppError('Access denied.', 403);

    const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 30));
    const since = new Date();
    since.setDate(since.getDate() - days);

    const scans = await prisma.qRScan.findMany({
      where: {
        qrCodeId: qrCode.id,
        scannedAt: { gte: since },
      },
      orderBy: { scannedAt: 'desc' },
    });

    return res.json({
      qrCode,
      ...aggregateScans(scans, days),
      recentScans: scans.slice(0, 25),
    });
  } catch (err) {
    return next(err);
  }
}
