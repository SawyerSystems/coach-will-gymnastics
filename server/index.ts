import { BookingStatusEnum, PaymentStatusEnum } from "@shared/schema";
import express, { NextFunction, type Request, Response } from "express";
import session from "express-session";
import fs from "fs";
import path from "path";
import { isAdminAuthenticated } from "./auth";
import { logger } from "./logger";
import { registerRoutes } from "./routes";
import { log, serveStatic, setupVite } from "./vite";

// Set Pacific timezone for the server
process.env.TZ = 'America/Los_Angeles';

const app = express();

// Add raw body parsing for Stripe webhook
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON parsing for all other routes
app.use(express.json({ limit: '10mb' })); // Increased limit for photo uploads
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Use default MemoryStore for sessions in development
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Always false for local dev
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize Supabase tables on startup
  try {
    const { createSupabaseTablesViaAPI } = await import("./supabase-migration");
    await createSupabaseTablesViaAPI();
    log("✅ Supabase tables initialized successfully");
  } catch (error) {
    log("⚠️ Supabase table initialization failed, continuing with startup...");
    console.error(error);
  }

  // Site content management endpoints
  let siteContentData: any = {
    bannerVideo: '',
    heroImages: [],
    about: {
      bio: 'Coach Will brings nearly 10 years of passionate gymnastics instruction to every lesson. With USA Gymnastics certification and extensive experience working with athletes of all skill levels, he creates a supportive environment where confidence grows alongside physical abilities.',
      certifications: [
        'USA Gymnastics Certified',
        'CPR/First Aid Certified',
        'Background Checked'
      ],
      experience: 'Nearly 10 years of coaching experience with athletes of all levels'
    },
    contact: {
      phone: '(585) 755-8122',
      email: 'Will@coachwilltumbles.com',
      address: {
        name: 'Oceanside Gymnastics',
        street: '1935 Ave. del Oro #A',
        city: 'Oceanside',
        state: 'CA',
        zip: '92056'
      }
    },
    hours: {
      Monday: { start: '09:00', end: '17:00', available: true },
      Tuesday: { start: '09:00', end: '17:00', available: true },
      Wednesday: { start: '09:00', end: '17:00', available: true },
      Thursday: { start: '09:00', end: '17:00', available: true },
      Friday: { start: '09:00', end: '17:00', available: true },
      Saturday: { start: '08:00', end: '16:00', available: true },
      Sunday: { start: '10:00', end: '15:00', available: false }
    },
    apparatus: [
      'Floor Exercise',
      'Balance Beam',
      'Uneven Bars',
      'Vault',
      'Trampoline',
      'Tumble Track'
    ],
    skills: {
      'Floor Exercise': ['Forward Roll', 'Backward Roll', 'Cartwheel', 'Round Off', 'Handstand'],
      'Balance Beam': ['Straight Line Walk', 'Heel-to-Toe Walk', 'Straight Leg Kick', 'Scale', 'Cartwheel'],
      'Uneven Bars': ['Support Hold', 'Pull-ups', 'Cast', 'Back Hip Circle', 'Glide Swing'],
      'Vault': ['Straight Jump', 'Squat On', 'Straddle On', 'Handstand Flat Back', 'Cartwheel'],
      'Trampoline': ['Seat Drop', 'Knee Drop', 'Front Drop', 'Back Drop', 'Swivel Hips'],
      'Tumble Track': ['Forward Roll', 'Backward Roll', 'Handstand Forward Roll', 'Back Walkover', 'Front Walkover']
    },
    sideQuests: [
      'Flexibility Training',
      'Strength Building',
      'Agility Drills',
      'Mental Focus',
      'Confidence Building'
    ],
    testimonials: [
      {
        name: 'Sarah M.',
        text: "Coach Will transformed my daughter's confidence! She went from shy to performing amazing routines.",
        rating: 5
      },
      {
        name: 'Mike & Lisa P.',
        text: "Best investment we've made in our son's athletic development. Will is patient and encouraging.",
        rating: 5
      }
    ],
    faqs: [
      {
        question: 'What age groups do you work with?',
        answer: 'I work with athletes ages 6 and up, from complete beginners to advanced gymnasts preparing for competitive levels.',
        category: 'General'
      },
      {
        question: 'Do you provide equipment?',
        answer: 'Yes! All lessons are conducted at Oceanside Gymnastics with professional-grade equipment including floor, beam, bars, vault, and trampoline.',
        category: 'Equipment'
      },
      {
        question: 'What should my child wear?',
        answer: 'Athletes should wear comfortable athletic clothing they can move freely in. Avoid loose clothing with strings or zippers. Bare feet or gymnastics shoes are recommended.',
        category: 'Preparation'
      },
      {
        question: 'How long are the lessons?',
        answer: 'Lessons are typically 60 minutes for individual sessions and 90 minutes for semi-private sessions. This allows enough time for warm-up, skill development, and cool-down.',
        category: 'General'
      },
      {
        question: 'What if my child has never done gymnastics before?',
        answer: 'Perfect! I specialize in working with beginners and making gymnastics fun and accessible. We start with basic movements and build confidence gradually.',
        category: 'Beginners'
      }
    ]
  };

  app.post('/api/admin/site-content', isAdminAuthenticated, (req: Request, res: Response) => {
    try {
      siteContentData = { ...siteContentData, ...req.body };
      logger.admin('Site content updated');
      res.json({ success: true, message: 'Site content saved successfully' });
    } catch (error) {
      logger.error('Error saving site content:', error);
      res.status(500).json({ error: 'Failed to save site content' });
    }
  });

  app.get('/api/site-content', (req: Request, res: Response) => {
    try {
      res.json(siteContentData);
    } catch (error) {
      console.error('Error fetching site content:', error);
      res.status(500).json({ error: 'Failed to fetch site content' });
    }
  });

  // REGISTER ROUTES FIRST (before developer routes)
  const server = await registerRoutes(app);

  // Developer Settings Admin Routes
  // Admin function to clear all test data
  app.post('/api/admin/clear-test-data', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const BASE_URL = process.env.SUPABASE_URL;
      const API_KEY = process.env.SUPABASE_ANON_KEY;
      
      if (!BASE_URL || !API_KEY) {
        return res.status(500).json({ error: 'Supabase configuration missing' });
      }

      logger.admin('Clearing all test data...');
      
      // Clear bookings first (due to foreign key constraints)
      const bookingsResponse = await fetch(`${BASE_URL}/rest/v1/bookings?id=neq.0`, {
        method: 'DELETE',
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });

      let bookingsCleared = 0;
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        bookingsCleared = Array.isArray(bookingsData) ? bookingsData.length : 0;
        logger.admin(`✅ Cleared ${bookingsCleared} bookings`);
      }

      // Clear athletes
      const athletesResponse = await fetch(`${BASE_URL}/rest/v1/athletes?id=neq.0`, {
        method: 'DELETE',
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });

      let athletesCleared = 0;
      if (athletesResponse.ok) {
        const athletesData = await athletesResponse.json();
        athletesCleared = Array.isArray(athletesData) ? athletesData.length : 0;
        logger.admin(`✅ Cleared ${athletesCleared} athletes`);
      }

      // Clear parents
      const parentsResponse = await fetch(`${BASE_URL}/rest/v1/parents?id=neq.0`, {
        method: 'DELETE',
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });

      let parentsCleared = 0;
      if (parentsResponse.ok) {
        const parentsData = await parentsResponse.json();
        parentsCleared = Array.isArray(parentsData) ? parentsData.length : 0;
        logger.admin(`✅ Cleared ${parentsCleared} parents`);
      }

      // Clear parent auth codes
      const authCodesResponse = await fetch(`${BASE_URL}/rest/v1/parent_auth_codes?id=neq.0`, {
        method: 'DELETE',
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });

      let authCodesCleared = 0;
      if (authCodesResponse.ok) {
        const authCodesData = await authCodesResponse.json();
        authCodesCleared = Array.isArray(authCodesData) ? authCodesData.length : 0;
        logger.admin(`✅ Cleared ${authCodesCleared} auth codes`);
      }

      // Clear test waiver files
      let waiversCleared = 0;
      try {
        const waiversDir = path.join(process.cwd(), 'data', 'waivers');
        if (fs.existsSync(waiversDir)) {
          const files = fs.readdirSync(waiversDir);
          const waiverFiles = files.filter(file => file.startsWith('waiver_') && file.endsWith('.pdf'));
          
          for (const file of waiverFiles) {
            const filePath = path.join(waiversDir, file);
            try {
              fs.unlinkSync(filePath);
              waiversCleared++;
            } catch (fileError) {
              console.warn(`⚠️  Could not delete waiver file ${file}:`, fileError);
            }
          }
          logger.admin(`✅ Cleared ${waiversCleared} waiver files`);
        } else {
          logger.admin('📁 No waivers directory found');
        }
      } catch (waiverError) {
        console.warn('⚠️  Could not clear waiver files:', waiverError);
      }

      const summary = {
        success: true,
        message: 'All test data cleared successfully',
        cleared: {
          bookings: bookingsCleared,
          athletes: athletesCleared,
          parents: parentsCleared,
          authCodes: authCodesCleared,
          waivers: waiversCleared
        }
      };

      logger.admin('🎉 All test data cleared:', summary);
      res.json(summary);
    } catch (error) {
      console.error('Error clearing test data:', error);
      res.status(500).json({ error: 'Failed to clear test data' });
    }
  });

  // Admin function to generate test bookings
  app.post('/api/admin/generate-test-bookings', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const BASE_URL = process.env.SUPABASE_URL;
      const API_KEY = process.env.SUPABASE_ANON_KEY;
      
      if (!BASE_URL || !API_KEY) {
        return res.status(500).json({ error: 'Supabase configuration missing' });
      }

      logger.admin('Generating test bookings...');
      
      const sampleBookings = [
        {
          lesson_type: 'quick-journey',
          athlete1_name: 'Emma Johnson',
          athlete1_date_of_birth: '2012-05-15',
          athlete1_allergies: 'None',
          athlete1_experience: 'beginner',
          parent_first_name: 'Sarah',
          parent_last_name: 'Johnson',
          parent_email: 'sarah.j@example.com',
          parent_phone: '555-0101',
          emergency_contact_name: 'Mike Johnson',
          emergency_contact_phone: '555-0102',
          preferred_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          preferred_time: '10:00',
          focus_areas: ['Tumbling: Forward Roll', 'Beam: Straight Walk'],
          amount: 40,
          status: BookingStatusEnum.PENDING,
          payment_status: PaymentStatusEnum.RESERVATION_PAID,
          booking_method: 'online'
        },
        {
          lesson_type: 'deep-dive',
          athlete1_name: 'Lucas Brown',
          athlete1_date_of_birth: '2010-08-22',
          athlete1_allergies: 'Latex',
          athlete1_experience: 'intermediate',
          parent_first_name: 'David',
          parent_last_name: 'Brown',
          parent_email: 'david.brown@example.com',
          parent_phone: '555-0201',
          emergency_contact_name: 'Jennifer Brown',
          emergency_contact_phone: '555-0202',
          preferred_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          preferred_time: '14:00',
          focus_areas: ['Vault: Handstand Flat Back', 'Bars: Pull-ups'],
          amount: 60,
          status: BookingStatusEnum.CONFIRMED,
          payment_status: PaymentStatusEnum.SESSION_PAID,
          booking_method: 'online'
        },
        {
          lesson_type: 'dual-quest',
          athlete1_name: 'Sophia Martinez',
          athlete1_date_of_birth: '2013-03-10',
          athlete1_allergies: 'None',
          athlete1_experience: 'beginner',
          athlete2_name: 'Isabella Martinez',
          athlete2_date_of_birth: '2015-07-18',
          athlete2_allergies: 'Peanuts',
          athlete2_experience: 'beginner',
          parent_first_name: 'Maria',
          parent_last_name: 'Martinez',
          parent_email: 'maria.martinez@example.com',
          parent_phone: '555-0301',
          emergency_contact_name: 'Carlos Martinez',
          emergency_contact_phone: '555-0302',
          preferred_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          preferred_time: '11:00',
          focus_areas: ['Tumbling: Cartwheel', 'Floor: Bridge'],
          amount: 50,
          status: BookingStatusEnum.PENDING,
          payment_status: PaymentStatusEnum.RESERVATION_PAID,
          booking_method: 'online'
        },
        {
          lesson_type: 'partner-progression',
          athlete1_name: 'Aiden Wilson',
          athlete1_date_of_birth: '2011-12-05',
          athlete1_allergies: 'None',
          athlete1_experience: 'advanced',
          athlete2_name: 'Ethan Wilson',
          athlete2_date_of_birth: '2009-09-30',
          athlete2_allergies: 'None',
          athlete2_experience: 'advanced',
          parent_first_name: 'Lisa',
          parent_last_name: 'Wilson',
          parent_email: 'lisa.wilson@example.com',
          parent_phone: '555-0401',
          emergency_contact_name: 'Robert Wilson',
          emergency_contact_phone: '555-0402',
          preferred_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          preferred_time: '16:00',
          focus_areas: ['Bars: Back Hip Circle', 'Vault: Cartwheel'],
          amount: 80,
          status: BookingStatusEnum.CONFIRMED,
          payment_status: PaymentStatusEnum.SESSION_PAID,
          booking_method: 'admin'
        },
        {
          lesson_type: 'deep-dive',
          athlete1_name: 'Chloe Davis',
          athlete1_date_of_birth: '2012-11-20',
          athlete1_allergies: 'Dust',
          athlete1_experience: 'intermediate',
          parent_first_name: 'Jessica',
          parent_last_name: 'Davis',
          parent_email: 'jessica.davis@example.com',
          parent_phone: '555-0501',
          emergency_contact_name: 'Mark Davis',
          emergency_contact_phone: '555-0502',
          preferred_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          preferred_time: '13:00',
          focus_areas: ['Beam: Cartwheel', 'Floor: Round Off'],
          amount: 60,
          status: BookingStatusEnum.PENDING,
          payment_status: PaymentStatusEnum.RESERVATION_PAID,
          booking_method: 'online'
        }
      ];

      let createdCount = 0;
      for (const booking of sampleBookings) {
        // Create parent first
        const parent = {
          first_name: booking.parent_first_name,
          last_name: booking.parent_last_name,
          email: booking.parent_email,
          phone: booking.parent_phone,
          emergency_contact_name: booking.emergency_contact_name,
          emergency_contact_phone: booking.emergency_contact_phone,
          waiver_signed: false
        };

        const parentResponse = await fetch(`${BASE_URL}/rest/v1/parents`, {
          method: 'POST',
          headers: {
            'apikey': API_KEY,
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(parent)
        });

        if (!parentResponse.ok) {
          console.error('Failed to create parent:', await parentResponse.text());
          continue;
        }

        const createdParent = await parentResponse.json();
        const parentId = Array.isArray(createdParent) ? createdParent[0]?.id : createdParent?.id;

        // Create athlete(s)
        const athlete1 = {
          parent_id: parentId,
          name: booking.athlete1_name,
          first_name: booking.athlete1_name.split(' ')[0],
          last_name: booking.athlete1_name.split(' ')[1] || '',
          date_of_birth: booking.athlete1_date_of_birth,
          allergies: booking.athlete1_allergies,
          experience: booking.athlete1_experience
        };

        await fetch(`${BASE_URL}/rest/v1/athletes`, {
          method: 'POST',
          headers: {
            'apikey': API_KEY,
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(athlete1)
        });

        // Create second athlete if it exists
        if (booking.athlete2_name) {
          const athlete2 = {
            parent_id: parentId,
            name: booking.athlete2_name,
            first_name: booking.athlete2_name.split(' ')[0],
            last_name: booking.athlete2_name.split(' ')[1] || '',
            date_of_birth: booking.athlete2_date_of_birth,
            allergies: booking.athlete2_allergies,
            experience: booking.athlete2_experience
          };

          await fetch(`${BASE_URL}/rest/v1/athletes`, {
            method: 'POST',
            headers: {
              'apikey': API_KEY,
              'Authorization': `Bearer ${API_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(athlete2)
          });
        }

        // Create booking
        const response = await fetch(`${BASE_URL}/rest/v1/bookings`, {
          method: 'POST',
          headers: {
            'apikey': API_KEY,
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(booking)
        });

        if (response.ok) {
          createdCount++;
        }
      }

      logger.admin(`✅ Generated ${createdCount} test bookings`);
      res.json({ success: true, count: createdCount, message: 'Test bookings generated successfully' });
    } catch (error) {
      console.error('Error generating test bookings:', error);
      res.status(500).json({ error: 'Failed to generate test bookings' });
    }
  });

  // Admin function to simulate payment success
  app.post('/api/admin/simulate-payment-success', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const BASE_URL = process.env.SUPABASE_URL;
      const API_KEY = process.env.SUPABASE_ANON_KEY;
      
      if (!BASE_URL || !API_KEY) {
        return res.status(500).json({ error: 'Supabase configuration missing' });
      }

      logger.admin('Simulating payment success...');
      
      const updateResponse = await fetch(`${BASE_URL}/rest/v1/bookings?payment_status=eq.reservation-paid`, {
        method: 'PATCH',
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          payment_status: PaymentStatusEnum.SESSION_PAID,
          status: BookingStatusEnum.CONFIRMED
        })
      });

      let updatedCount = 0;
      if (updateResponse.ok) {
        const updatedBookings = await updateResponse.json();
        updatedCount = Array.isArray(updatedBookings) ? updatedBookings.length : 0;
      }

      logger.admin(`✅ Updated ${updatedCount} bookings to session-paid`);
      res.json({ success: true, updated: updatedCount, message: 'Payment simulation completed' });
    } catch (error) {
      console.error('Error simulating payment success:', error);
      res.status(500).json({ error: 'Failed to simulate payment success' });
    }
  });

  // Admin function to reset payment status
  app.post('/api/admin/reset-payment-status', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const BASE_URL = process.env.SUPABASE_URL;
      const API_KEY = process.env.SUPABASE_ANON_KEY;
      const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
      
      if (!BASE_URL || !API_KEY || !STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: 'Configuration missing' });
      }

      logger.admin('Syncing payment status with Stripe...');
      
      // Get all bookings with Stripe session IDs
      const bookingsResponse = await fetch(`${BASE_URL}/rest/v1/bookings?stripe_session_id=not.is.null&select=*`, {
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!bookingsResponse.ok) {
        return res.status(500).json({ error: 'Failed to fetch bookings' });
      }

      const bookings = await bookingsResponse.json();
      let updatedCount = 0;

      // Check each booking's payment status with Stripe
      for (const booking of bookings) {
        if (!booking.stripe_session_id) continue;

        try {
          // Check Stripe session status
          const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${booking.stripe_session_id}`, {
            headers: {
              'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });

          if (stripeResponse.ok) {
            const stripeSession = await stripeResponse.json();
            let newPaymentStatus = booking.payment_status;
            let newStatus = booking.status;

            // Map Stripe payment status to our system
            switch (stripeSession.payment_status) {
              case 'paid':
                newPaymentStatus = PaymentStatusEnum.SESSION_PAID;
                newStatus = BookingStatusEnum.CONFIRMED;
                break;
              case 'unpaid':
                newPaymentStatus = PaymentStatusEnum.RESERVATION_PAID;
                newStatus = BookingStatusEnum.PENDING;
                break;
              case 'no_payment_required':
                newPaymentStatus = PaymentStatusEnum.SESSION_PAID;
                newStatus = BookingStatusEnum.CONFIRMED;
                break;
              default:
                newPaymentStatus = PaymentStatusEnum.RESERVATION_PAID;
                newStatus = BookingStatusEnum.PENDING;
            }

            // Update booking if status changed
            if (newPaymentStatus !== booking.payment_status || newStatus !== booking.status) {
              const updateResponse = await fetch(`${BASE_URL}/rest/v1/bookings?id=eq.${booking.id}`, {
                method: 'PATCH',
                headers: {
                  'apikey': API_KEY,
                  'Authorization': `Bearer ${API_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  payment_status: newPaymentStatus,
                  status: newStatus
                })
              });

              if (updateResponse.ok) {
                updatedCount++;
                logger.admin(`Updated booking ${booking.id}: ${booking.payment_status} → ${newPaymentStatus}`);
              }
            }
          }
        } catch (stripeError) {
          console.warn(`Failed to check Stripe session ${booking.stripe_session_id}:`, stripeError);
        }
      }

      logger.admin(`✅ Synced ${updatedCount} bookings with Stripe`);
      res.json({ 
        success: true, 
        updated: updatedCount, 
        total: bookings.length,
        message: `Synced ${updatedCount} of ${bookings.length} bookings with Stripe webhook data` 
      });
    } catch (error) {
      console.error('Error syncing payment status:', error);
      res.status(500).json({ error: 'Failed to sync payment status with Stripe' });
    }
  });

  // Admin function for system health check
  app.post('/api/admin/health-check', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const BASE_URL = process.env.SUPABASE_URL;
      const API_KEY = process.env.SUPABASE_ANON_KEY;
      
      if (!BASE_URL || !API_KEY) {
        return res.status(500).json({ error: 'Supabase configuration missing' });
      }

      logger.admin('Running system health check...');
      
      const checks = [];
      let passed = 0;

      // Test database connectivity
      try {
        const dbResponse = await fetch(`${BASE_URL}/rest/v1/bookings?select=count`, {
          headers: {
            'apikey': API_KEY,
            'Authorization': `Bearer ${API_KEY}`
          }
        });
        checks.push({ test: 'Database Connection', passed: dbResponse.ok });
        if (dbResponse.ok) passed++;
      } catch {
        checks.push({ test: 'Database Connection', passed: false });
      }

      // Test Stripe integration
      try {
        const stripeResponse = await fetch('http://localhost:5001/api/stripe/products');
        const stripeData = await stripeResponse.json();
        checks.push({ test: 'Stripe Integration', passed: stripeResponse.ok && stripeData.data });
        if (stripeResponse.ok && stripeData.data) passed++;
      } catch {
        checks.push({ test: 'Stripe Integration', passed: false });
      }

      // Test email service
      checks.push({ test: 'Email Service (Resend)', passed: !!process.env.RESEND_API_KEY });
      if (process.env.RESEND_API_KEY) passed++;

      // Test content APIs
      try {
        const contentResponse = await fetch('http://localhost:5001/api/site-content');
        checks.push({ test: 'Content API', passed: contentResponse.ok });
        if (contentResponse.ok) passed++;
      } catch {
        checks.push({ test: 'Content API', passed: false });
      }

      logger.admin(`✅ Health check completed: ${passed}/${checks.length} tests passed`);
      res.json({ 
        success: true, 
        passed, 
        total: checks.length, 
        checks,
        message: `System health check completed: ${passed}/${checks.length} tests passed`
      });
    } catch (error) {
      console.error('Error running health check:', error);
      res.status(500).json({ error: 'Failed to run health check' });
    }
  });

  // Admin function to delete user accounts
  app.post('/api/admin/delete-user-accounts', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const BASE_URL = process.env.SUPABASE_URL;
      const API_KEY = process.env.SUPABASE_ANON_KEY;
      
      if (!BASE_URL || !API_KEY) {
        return res.status(500).json({ error: 'Supabase configuration missing' });
      }

      logger.admin('Deleting user accounts created during booking...');
      
      // Delete users with role 'user' (not admins)
      const usersResponse = await fetch(`${BASE_URL}/rest/v1/users?role=eq.user&id=neq.0`, {
        method: 'DELETE',
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });

      let usersDeleted = 0;
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        usersDeleted = Array.isArray(usersData) ? usersData.length : 0;
      }

      logger.admin(`✅ Deleted ${usersDeleted} user accounts`);
      res.json({ 
        success: true, 
        deleted: usersDeleted, 
        message: `Deleted ${usersDeleted} user accounts created during booking`
      });
    } catch (error) {
      console.error('Error deleting user accounts:', error);
      res.status(500).json({ error: 'Failed to delete user accounts' });
    }
  });

  // Admin function for database test
  app.post('/api/admin/database-test', isAdminAuthenticated, async (req: Request, res: Response) => {
    try {
      const BASE_URL = process.env.SUPABASE_URL;
      const API_KEY = process.env.SUPABASE_ANON_KEY;
      
      if (!BASE_URL || !API_KEY) {
        return res.status(500).json({ error: 'Supabase configuration missing' });
      }

      logger.admin('Testing database connection...');
      
      // Test multiple table access
      const tests = [
        { table: 'users', description: 'Users Table' },
        { table: 'bookings', description: 'Bookings Table' },
        { table: 'athletes', description: 'Athletes Table' },
        { table: 'parents', description: 'Parents Table' },
        { table: 'blog_posts', description: 'Blog Posts Table' },
        { table: 'tips', description: 'Tips Table' }
      ];

      const results = [];
      for (const test of tests) {
        try {
          const response = await fetch(`${BASE_URL}/rest/v1/${test.table}?select=count`, {
            headers: {
              'apikey': API_KEY,
              'Authorization': `Bearer ${API_KEY}`
            }
          });
          results.push({
            table: test.table,
            description: test.description,
            success: response.ok,
            status: response.status
          });
        } catch (error) {
          results.push({
            table: test.table,
            description: test.description,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      logger.admin(`✅ Database test completed: ${successCount}/${results.length} tables accessible`);
      
      res.json({ 
        success: true, 
        results,
        summary: `${successCount}/${results.length} tables accessible`,
        message: 'Database connectivity test completed successfully'
      });
    } catch (error) {
      console.error('Error testing database:', error);
      res.status(500).json({ error: 'Failed to test database connection' });
    }
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT from environment variable, default to 5001
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || '5001', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();