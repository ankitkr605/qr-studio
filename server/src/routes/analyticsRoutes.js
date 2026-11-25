import { Router } from 'express';
import { getOverviewAnalytics, getQrAnalytics } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/overview', requireAuth, getOverviewAnalytics);
router.get('/qrcodes/:id', requireAuth, getQrAnalytics);

export default router;
