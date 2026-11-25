import QRCode from 'qrcode';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateCodeId } from '../utils/idGenerator.js';
import { validateQrDestination } from '../utils/urlSecurity.js';

export async function listQrCodes(req, res, next) {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = String(req.query.search || '').trim();
    const qrType = String(req.query.qrType || '').trim();
    const status = String(req.query.status || '').trim();

    const allowedSort = new Set(['createdAt', 'name', 'scanCount', 'updatedAt']);
    const sortBy = allowedSort.has(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

    const where = { userId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { destinationUrl: { contains: search, mode: 'insensitive' } },
        { codeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (qrType) {
      where.qrType = qrType;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [items, total, aggregate, activeCount, recent] = await Promise.all([
      prisma.qRCode.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.qRCode.count({ where }),
      prisma.qRCode.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: { scanCount: true },
      }),
      prisma.qRCode.count({
        where: {
          userId,
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      }),
      prisma.qRCode.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

    return res.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      stats: {
        totalQrCodes: aggregate._count.id || 0,
        totalScans: aggregate._sum.scanCount || 0,
        activeQrCodes: activeCount,
      },
      recent,
    });
  } catch (err) {
    return next(err);
  }
}

export async function getQrCode(req, res, next) {
  try {
    const qr = await prisma.qRCode.findUnique({ where: { id: req.params.id } });
    if (!qr) throw new AppError('QR code not found.', 404);
    if (qr.userId !== req.user.id) throw new AppError('Access denied.', 403);
    return res.json({ qrCode: qr });
  } catch (err) {
    return next(err);
  }
}

async function generateUniqueCodeId() {
  for (let i = 0; i < 6; i++) {
    const candidate = generateCodeId(9);
    const exists = await prisma.qRCode.findUnique({ where: { codeId: candidate }, select: { id: true } });
    if (!exists) return candidate;
  }
  throw new AppError('Unable to allocate unique QR identifier. Please retry.', 500);
}

export async function createQrCode(req, res, next) {
  try {
    const { name, qrType, destinationUrl, isDynamic, expiresAt, customization } = req.validatedBody;

    const validation = validateQrDestination(qrType, destinationUrl, {
      allowLocal: env.allowLocalRedirects,
    });
    if (!validation.valid) {
      throw new AppError(validation.reason, 400);
    }

    const codeId = await generateUniqueCodeId();
    const qrCode = await prisma.qRCode.create({
      data: {
        codeId,
        userId: req.user.id,
        name,
        qrType,
        destinationUrl: validation.url,
        isDynamic: Boolean(isDynamic),
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        customization: customization || {},
      },
    });

    return res.status(201).json({
      qrCode,
      redirectUrl: `${env.appUrl}/r/${qrCode.codeId}`,
    });
  } catch (err) {
    return next(err);
  }
}

export async function updateQrCode(req, res, next) {
  try {
    const existing = await prisma.qRCode.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('QR code not found.', 404);
    if (existing.userId !== req.user.id) throw new AppError('Access denied.', 403);

    const { name, destinationUrl, isActive, expiresAt, customization } = req.validatedBody;

    let nextDestination = existing.destinationUrl;
    if (destinationUrl !== undefined) {
      const validation = validateQrDestination(existing.qrType, destinationUrl, {
        allowLocal: env.allowLocalRedirects,
      });
      if (!validation.valid) {
        throw new AppError(validation.reason, 400);
      }
      nextDestination = validation.url;
    }

    const updated = await prisma.qRCode.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        destinationUrl: nextDestination,
        ...(isActive !== undefined ? { isActive } : {}),
        ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
        ...(customization !== undefined ? { customization } : {}),
      },
    });

    return res.json({ qrCode: updated });
  } catch (err) {
    return next(err);
  }
}

export async function deleteQrCode(req, res, next) {
  try {
    const existing = await prisma.qRCode.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('QR code not found.', 404);
    if (existing.userId !== req.user.id) throw new AppError('Access denied.', 403);

    await prisma.qRCode.delete({ where: { id: existing.id } });
    return res.json({ message: 'QR code deleted successfully.' });
  } catch (err) {
    return next(err);
  }
}

/**
 * Generates a PNG or SVG QR code image directly on the backend using `qrcode`.
 * Useful for API integrations and saved dynamic QR downloads.
 */
export async function generateQrImage(req, res, next) {
  try {
    const content = String(req.body?.content || req.query?.content || '').trim();
    const format = String(req.body?.format || req.query?.format || 'png').toLowerCase();
    const fgColor = /^#[0-9A-Fa-f]{6}$/.test(req.body?.fgColor || '') ? req.body.fgColor : '#0f172a';
    const bgColor = /^#[0-9A-Fa-f]{6}$/.test(req.body?.bgColor || '') ? req.body.bgColor : '#ffffff';
    const width = Math.min(1024, Math.max(128, parseInt(req.body?.size || req.query?.size, 10) || 320));
    const margin = Math.min(8, Math.max(0, parseInt(req.body?.margin || req.query?.margin, 10) || 2));
    const errorCorrectionLevel = ['L', 'M', 'Q', 'H'].includes(req.body?.ecc) ? req.body.ecc : 'M';

    if (!content || content.length > 2048) {
      throw new AppError('Content must be between 1 and 2048 characters.', 400);
    }

    const opts = {
      width,
      margin,
      errorCorrectionLevel,
      color: { dark: fgColor, light: bgColor },
    };

    if (format === 'svg') {
      const svg = await QRCode.toString(content, { ...opts, type: 'svg' });
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      return res.send(svg);
    }

    const pngBuffer = await QRCode.toBuffer(content, { ...opts, type: 'png' });
    res.setHeader('Content-Type', 'image/png');
    return res.send(pngBuffer);
  } catch (err) {
    return next(err);
  }
}

export async function downloadSavedQrImage(req, res, next) {
  try {
    const qr = await prisma.qRCode.findUnique({ where: { id: req.params.id } });
    if (!qr) throw new AppError('QR code not found.', 404);
    if (qr.userId !== req.user.id) throw new AppError('Access denied.', 403);

    const payload = qr.isDynamic ? `${env.appUrl}/r/${qr.codeId}` : qr.destinationUrl;
    const design = qr.customization || {};
    const format = String(req.query.format || 'png').toLowerCase();
    const opts = {
      width: Math.min(1024, Math.max(128, Number(design.size) || 400)),
      margin: Number.isFinite(Number(design.margin)) ? Number(design.margin) : 2,
      errorCorrectionLevel: ['L', 'M', 'Q', 'H'].includes(design.ecc) ? design.ecc : 'M',
      color: {
        dark: /^#[0-9A-Fa-f]{6}$/.test(design.fgColor || '') ? design.fgColor : '#0f172a',
        light: /^#[0-9A-Fa-f]{6}$/.test(design.bgColor || '') ? design.bgColor : '#ffffff',
      },
    };

    if (format === 'svg') {
      const svg = await QRCode.toString(payload, { ...opts, type: 'svg' });
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${qr.codeId}.svg"`);
      return res.send(svg);
    }

    const png = await QRCode.toBuffer(payload, { ...opts, type: 'png' });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${qr.codeId}.png"`);
    return res.send(png);
  } catch (err) {
    return next(err);
  }
}
