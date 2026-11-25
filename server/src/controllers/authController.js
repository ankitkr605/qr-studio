import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.validatedBody;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const token = signToken(user.id);
    return res.status(201).json({ token, user });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validatedBody;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = signToken(user.id);
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function me(req, res) {
  return res.json({ user: req.user });
}

export async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.validatedBody;
    if (email !== req.user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== req.user.id) {
        throw new AppError('Email is already in use by another account.', 409);
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return res.json({ user: updated });
  } catch (err) {
    return next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.validatedBody;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new AppError('User not found.', 404);

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new AppError('Current password is incorrect.', 400);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    return next(err);
  }
}
