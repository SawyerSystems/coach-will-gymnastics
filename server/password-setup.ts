import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { sendPasswordSetupEmail } from './lib/email';
import { storage } from './storage';

export const passwordSetupRouter = Router();

// Function to generate a random token for password reset
const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// POST /api/parent-auth/send-password-setup
passwordSetupRouter.post('/send-password-setup', [
  body('parentId').isNumeric().notEmpty(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { parentId } = req.body;
    
    // Get parent from database
    const parent = await storage.getParentById(parseInt(parentId));
    
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    // Delete any existing password reset tokens for this parent
    await storage.deletePasswordResetTokensByParentId(parent.id);
    
    // Generate a reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    // Store the reset token
    await storage.createPasswordResetToken({
      parentId: parent.id,
      token: resetToken,
      expiresAt,
    });

    // Send the password setup email
    await sendPasswordSetupEmail(
      parent.email,
      parent.firstName,
      resetToken
    );

    res.json({ 
      success: true, 
      message: 'Password setup email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending password setup email:', error);
    res.status(500).json({ error: 'Failed to send password setup email' });
  }
});

// POST /api/parent-auth/set-password
passwordSetupRouter.post('/set-password', [
  body('token').isString().notEmpty(),
  body('password').isString().isLength({ min: 8 }),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token, password } = req.body;
    
    // Verify the token
    const resetToken = await storage.getPasswordResetToken(token);
    
    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired password reset token' });
    }

    // Check if token is expired
    if (new Date() > new Date(resetToken.expiresAt || resetToken.expires_at)) {
      return res.status(400).json({ error: 'Password reset token has expired' });
    }

    // Get the parent
    const parentId = resetToken.parentId || resetToken.parent_id;
    const parent = await storage.getParentById(parentId);
    
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    // Update the parent's password
    const passwordHash = await bcrypt.hash(password, 10);
    await storage.updateParent(parentId, { passwordHash });
    
    // Mark the token as used
    await storage.markPasswordResetTokenAsUsed(token);

    // Set the parent as verified if they weren't already
    if (!parent.isVerified) {
      await storage.markParentAsVerified(parentId);
    }

    res.json({ 
      success: true, 
      message: 'Password set successfully. You can now log in.' 
    });
  } catch (error) {
    console.error('Error setting password:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
});
