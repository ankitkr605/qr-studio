import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET;

if (nodeEnv === 'production' && (!jwtSecret || jwtSecret.length < 32)) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: jwtSecret || 'dev-only-insecure-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  allowLocalRedirects: process.env.ALLOW_LOCAL_REDIRECTS === 'true' || nodeEnv !== 'production',
};
