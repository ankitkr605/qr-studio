import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from './errorHandler.js';

export async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required.', 401);
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new AppError('Authentication token missing.', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch {
      throw new AppError('Invalid or expired session token.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      throw new AppError('Authenticated user account not found.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
