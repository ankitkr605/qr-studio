import { Router } from 'express';
import { handleRedirect } from '../controllers/redirectController.js';
import { redirectLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/:codeId', redirectLimiter, handleRedirect);

export default router;
