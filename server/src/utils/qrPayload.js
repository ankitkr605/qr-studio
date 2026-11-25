import { z } from 'zod';

export const ALLOWED_QR_TYPES = [
  'url',
  'text',
  'wifi',
  'email',
  'phone',
  'sms',
  'whatsapp',
  'vcard',
  'location',
  'upi',
  'social',
  'pdf',
  'event',
];

export const customizationSchema = z
  .object({
    fgColor: z.string().regex(/^#[0-9A-Fa-f]{3,8}$/).optional(),
    bgColor: z.string().regex(/^#[0-9A-Fa-f]{3,8}$/).optional(),
    size: z.number().min(120).max(1024).optional(),
    ecc: z.enum(['L', 'M', 'Q', 'H']).optional(),
    margin: z.number().min(0).max(10).optional(),
    dotStyle: z.enum(['square', 'rounded', 'dots', 'diamond', 'classy']).optional(),
    cornerStyle: z.enum(['square', 'rounded', 'extra-rounded']).optional(),
    logoDataUrl: z.string().max(1_500_000).optional(),
    logoSizePct: z.number().min(10).max(35).optional(),
    title: z.string().max(60).optional(),
  })
  .passthrough();

export const createQrSchema = z.object({
  name: z.string().trim().min(1, 'QR name is required.').max(120),
  qrType: z.enum(ALLOWED_QR_TYPES),
  destinationUrl: z.string().trim().min(1, 'Destination is required.').max(2048),
  isDynamic: z.boolean().optional().default(true),
  expiresAt: z.string().datetime().nullable().optional(),
  customization: customizationSchema.optional().default({}),
});

export const updateQrSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  destinationUrl: z.string().trim().min(1).max(2048).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  customization: customizationSchema.optional(),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80),
  email: z.string().trim().email('Valid email address is required.').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Valid email address is required.').toLowerCase(),
  password: z.string().min(1, 'Password is required.'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});
