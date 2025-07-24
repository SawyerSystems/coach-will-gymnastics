import { Request, Response, Router } from 'express';

import { NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { storage } from './storage';

export const parentAuthRouter = Router();

// Middleware to check if parent is authenticated
export const isParentAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.parentId) {
    return res.status(401).json({ error: 'Parent authentication required' });
  }
  next();
};

import bcrypt from 'bcryptjs';

// POST /api/parent-auth/register
parentAuthRouter.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('firstName').isString().notEmpty(),
  body('lastName').isString().notEmpty(),
  body('phone').isString().notEmpty(),
  body('emergencyContactName').isString().notEmpty(),
  body('emergencyContactPhone').isString().notEmpty(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password, firstName, lastName, phone, emergencyContactName, emergencyContactPhone } = req.body;
    const existing = await storage.getParentByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Parent with this email already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const parent = await storage.createParent({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      emergencyContactName,
      emergencyContactPhone,
    });
    res.status(201).json({ success: true, parentId: parent.id });
  } catch (error) {
    console.error('Parent registration error:', error);
    res.status(500).json({ error: 'Failed to register parent' });
  }
});

// POST /api/parent-auth/login
parentAuthRouter.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const parent = await storage.getParentByEmail(email);
    if (!parent) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const passwordHash = parent.passwordHash || (parent as any).password_hash;
    const isValid = await bcrypt.compare(password, passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    req.session.parentId = parent.id;
    req.session.parentEmail = parent.email;
    res.json({ success: true, parentId: parent.id, parentEmail: parent.email });
  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// GET /api/parent-auth/status
parentAuthRouter.get('/status', (req: Request, res: Response) => {
  if (req.session.parentId) {
    res.json({
      loggedIn: true,
      parentId: req.session.parentId,
      email: req.session.parentEmail
    });
  } else {
    res.json({
      loggedIn: false
    });
  }
});

// POST /api/parent-auth/logout
parentAuthRouter.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.json({ success: true, message: 'Logged out successfully' });
  });
});
