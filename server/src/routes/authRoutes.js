import { Router } from 'express';
import { register, login, me, updateProfile, changePassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../utils/qrPayload.js';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.get('/me', requireAuth, me);
router.patch('/profile', requireAuth, validateBody(updateProfileSchema), updateProfile);
router.patch('/password', requireAuth, validateBody(changePasswordSchema), changePassword);

export default router;
