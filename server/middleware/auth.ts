import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth';

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
      user?: any;
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set in environment variables.');
  }
  return secret;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
    req.auth = payload;
    req.user = payload; // Attach to req.user as well for compatibility
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.auth?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  return next();
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user || req.auth;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
}

