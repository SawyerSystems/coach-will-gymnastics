import { Request, Response, Router } from 'express';

import crypto from 'crypto';
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

// Email verification utilities
const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  // For now, just log the token. In production, you'd send an actual email
  console.log(`Verification email for ${email}: http://localhost:5173/verify-email?token=${token}`);
  // TODO: Implement actual email sending service (SendGrid, Mailgun, etc.)
};

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
      isVerified: false,
    });

    // Generate verification token and send email
    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    await storage.createVerificationToken({
      parentId: parent.id,
      token,
      expiresAt,
    });

    await sendVerificationEmail(email, token);

    res.status(201).json({ 
      success: true, 
      parentId: parent.id, 
      message: 'Registration successful. Please check your email to verify your account.' 
    });
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

    // Check if email is verified
    const isVerified = parent.isVerified || (parent as any).is_verified;
    if (!isVerified) {
      return res.status(403).json({ 
        error: 'Email not verified. Please check your email and click the verification link.' 
      });
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

// GET /api/parent-auth/verify-email
parentAuthRouter.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find the verification token and check if it's valid and not expired
    const verificationToken = await storage.getVerificationToken(token);
    
    if (!verificationToken) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    if (new Date() > new Date(verificationToken.expiresAt || verificationToken.expires_at)) {
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    // Mark the parent as verified
    const parentId = verificationToken.parentId || verificationToken.parent_id;
    await storage.markParentAsVerified(parentId);
    
    // Delete the used verification token
    await storage.deleteVerificationToken(token);

    res.json({ 
      success: true, 
      message: 'Email verified successfully. You can now log in.' 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// POST /api/parent-auth/resend-verification
parentAuthRouter.post('/resend-verification', [
  body('email').isEmail().normalizeEmail(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    const parent = await storage.getParentByEmail(email);
    
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const isVerified = parent.isVerified || (parent as any).is_verified;
    if (isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    // Delete any existing tokens for this parent
    await storage.deleteVerificationTokensByParentId(parent.id);
    
    // Create new token
    await storage.createVerificationToken({
      parentId: parent.id,
      token,
      expiresAt,
    });

    await sendVerificationEmail(email, token);

    res.json({ 
      success: true, 
      message: 'Verification email sent successfully' 
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});
