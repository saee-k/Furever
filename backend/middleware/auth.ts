import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'adopter' | 'lister' | 'admin';
  fullName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || 'furever-local-session-secret-change-in-production';
};

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthPayload;
  } catch {
    return null;
  }
}

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)furever_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    return;
  }
  req.user = decoded;
  next();
}

export function requireRole(...roles: Array<'adopter' | 'lister' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'You do not have permission to perform this action.' });
      return;
    }
    next();
  };
}
