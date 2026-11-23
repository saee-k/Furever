import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { FurEverModel } from '../models/fureverModel';
import { AuthenticatedRequest, signToken } from '../middleware/auth';

export const AuthController = {
  async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { fullName, email, password, role, phone, city, housingType, bio } = req.body;
      if (!fullName || !email || !password) {
        res.status(400).json({ error: 'Full name, email, and password are required.' });
        return;
      }
      if (String(password).length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters.' });
        return;
      }

      const existing = await FurEverModel.findUserByEmail(email);
      if (existing) {
        res.status(409).json({ error: 'An account with this email already exists.' });
        return;
      }

      const cleanRole = role === 'lister' ? 'lister' : 'adopter';
      const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const passwordHash = await bcrypt.hash(String(password), 10);

      const newUser = await FurEverModel.createUser({
        id: userId,
        full_name: String(fullName).trim(),
        email: String(email).trim().toLowerCase(),
        password_hash: passwordHash,
        role: cleanRole,
        phone: String(phone || '').trim(),
        city: String(city || 'Bengaluru').trim(),
        housing_type: String(housingType || 'Apartment').trim(),
        bio: String(bio || '').trim(),
        avatar_url: null,
        is_active: 1,
        created_at: new Date().toISOString(),
      });

      const token = signToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        fullName: newUser.full_name,
      });

      res.cookie('furever_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const { password_hash: _pw, ...safeUser } = newUser;
      res.status(201).json({ token, user: safeUser });
    } catch (err) {
      res.status(500).json({ error: 'Registration failed: ' + (err as Error).message });
    }
  },

  async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      const user = await FurEverModel.findUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }
      if (!user.is_active) {
        res.status(403).json({ error: 'This account has been deactivated by an administrator.' });
        return;
      }

      const valid = await bcrypt.compare(String(password), user.password_hash);
      if (!valid) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
      });

      res.cookie('furever_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const { password_hash: _pw, ...safeUser } = user;
      const favouriteIds = await FurEverModel.getUserFavouriteIds(user.id);
      res.json({ token, user: safeUser, favouriteIds });
    } catch (err) {
      res.status(500).json({ error: 'Login failed: ' + (err as Error).message });
    }
  },

  async logout(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.clearCookie('furever_token');
    res.json({ ok: true });
  },

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Not signed in.' });
      return;
    }
    const user = await FurEverModel.findUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    const { password_hash: _pw, ...safeUser } = user;
    const favouriteIds = await FurEverModel.getUserFavouriteIds(user.id);
    const notifications = await FurEverModel.listNotifications(user.id);
    res.json({ user: safeUser, favouriteIds, notifications });
  },

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const { fullName, phone, city, housingType, bio } = req.body;
    const updated = await FurEverModel.updateUserProfile(req.user.userId, {
      full_name: fullName ? String(fullName).trim() : undefined,
      phone: phone !== undefined ? String(phone).trim() : undefined,
      city: city !== undefined ? String(city).trim() : undefined,
      housing_type: housingType !== undefined ? String(housingType).trim() : undefined,
      bio: bio !== undefined ? String(bio).trim() : undefined,
    });
    if (!updated) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    const { password_hash: _pw, ...safeUser } = updated;
    res.json({ user: safeUser });
  },
};
