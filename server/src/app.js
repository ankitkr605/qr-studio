import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import redirectRoutes from './routes/redirectRoutes.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: env.clientUrl.split(',').map((s) => s.trim()),
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'qr-studio-api', timestamp: new Date().toISOString() });
});

app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/qrcodes', qrRoutes);
app.use('/api/analytics', analyticsRoutes);

// Dynamic QR short redirect endpoint
app.use('/r', redirectRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
