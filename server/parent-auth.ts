import { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { storage } from './storage';

export const parentAuthRouter = Router();

// Test endpoint to create a parent with password auth (for testing only)
parentAuthRouter.post('/create-test-parent', async (req: Request, res: Response) => {
  try {
    // Create a test parent account
    const testParent = await storage.createParent({
      firstName: 'Test',
      lastName: 'Parent',
      email: 'test@parent.com',
      phone: '555-0123',
      emergencyContactName: 'Emergency Contact',
      emergencyContactPhone: '555-0456'
    });

    res.json({ 
      message: 'Test parent account created',
      parent: {
        id: testParent.id,
        firstName: testParent.firstName,
        lastName: testParent.lastName,
        email: testParent.email
      }
    });
  } catch (error) {
    console.error('Failed to create test parent:', error);
    res.status(500).json({ message: 'Failed to create test parent' });
  }
});

// Test password login endpoint (for testing only)
parentAuthRouter.post('/test-login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Simple test - if email is test@parent.com and password is 'test123'
    if (email === 'test@parent.com' && password === 'test123') {
      const parent = await storage.identifyParent(email, '');
      if (!parent) {
        return res.status(404).json({ message: 'Test parent not found' });
      }

      // Set session
      req.session.parentId = parent.id;
      req.session.parentEmail = email;

      res.json({ 
        message: 'Test login successful',
        parent: {
          id: parent.id,
          firstName: parent.firstName,
          lastName: parent.lastName,
          email: parent.email,
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid test credentials' });
    }
  } catch (error) {
    console.error('Failed test login:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
});

// Generate 6-digit code
function generateAuthCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send authentication code to parent email (alias for request-code)
parentAuthRouter.post('/request-code', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Valid email is required' });
      }

      // Check if parent exists in bookings
      const bookings = await storage.getAllBookings();
      const parentBookings = bookings.filter(booking => 
        booking.parentEmail.toLowerCase() === email.toLowerCase()
      );

      if (parentBookings.length === 0) {
        return res.status(404).json({ 
          error: 'No account found with this email address',
          message: 'Please check your email or contact us if you need assistance.'
        });
      }

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

      // Store code in session temporarily
      req.session.tempAuthCode = code;
      req.session.tempAuthEmail = email;
      req.session.tempAuthExpiry = expiresAt;

      // Also try to store in database if available
      try {
        await storage.createParentAuthCode({
          email,
          code,
          expiresAt: new Date(expiresAt),
          used: false,
        });
      } catch (dbError: any) {
        console.log('Database auth code storage failed, using session only:', dbError.message);
      }

      // Send email with Resend
      if (process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);

          const parentName = parentBookings[0].parentFirstName || 'Parent';

          await resend.emails.send({
            from: 'Coach Will <coach@coachwilltumbles.com>',
            to: email,
            subject: 'Your Coach Will Tumbles Login Code',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #0F0276; margin: 0;">Coach Will Tumbles</h1>
                  <p style="color: #D8BD2A; font-weight: bold; margin: 5px 0;">Parent Portal Access</p>
                </div>

                <h2 style="color: #0F0276;">Hi ${parentName}!</h2>
                <p>Use this code to access your Coach Will Tumbles parent portal:</p>

                <div style="background: linear-gradient(135deg, #0F0276, #E10B0B); padding: 25px; text-align: center; margin: 25px 0; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                  <h1 style="font-size: 36px; color: white; margin: 0; letter-spacing: 8px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${code}</h1>
                  <p style="color: #D8BD2A; margin: 10px 0 0 0; font-weight: bold;">Valid for 10 minutes</p>
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #666;">
                    <strong>Security tip:</strong> Never share this code with anyone. Coach Will Tumbles will never ask for your login code via phone or email.
                  </p>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  Best regards,<br>
                  Coach Will<br>
                  <span style="color: #D8BD2A;">Coach Will Tumbles</span>
                </p>
              </div>
            `
          });

          console.log(`[PARENT AUTH] Verification code sent to ${email} for ${parentName}`);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Still return success to prevent revealing email service issues
        }
      }

      res.json({ 
        success: true, 
        message: 'Verification code sent to your email',
        parentName: parentBookings[0].parentFirstName
      });
    } catch (error) {
      console.error('Error sending verification code:', error);
      res.status(500).json({ 
        error: 'Failed to send verification code',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

// Send authentication code to parent email
parentAuthRouter.post('/send-code', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Valid email is required' });
      }

      // Check if parent exists in bookings
      const bookings = await storage.getAllBookings();
      const parentBookings = bookings.filter(booking => 
        booking.parentEmail.toLowerCase() === email.toLowerCase()
      );

      if (parentBookings.length === 0) {
        return res.status(404).json({ 
          error: 'No account found with this email address',
          message: 'Please check your email or contact us if you need assistance.'
        });
      }

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

      // Store code in session temporarily
      req.session.tempAuthCode = code;
      req.session.tempAuthEmail = email;
      req.session.tempAuthExpiry = expiresAt;

      // Also try to store in database if available
      try {
        await storage.createParentAuthCode({
          email,
          code,
          expiresAt: new Date(expiresAt),
          used: false,
        });
      } catch (dbError: any) {
        console.log('Database auth code storage failed, using session only:', dbError.message);
      }

      // Send email with Resend
      if (process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);

          const parentName = parentBookings[0].parentFirstName || 'Parent';

          await resend.emails.send({
            from: 'Coach Will <coach@coachwilltumbles.com>',
            to: email,
            subject: 'Your Coach Will Tumbles Login Code',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #0F0276; margin: 0;">Coach Will Tumbles</h1>
                  <p style="color: #D8BD2A; font-weight: bold; margin: 5px 0;">Parent Portal Access</p>
                </div>

                <h2 style="color: #0F0276;">Hi ${parentName}!</h2>
                <p>Use this code to access your Coach Will Tumbles parent portal:</p>

                <div style="background: linear-gradient(135deg, #0F0276, #E10B0B); padding: 25px; text-align: center; margin: 25px 0; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                  <h1 style="font-size: 36px; color: white; margin: 0; letter-spacing: 8px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${code}</h1>
                  <p style="color: #D8BD2A; margin: 10px 0 0 0; font-weight: bold;">Valid for 10 minutes</p>
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #666;">
                    <strong>Security tip:</strong> Never share this code with anyone. Coach Will Tumbles will never ask for your login code via phone or email.
                  </p>
                </div>

                <p>If you didn't request this code, please ignore this email or contact us at <a href="mailto:Admin@coachwilltumbles.com" style="color: #0F0276;">Admin@coachwilltumbles.com</a></p>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="color: #999; font-size: 12px; margin: 0;">© 2025 Coach Will Tumbles. All rights reserved.</p>
                </div>
              </div>
            `
          });

          console.log(`[PARENT AUTH] Verification code sent to ${email} for ${parentName}`);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Still return success to prevent revealing email service issues
        }
      }

      res.json({ 
        success: true, 
        message: 'Verification code sent to your email',
        parentName: parentBookings[0].parentFirstName
      });
    } catch (error) {
      console.error('Error sending verification code:', error);
      res.status(500).json({ 
        error: 'Failed to send verification code',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

// Verify authentication code
parentAuthRouter.post('/verify-code', [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, code } = req.body;

    // Check session-based temp auth code
    if (!req.session.tempAuthCode || 
        !req.session.tempAuthEmail || 
        !req.session.tempAuthExpiry) {
      return res.status(401).json({ message: 'No pending authentication' });
    }

    // Verify email matches
    if (req.session.tempAuthEmail !== email) {
      return res.status(401).json({ message: 'Email mismatch' });
    }

    // Check if expired
    if (Date.now() > req.session.tempAuthExpiry) {
      return res.status(401).json({ message: 'Code has expired' });
    }

    // Verify code
    if (req.session.tempAuthCode !== code) {
      return res.status(401).json({ message: 'Invalid code' });
    }

    // Clear temp auth data
    req.session.tempAuthCode = undefined;
    req.session.tempAuthEmail = undefined;
    req.session.tempAuthExpiry = undefined;

    // Get or create parent info
    let parent = await storage.identifyParent(email, '');
    if (!parent) {
      // Create parent from booking data
      const bookings = await storage.getAllBookings();
      const parentBooking = bookings.find(booking => 
        booking.parentEmail.toLowerCase() === email.toLowerCase()
      );
      
      if (parentBooking) {
        parent = await storage.createParent({
          firstName: parentBooking.parentFirstName || '',
          lastName: parentBooking.parentLastName || '',
          email: email,
          phone: parentBooking.parentPhone || '',
          emergencyContactName: parentBooking.emergencyContactName || '',
          emergencyContactPhone: parentBooking.emergencyContactPhone || '',
          // Remove waiver fields - they're now in separate waivers table
        });
        console.log(`[PARENT AUTH] Created parent profile for ${email}`);
      } else {
        return res.status(404).json({ message: 'Parent not found and cannot create profile' });
      }
    }

    // Set session
    req.session.parentId = parent.id;
    req.session.parentEmail = email;

    console.log(`[PARENT AUTH] Successful login for ${email}, parent ID: ${parent.id}`);

    res.json({ 
      message: 'Authentication successful',
      parent: {
        id: parent.id,
        firstName: parent.firstName,
        lastName: parent.lastName,
        email: parent.email,
      }
    });
  } catch (error) {
    console.error('Failed to verify auth code:', error);
    res.status(500).json({ message: 'Failed to verify authentication code' });
  }
});

// Get parent session status
parentAuthRouter.get('/status', (req: Request, res: Response) => {
  if (req.session.parentId) {
    res.json({ 
      loggedIn: true, 
      parentId: req.session.parentId,
      email: req.session.parentEmail 
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// Logout
parentAuthRouter.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Middleware to check if parent is authenticated
export const isParentAuthenticated = (req: Request, res: Response, next: Function) => {
  if (!req.session.parentId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};