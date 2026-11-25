import { Router } from 'express';
import {
  listQrCodes,
  getQrCode,
  createQrCode,
  updateQrCode,
  deleteQrCode,
  generateQrImage,
  downloadSavedQrImage,
} from '../controllers/qrController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createQrSchema, updateQrSchema } from '../utils/qrPayload.js';

const router = Router();

// Public QR image generation endpoint
router.post('/image', generateQrImage);

// Protected dynamic QR management endpoints
router.get('/', requireAuth, listQrCodes);
router.post('/', requireAuth, validateBody(createQrSchema), createQrCode);
router.get('/:id', requireAuth, getQrCode);
router.get('/:id/image', requireAuth, downloadSavedQrImage);
router.patch('/:id', requireAuth, validateBody(updateQrSchema), updateQrCode);
router.delete('/:id', requireAuth, deleteQrCode);

export default router;
