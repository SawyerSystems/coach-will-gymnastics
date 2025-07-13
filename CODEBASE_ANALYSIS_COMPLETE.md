# COMPLETE CODEBASE ANALYSIS - CoachWillTumbles.com

## 1. 🌐 SITE MAP

### Public Pages:
- **Home** (`/`) - Landing page with hero, skills showcase, lesson types
- **About** (`/about`) - Coach qualifications and philosophy  
- **Booking** (`/booking`) - Session booking interface
- **Blog** (`/blog`) - "Adventure Stories" content
- **Tips** (`/tips`) - "Training Adventures" tutorials
- **Contact** (`/contact`) - Contact info and FAQ
- **Blog Post** (`/blog/:id`) - Individual blog article view
- **Tip Detail** (`/tips/:id`) - Individual tip view

### Auth Pages:
- **Admin Login** (`/admin/login`) - Admin authentication
- **Parent Login** (`/parent/login`) - Parent portal authentication
- **Parent Dashboard** (`/parent/dashboard`) - Parent account management

### Admin Pages:
- **Admin Dashboard** (`/admin`) - Comprehensive admin panel

### Transaction Pages:
- **Checkout** (`/checkout`) - Stripe payment redirect
- **Booking Success** (`/booking-success`) - Post-payment confirmation

## 2. 🧩 COMPONENTS

### Core Booking Components:

**EnhancedBookingModal** (`client/src/components/enhanced-booking-modal.tsx`)
- Props: `isOpen`, `onClose`, `customerData`, `selectedAthletes`, `isNewCustomer`
- Determines flow type: 'new-user', 'athlete-modal', or 'parent-portal'
- Wraps BookingWizard with BookingFlowProvider
- Initial state includes parentId and pre-filled parent info

**BookingWizard** (`client/src/components/BookingWizard.tsx`)
- Manages step navigation using BookingFlowContext
- Renders different step components based on current flow
- Steps include: LessonTypeStep, AthleteSelectStep, FocusAreasStep, ScheduleStep, etc.

**CustomerIdentificationEnhanced** (`client/src/components/customer-identification-enhanced.tsx`)
- Handles parent identification before booking
- Shows BookingLoginModal for authentication
- Launches EnhancedBookingModal after successful login

### Parent Dashboard Components:

**ParentDashboard** (`client/src/pages/parent-dashboard.tsx`)
- State: Manages multiple modals (cancel, edit, reschedule, add athlete, waiver)
- Data fetching:
  - Auth status: `useQuery(['/api/parent-auth/status'])`
  - Bookings: `useQuery(['/api/parent/bookings'])`
  - Parent info: `useQuery(['/api/parent/info'])`
  - Athletes: `useQuery(['/api/parent/athletes'])`
- Mutations for canceling bookings, updating athletes, rescheduling

### Admin Dashboard Components:

**AdminDashboard** (`client/src/pages/admin.tsx`)
- 8 main tabs: Bookings, Upcoming Sessions, Athletes, Content, Schedule, Parent Communication, Payments, Analytics
- Protected by `isAdminAuthenticated` check
- Each tab has dedicated management components

## 3. 🔗 API ROUTES

### Authentication Routes:

**Admin Auth** (`/api/auth/*`)
- `POST /api/auth/login` - Admin login with email/password
- `GET /api/auth/status` - Check admin session
- `POST /api/auth/logout` - Clear admin session

**Parent Auth** (`/api/parent-auth/*`)
- `POST /api/parent-auth/send-code` - Send 6-digit code via email
- `POST /api/parent-auth/verify-code` - Verify code and create session
- `GET /api/parent-auth/status` - Check parent session
- `POST /api/parent-auth/logout` - Clear parent session

### Booking Routes:

- `GET /api/bookings` - Get all bookings (admin only)
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id` - Update booking details
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `PATCH /api/bookings/:id/reschedule` - Reschedule booking
- `GET /api/booking-by-session/:sessionId` - Get booking by Stripe session

### Parent Routes:

- `GET /api/parent/bookings` - Get parent's bookings
- `GET /api/parent/info` - Get parent profile (aggregated from bookings)
- `GET /api/parent/athletes` - Get parent's athletes
- `PATCH /api/parent/update-profile` - Update parent info
- `PATCH /api/parent/update-emergency-contact` - Update emergency contacts

### Athlete Routes:

- `GET /api/athletes` - Get all athletes (admin only)
- `POST /api/athletes` - Create new athlete
- `PATCH /api/athletes/:id` - Update athlete (including gender field)
- `DELETE /api/athletes/:id` - Delete athlete (checks for active bookings)

### Content Routes:

- `GET /api/blog-posts` - Get all blog posts
- `GET /api/blog-posts/:id` - Get single blog post
- `POST /api/blog-posts` - Create blog post (admin only)
- `PUT /api/blog-posts/:id` - Update blog post (admin only)
- `DELETE /api/blog-posts/:id` - Delete blog post (admin only)
- Same pattern for `/api/tips/*`

### Availability Routes:

- `GET /api/availability` - Get weekly availability
- `POST /api/availability` - Set availability (admin only)
- `GET /api/availability/exceptions` - Get blocked dates
- `POST /api/availability/exceptions` - Block dates (admin only)

### Payment Routes:

- `GET /api/stripe/products` - Get Stripe products with prices
- `POST /api/create-checkout-session` - Create Stripe checkout
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `POST /api/stripe/sync-payments` - Manual payment sync (admin only)

### Waiver Routes:

- `GET /api/waivers` - Get all waivers (admin only)
- `POST /api/waivers/submit` - Submit waiver for athlete
- `GET /api/waiver/:athleteId` - Check waiver status
- `GET /api/waivers/archived` - Get archived waivers
- `POST /api/waivers/archived` - Create archived waiver
- `DELETE /api/waivers/archived/:id` - Delete archived waiver

## 4. 🔄 DATABASE INTEGRATION

### Key Tables (from `shared/schema.ts`):

**parents** (formerly customers)
- id, firstName, lastName, email, phone
- emergencyContactName, emergencyContactPhone
- waiverSigned, waiverSignedAt, waiverSignatureName
- createdAt, updatedAt

**athletes**
- id, parentId (FK to parents)
- name, firstName, lastName, dateOfBirth
- gender (recently added field)
- allergies, experience, photo
- createdAt, updatedAt

**bookings**
- id, lessonType, athleteIds[], preferredDate, preferredTime
- parentName, parentEmail, parentPhone
- focusAreas[], specialRequests, adminNotes
- status, paymentStatus, attendanceStatus
- paidAmount, stripeSessionId
- dropoff/pickup person details
- safetyVerificationSigned

**blog_posts**
- id, title, content, excerpt
- category, imageUrl, publishedAt

**tips**
- id, title, content, sections (JSON)
- category, difficulty, videoUrl, publishedAt

**availability**
- id, dayOfWeek, startTime, endTime
- isRecurring, isAvailable

**availability_exceptions**
- id, date, startTime, endTime
- isAvailable, reason

**parent_auth_codes**
- id, email, code, expiresAt
- used, createdAt

**archived_waivers**
- All waiver fields plus archiveReason, legalRetentionPeriod

### Database Flow Examples:

**Booking Creation Flow:**
1. Parent selects lesson type and athlete(s)
2. Frontend posts to `/api/bookings` with full booking data
3. Server validates with Zod schema
4. Creates booking record with status='pending', paymentStatus='pending'
5. Returns booking with ID for Stripe session creation
6. Updates booking with stripeSessionId

**Athlete Profile Updates:**
1. Parent/Admin calls `PATCH /api/athletes/:id`
2. Server validates update fields
3. Updates athlete record including new gender field
4. Returns updated athlete data

## 5. 🔐 AUTH & SESSIONS

### Admin Authentication:
- Email/password based authentication
- Password hashed with bcrypt
- Session stored in Express sessions (memory store)
- Session includes: `adminId`, `adminEmail`
- Protected routes use `isAdminAuthenticated` middleware

### Parent Authentication:
- Email-based magic link system
- 6-digit code sent via Resend email service
- Code expires in 10 minutes
- Session created on successful verification
- Session includes: `parentId`, `parentEmail`
- Protected routes check `req.session.parentId`

### Session Storage:
- Currently uses Express MemoryStore (development)
- Production should use `user_sessions` table in database
- Sessions expire based on Express session config

## 6. 🪝 WEBHOOKS & BACKEND HOOKS

### Stripe Webhook Handler (`/api/stripe/webhook`):

**Events Handled:**
- `checkout.session.completed`: Updates booking payment status
- `payment_intent.succeeded`: Logs successful payment
- `payment_intent.payment_failed`: Logs failed payment

**Webhook Flow:**
1. Stripe sends event to webhook endpoint
2. Server verifies signature with webhook secret
3. Extracts booking ID from metadata
4. Updates booking:
   - paymentStatus: 'reservation-paid'
   - attendanceStatus: 'confirmed'
   - paidAmount: actual Stripe amount
5. Sends confirmation email if first-time payment

### Email Triggers:
- Booking creation → Confirmation email
- Payment success → Payment confirmation
- Waiver submission → Thank you email
- Admin manual booking → Three emails (payment link, waiver, safety)
- Session reminder → 24 hours before (scheduled job needed)

## 7. 📦 BUCKETS / STORAGE

### Media Storage:
- Athlete photos stored as base64 in database (photo field)
- No Supabase bucket integration currently active
- Static assets served from `/attached_assets/` directory
- Logo files: `CWT_Circle_LogoSPIN.png`, `CoachWillTumblesText.png`

### File-Based Storage (Development):
- Availability data persisted in `data/availability.json`
- Exception dates in `data/exceptions.json`
- Uses PersistentMemStorage class for development

## 8. 📊 ADMIN PANEL

### Admin Dashboard Tabs:

**Bookings Tab:**
- Component: `AdminBookingManager`
- Features: View all bookings, filter by status, quick actions
- Can update: status, payment status, attendance status
- Quick reschedule functionality

**Upcoming Sessions Tab:**
- Shows next 7 days of confirmed bookings
- Quick attendance marking
- Session details display

**Athletes Tab:**
- Full CRUD for athlete profiles
- Birthday tracking with 30-day lookahead
- Consolidates athlete data across bookings
- Photo upload capability

**Content Tab:**
- Blog post management (create, edit, delete)
- Tips management with multi-section support
- Rich text editing

**Schedule Tab:**
- Weekly availability hours setting
- Exception date management
- Visual calendar interface

**Parent Communication Tab:**
- UI-only currently (no backend)
- Shows message thread mockups

**Payments Tab:**
- Stripe integration dashboard
- Revenue tracking
- Payment history
- Manual sync functionality

**Analytics Tab:**
- Booking trends visualization
- Focus area popularity
- Conversion metrics

## 9. 🧠 LOGIC GAPS & REDUNDANCIES

### Unused Tables/Fields:
- `users` table - removed but references remain in storage interfaces
- `booking_logs` table defined but not actively used
- `payment_logs` minimal usage

### Duplicated Logic:
- Parent/Customer terminology mixed throughout (migration incomplete)
- Time slot generation logic in multiple places
- Email sending split between inline and email service

### Missing Connections:
- Session reminders defined but no cron job implemented
- Birthday emails template exists but no automated sending
- Parent communication UI with no backend implementation

### Hardcoded Values:
- Lesson types and prices partially hardcoded in constants
- Gym location info hardcoded in multiple places
- Some email templates have hardcoded URLs

## 10. 🔧 INFRASTRUCTURE

### Required Environment Variables:
```
DATABASE_URL - PostgreSQL connection string
SUPABASE_URL - Supabase project URL
SUPABASE_ANON_KEY - Supabase anonymous key
STRIPE_SECRET_KEY - Stripe API key
STRIPE_WEBHOOK_SECRET - Stripe webhook signing secret
RESEND_API_KEY - Email service API key
ADMIN_EMAIL - Default admin email
ADMIN_PASSWORD - Default admin password
NODE_ENV - development/production
```

### Build & Deployment:
- Frontend: Vite builds to `dist/public`
- Backend: esbuild compiles to `dist/index.js`
- Single Express server serves both in production
- Replit handles deployment automatically

### Security Middleware:
- CORS configured for Replit domains
- Session middleware with secure cookies in production
- Request logging for debugging
- No rate limiting currently implemented

## 11. 👨‍👩‍👧 PARENT PORTAL (FULL BREAKDOWN)

### URL & Access:
- Route: `/parent/dashboard`
- Auth required via `/parent/login`
- Session-based access control

### Data Fetched on Load:
1. Auth status check
2. Parent's bookings (filtered by email)
3. Parent info (aggregated from bookings)
4. Parent's athletes

### Parent Capabilities:

**Can Do:**
- View all their bookings (upcoming/past)
- Cancel bookings
- Reschedule bookings (with available slots)
- Add new athletes
- Edit athlete info (name, DOB, allergies, experience)
- Update their profile info
- Update emergency contacts
- Submit waivers for athletes
- Book new sessions

**Cannot Do:**
- Delete athletes (admin only)
- View other parents' data
- Access payment details
- Modify booking prices

### Data Storage:
- All changes saved to respective tables
- Booking updates create new records
- Profile updates modify parent record
- Athlete updates modify athlete records

## 12. 📅 BOOKING PROCESS (FULL STEP-BY-STEP FLOW)

### 1. **Initiation:**
- User clicks "Book a Session" from Home or Booking page
- Triggers `CustomerIdentificationEnhanced` component
- Shows `BookingLoginModal` for parent identification

### 2. **Parent Identification:**
- New parents enter email → receive code → verify
- Returning parents enter email → receive code → verify
- Creates/retrieves parent session

### 3. **Booking Flow Launch:**
- `EnhancedBookingModal` opens with flow type determination
- Flow types: 'new-user', 'athlete-modal', 'parent-portal'
- `BookingFlowProvider` manages state

### 4. **Step 1 - Lesson Type:**
- Component: `LessonTypeStep`
- Lesson types fetched from LESSON_TYPES constant
- Options: 30min ($40), 45min ($50), 60min ($60), Semi-private ($80)
- Selection stored in context

### 5. **Step 2 - Athlete Selection:**
- Component: `AthleteSelectStep` or `AthleteInfoFormStep`
- Existing parents see their athletes
- New parents create athlete profile
- Semi-private allows 2-3 athletes

### 6. **Step 3 - Focus Areas:**
- Component: `FocusAreasStep`
- Skills grouped by apparatus (Tumbling, Beam, Bars, etc.)
- Multiple selection allowed
- Includes "Side Quests" options

### 7. **Step 4 - Schedule:**
- Component: `ScheduleStep`
- Available times from `/api/availability/slots`
- Filters out booked slots
- Date picker + time slot selection

### 8. **Step 5 - Parent Info:**
- Component: `ParentInfoStep`
- Pre-filled for returning parents
- Confirmation required
- Emergency contact verification

### 9. **Step 6 - Safety:**
- Component: `SafetyStep`
- Dropoff/pickup person details
- Alternative pickup authorization
- Relationship verification

### 10. **Step 7 - Waiver:**
- Component: `WaiverStep`
- Digital signature capture
- Terms acceptance checkboxes
- Stores signature data

### 11. **Step 8 - Payment:**
- Component: `PaymentStep`
- Creates Stripe checkout session
- Passes booking ID in metadata
- Redirects to Stripe

### 12. **Post-Payment:**
- Stripe redirects to `/booking-success`
- Webhook updates booking status
- Confirmation email sent
- Booking appears in dashboards

## 13. 📬 RESEND EMAIL SYSTEM (FULL MAPPING)

### Email Templates (in `emails/` directory):

1. **ParentAuthorization.tsx**
   - Trigger: Parent login attempt
   - Data: parentName, authCode
   - Sent via: `/api/parent-auth/send-code`

2. **SessionConfirmation.tsx**
   - Trigger: Booking creation/payment success
   - Data: parentName, athleteName, sessionDate, sessionTime
   - Sent via: Stripe webhook handler

3. **ManualBookingConfirmation.tsx**
   - Trigger: Admin creates booking
   - Data: parentName, confirmLink
   - Sent via: Admin booking creation

4. **WaiverReminder.tsx**
   - Trigger: Booking without waiver
   - Data: parentName, waiverLink
   - Sent via: Admin action or automated check

5. **SessionReminder.tsx**
   - Trigger: 24 hours before session (NOT IMPLEMENTED)
   - Data: athleteName, sessionDate, sessionTime
   - Needs: Cron job implementation

6. **SessionCancellation.tsx**
   - Trigger: Booking cancelled
   - Data: parentName, rescheduleLink
   - Sent via: Cancel booking endpoint

7. **RescheduleConfirmation.tsx**
   - Trigger: Booking rescheduled
   - Data: newSessionDate, newSessionTime
   - Sent via: Reschedule endpoint

8. **SessionFollowUp.tsx**
   - Trigger: After session completion (MANUAL)
   - Data: athleteName, bookingLink
   - Sent via: Admin action

9. **BirthdayEmail.tsx**
   - Trigger: Athlete birthday (NOT AUTOMATED)
   - Data: athleteName
   - Needs: Cron job implementation

10. **NewTipOrBlog.tsx**
    - Trigger: New content published
    - Data: blogTitle, blogLink
    - Sent via: Content creation endpoints

11. **ReservationPaymentLink.tsx**
    - Trigger: New athlete booking
    - Data: parentName, athleteNames, paymentLink
    - Sent via: `/api/bookings/:id/send-new-athlete-emails`

12. **WaiverCompletionLink.tsx**
    - Trigger: New athlete booking
    - Data: parentName, athleteNames, waiverLink
    - Sent via: Same endpoint as above

13. **SafetyInformationLink.tsx**
    - Trigger: New athlete booking
    - Data: parentName, athleteNames, loginLink
    - Sent via: Same endpoint as above

### Email Service Configuration:
- Service: Resend
- From: coach@coachwilltumbles.com
- Templates rendered with @react-email/render
- Fallback to console logging in development
- No queue system - direct sending
- No retry mechanism implemented

---

## RECOMMENDATIONS FOR DATABASE REBUILD:

1. **Normalize Lesson Types:** Create `lesson_types` table instead of hardcoded constants
2. **Normalize Focus Areas:** Create `focus_areas` and `apparatus` tables
3. **Add Gym Fees Table:** Track variable gym fees per location/date
4. **Implement Audit Logs:** Use booking_logs table for all changes
5. **Complete Parent Migration:** Remove all customer references
6. **Add Email Queue:** Table for email scheduling and retry logic
7. **Session Storage:** Move from memory to database table
8. **Implement Cron Jobs:** For reminders and birthday emails
9. **Add Rate Limiting:** Protect API endpoints from abuse
10. **Cache Strategy:** Add Redis or similar for performance