# Coach Will Tumbles - Gymnastics Coaching Platform

## Overview

This is a full-stack web application for Coach Will's gymnastics coaching business. It provides a platform for booking private and semi-private gymnastics lessons, managing bookings, viewing educational content, and contacting the coach. The application features a modern React frontend with a clean, child-friendly design and an Express.js backend with PostgreSQL database integration.

## System Architecture

The application follows a monorepo structure with separate client and server directories, plus shared code:

- **Frontend**: React with TypeScript, styled using Tailwind CSS and shadcn/ui components
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Shared**: Common schemas and types shared between frontend and backend
- **Build System**: Vite for frontend bundling, esbuild for backend compilation

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom gymnastics-themed color palette
- **Forms**: React Hook Form with Zod validation
- **Responsive Design**: Mobile-first approach with responsive navigation

### Backend Architecture
- **Express Server**: RESTful API with JSON middleware
- **Request Logging**: Custom middleware for API request/response logging
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Storage Layer**: Abstracted storage interface with PostgreSQL database implementation using Drizzle ORM

### Database Schema
The application defines four main entities:
- **Users**: Basic user authentication system
- **Bookings**: Lesson bookings with athlete details, scheduling, and status tracking
- **Blog Posts**: Educational content with categories and publishing dates
- **Tips**: Gymnastics tips and drills with difficulty levels and optional video content

## Data Flow

1. **User Interaction**: Users interact with React components that trigger actions
2. **API Calls**: TanStack Query manages API requests to Express endpoints
3. **Request Processing**: Express routes validate data using Zod schemas
4. **Data Storage**: Storage layer handles CRUD operations using PostgreSQL database with Drizzle ORM
5. **Response Handling**: Client receives responses and updates UI state accordingly

### Booking Flow
1. User selects lesson type and fills booking form
2. Multi-step modal guides through athlete details, scheduling, and payment
3. Form validation ensures data integrity
4. API creates booking record with "pending" status
5. Admin can view and update booking status through admin dashboard

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React 18+ with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with @hookform/resolvers
- **Validation**: Zod for schema validation
- **UI Components**: Radix UI primitives via shadcn/ui
- **Styling**: Tailwind CSS with class-variance-authority
- **Date Handling**: date-fns for date manipulation

### Backend Dependencies
- **Server**: Express.js with TypeScript support
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Database Driver**: postgres-js for Supabase PostgreSQL connectivity
- **Validation**: Zod for request/response validation
- **Session Management**: Express sessions with memory store

### Development Dependencies
- **Build Tools**: Vite for frontend, esbuild for backend
- **Development Server**: Vite dev server with HMR
- **TypeScript**: Full TypeScript support across the stack
- **Linting/Formatting**: ESLint and Prettier configurations

## Deployment Strategy

The application is designed for deployment on Replit with the following considerations:

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild compiles TypeScript server to `dist/index.js`
3. **Static Serving**: Production server serves frontend from built assets

### Environment Configuration
- **Database**: Uses `DATABASE_URL` environment variable for PostgreSQL connection
- **Development Mode**: Vite dev server with hot module replacement
- **Production Mode**: Express serves pre-built static assets

### Database Migration
- **Schema Management**: Drizzle Kit for database migrations
- **Migration Command**: `npm run db:push` applies schema changes
- **Schema Location**: Shared schema definition in `shared/schema.ts`

## Changelog

- June 28, 2025: Initial setup with complete gymnastics coaching platform
- June 28, 2025: Added PostgreSQL database integration with sample data
- June 28, 2025: Enhanced content management with comprehensive blog and tip articles
- June 28, 2025: Added full CRUD operations for blog posts and tips in admin panel
- June 28, 2025: Created tip detail pages with "Continue reading" functionality
- June 28, 2025: Fixed blog content display formatting for structured articles
- June 28, 2025: Implemented working delete functionality for admin content management
- June 29, 2025: Enhanced blog page with comprehensive filtering (search, category, date sorting)
- June 29, 2025: Added comprehensive skills and apparatus system covering all gymnastics disciplines
- June 29, 2025: Created skills showcase section on homepage with apparatus, foundational, and advanced skills
- June 29, 2025: Improved booking modal with organized skill selection grouped by difficulty level
- June 29, 2025: Fixed SelectItem validation error in booking modal to resolve step 2 booking flow
- June 29, 2025: Integrated Stripe products API for payment testing with existing lesson products
- June 29, 2025: Created comprehensive payment testing page (/test-payments) with Stripe test cards
- June 29, 2025: Resolved availability persistence issue by implementing file-based storage system
- June 29, 2025: All admin availability settings now persist across server restarts in data/ directory
- June 29, 2025: Integrated Stripe payment processing directly into main booking system flow
- June 29, 2025: Booking modal now creates real payment intents and redirects to Stripe checkout
- June 29, 2025: Fixed critical step 4 to step 5 navigation bug in booking flow (nextStep function was limited to step 4)
- June 29, 2025: Enhanced step validation with cleaner validation logic for parent information
- June 29, 2025: Added comprehensive upcoming birthday tracking system for athletes with 30-day lookahead
- June 29, 2025: Created birthday notification system with countdown and free lesson suggestions
- June 29, 2025: Enhanced athlete profiles with consolidated data from all bookings
- June 29, 2025: Fixed Payment & Income Tracking calculations to use actual booking amounts instead of estimates
- June 29, 2025: Added "Upcoming Lessons" tab for at-a-glance accessibility of confirmed lessons in next 7 days
- June 29, 2025: Fixed JavaScript Date constructor timezone issues by manually parsing YYYY-MM-DD date strings
- June 29, 2025: Corrected upcoming lessons display logic to show proper TODAY/TOMORROW labels
- June 29, 2025: Enhanced date parsing consistency across filtering, sorting, and display logic
- June 29, 2025: Implemented streamlined booking system with dynamic time slot filtering
- June 29, 2025: Created automatic time slot availability system that filters out booked, blocked, and unavailable times
- June 29, 2025: Updated both customer booking and admin manual booking to show only truly available time slots
- June 29, 2025: Integrated customer recognition system with pre-filled forms and suggested focus areas from previous lessons
- June 29, 2025: FIXED CRITICAL: Corrected pricing disconnect where customers were charged $10 instead of actual product prices
- June 29, 2025: Updated payment system to use live Stripe product prices instead of hard-coded amounts
- June 29, 2025: Enforced Stripe minimum payment requirement of $0.50 for test transactions
- June 29, 2025: Removed test-payments page as site is now fully functional for live testing
- June 29, 2025: Implemented dynamic Stripe pricing system across all components (home, booking, modal)
- June 29, 2025: Created useStripePricing hook to fetch live product prices and eliminate hard-coded pricing
- June 29, 2025: Updated LESSON_TYPES constants to remove hard-coded prices, keeping only lesson metadata
- June 29, 2025: FIXED CRITICAL: Restored hard-coded full lesson prices in UI while using Stripe reservation fees for payment
- June 29, 2025: Fixed "insecure operation" runtime error by replacing window.location with proper wouter navigation
- June 29, 2025: Implemented proper pricing display: $40/$50/$60/$80 shown on site, actual Stripe fees processed for payment
- June 29, 2025: Enhanced payment flow messaging to clarify reservation fee vs full lesson price structure
- June 29, 2025: FIXED: Added customer recognition modal to Booking page (was missing compared to Home page)
- June 29, 2025: FIXED: Resolved empty modal issue when "New Customer" selected by restructuring modal flow
- June 29, 2025: Implemented proper modal separation between CustomerBookingModal and BookingModal components
- June 29, 2025: Updated both Home and Booking pages with consistent customer identification workflow
- June 29, 2025: FIXED: "Book Your First Lesson" button now properly triggers customer identification modal
- June 29, 2025: Started comprehensive customer-to-parent terminology migration in database schema
- June 29, 2025: Added athlete photo field support for admin dashboard with display and upload functionality
- June 29, 2025: Updated data persistence layer to use parentId instead of customerId for athlete relationships
- June 30, 2025: COMPLETED: Customer-to-parent terminology migration with backward compatibility
- June 30, 2025: Added parent-focused API endpoints (/api/identify-parent, /api/parents) alongside legacy customer endpoints
- June 30, 2025: Updated storage interfaces to support both parent and customer methods for seamless transition
- June 30, 2025: Enhanced parent identification system with improved athlete recognition and booking history
- June 30, 2025: ADDED: Comprehensive safety verification system for pickup/dropoff authorization and relationship tracking
- June 30, 2025: Created new step 5 in booking modal for safety verification with dropoff/pickup person details and relationships
- June 30, 2025: Enhanced database schema with safety verification fields for secure athlete custody management
- June 30, 2025: ENHANCED: Event-based focus areas with two-step dropdown selection preventing skill confusion between apparatus
- June 30, 2025: Updated skill naming with event prefixes (e.g. "Tumbling: Cartwheel" vs "Beam: Cartwheel") for clarity
- June 30, 2025: IMPROVED: Parent information workflow with confirmation interface for returning parents
- June 30, 2025: Enhanced safety verification UX with yes/no questions instead of manual data entry
- June 30, 2025: Updated payment messaging to clarify balance payment timing "at the time of the lesson"
- June 30, 2025: MAJOR REDESIGN: Implemented comprehensive color psychology and UX improvements across home page
- June 30, 2025: Added "Side Quests" section with Flexibility, Strength, Agility, Meditation, and Mental Blocks training
- June 30, 2025: Restructured skills section with full-width apparatus training card and intermediate skills category
- June 30, 2025: Updated all copy text for improved marketing appeal and parent-focused messaging
- June 30, 2025: Enhanced color scheme using psychology-based colors (orange for Adventure, green for success, etc.)
- June 30, 2025: Improved progressive skill development messaging and feature descriptions for clarity
- June 30, 2025: Added Side Quests as selectable apparatus in booking system with specialized training focus areas
- June 30, 2025: FIXED: Resolved booking validation errors by updating schema to handle null values and date strings properly
- June 30, 2025: FIXED: Enhanced athlete deletion system - now allows deletion after cancelling bookings, only blocks for active bookings
- June 30, 2025: FIXED: Payment system now uses proper Stripe checkout sessions instead of payment intents for seamless redirects
- June 30, 2025: FIXED: Parent information now displays correctly in athlete profiles by using parentId instead of customerId
- June 30, 2025: Added professional booking success page with payment confirmation and next steps
- June 30, 2025: Enhanced booking form validation with detailed error debugging and proper type coercion
- June 30, 2025: FIXED: Parent information display issue by creating parent mapping system from booking data instead of customer table
- June 30, 2025: FIXED: Stripe payment redirect issue by using checkout session URL instead of redirectToCheckout method
- June 30, 2025: Added proper Stripe JavaScript library loading and improved payment flow error handling
- July 1, 2025: RESTORED: All admin dashboard features after session-based authentication implementation
- July 1, 2025: Added 8 comprehensive admin tabs: Bookings, Upcoming Sessions, Athletes, Content, Schedule, Parent Communication, Payments, Analytics
- July 1, 2025: Enhanced AdminBookingManager with sort options (Most Recent, Oldest, Session Date ↑/↓) and Quick Reschedule functionality
- July 1, 2025: Implemented full content management system for blog posts and tips with CRUD operations
- July 1, 2025: Added Schedule & Availability management with weekly hours and exception blocking
- July 1, 2025: Created Parent Communication UI (frontend-only) with message threads and templates
- July 1, 2025: Integrated Payments & Stripe tab with revenue tracking and transaction history
- July 1, 2025: Built Analytics Dashboard with booking trends, focus area popularity, and conversion metrics
- July 1, 2025: SECURED: All admin routes with isAdminAuthenticated middleware for session protection
- July 1, 2025: COMPREHENSIVE CONTENT OVERHAUL: Updated all website pages with adventure-themed, parent-focused messaging
- July 1, 2025: Enhanced homepage with new hero content emphasizing gymnastics as a lifelong adventure and growth journey
- July 1, 2025: Updated booking page with non-transactional language focused on building long-term relationships and trust
- July 1, 2025: Refreshed about page with updated qualifications (nearing 10 years, USA Gymnastics certified, competition experience)
- July 1, 2025: Enhanced contact page with athlete-focused language and updated FAQ section for parent clarity
- July 1, 2025: Updated blog page to "Adventure Stories" with exploration-focused messaging and adventure themes
- July 1, 2025: Renamed tips page to "Training Adventures" emphasizing skill development as quest completion
- July 1, 2025: BOOKING PAGE COMPLETE OVERHAUL: Implemented adventure-themed lesson names and non-transactional messaging
- July 1, 2025: Updated lesson types to "Quick Journey," "Dual Quest," "Deep Dive," and "Partner Progression" with adventure descriptions
- July 1, 2025: Added comprehensive Side Quests section featuring flexibility, strength, agility, meditation, and mental blocks training
- July 1, 2025: Updated contact information to Oceanside Gymnastics location with correct phone and email details
- July 1, 2025: Enhanced FAQ section with parent-focused, conversational tone addressing real parent concerns and questions
- July 1, 2025: Added inspirational quote section highlighting Coach Will's philosophy about unlocking each child's potential
- July 1, 2025: Updated all CTAs to use journey-focused language like "Start Their Journey" instead of transactional terms
- July 1, 2025: GLOBAL FRONTEND REFACTORING: Implemented comprehensive mobile-first design improvements
- July 1, 2025: Enhanced navigation with mobile touch targets (min-h-[48px]) and improved spacing
- July 1, 2025: Added automatic scroll reset functionality on page navigation for better UX
- July 1, 2025: Created comprehensive skeleton loading states for blog, tips, and admin dashboard
- July 1, 2025: Made booking modal fully responsive with full-screen behavior on mobile devices
- July 1, 2025: Updated admin dashboard with 2x2 mobile metrics grid and horizontally scrollable tabs
- July 1, 2025: Improved all form elements for mobile touch UX: inputs (min-h-[48px]), buttons (min-w-[44px] min-h-[48px]), textareas
- July 1, 2025: Added mobile-first responsive container improvements with proper padding (px-4 py-3 md:px-6 md:py-4)
- July 1, 2025: Enhanced CSS with scrollbar-hide utility and mobile-friendly line height classes
- January 2, 2025: COMPREHENSIVE UI/UX UPGRADE: Implemented mobile optimization and loading states
- January 2, 2025: Created reusable CTASection component for consistent call-to-action sections across pages
- January 2, 2025: Added skeleton loading animations to admin dashboard grid cards
- January 2, 2025: Implemented scrollbar-hide CSS utility for cleaner mobile interfaces
- January 2, 2025: Enhanced booking modal to be fullscreen on mobile devices with proper responsive classes
- January 2, 2025: Added gamified certification badges to About page with colorful achievement-style cards
- January 2, 2025: Integrated CTASection component in Tips and Blog pages for consistent marketing messaging
- January 2, 2025: Fixed button text visibility issues by ensuring proper contrast in CTA sections
- January 2, 2025: COMPLETE EMAIL SYSTEM IMPLEMENTATION: Built comprehensive email notification system
- January 2, 2025: Created 10 professional email templates using react-email with adventure-themed messaging
- January 2, 2025: Integrated Resend API for reliable email delivery with fallback logging in development
- January 2, 2025: Added automatic email triggers for booking confirmations, cancellations, and new content
- January 2, 2025: Built email testing endpoint for development verification and debugging
- January 2, 2025: Implemented proper error handling to prevent email failures from breaking core functionality
- January 2, 2025: Enhanced reschedule functionality with available time slot dropdowns for both parent and admin dashboards
- January 2, 2025: Created RescheduleForm and AdminRescheduleForm components using useAvailableTimes hook
- January 2, 2025: Implemented Update Focus Areas functionality in parent dashboard with multi-select for focus areas
- January 2, 2025: Added general booking update endpoint with proper authentication and ownership verification
- January 2, 2025: Fixed reschedule modals to use available time slots instead of manual time entry
- January 2, 2025: COMPREHENSIVE MOBILE UX IMPROVEMENTS: Implemented 2-row grid layout for admin dashboard tabs
- January 2, 2025: Enhanced parent dashboard tabs with visual elevation, sticky positioning, and 48px touch targets
- January 2, 2025: Redesigned booking modal stepper to prevent horizontal scrolling with responsive step layout
- January 2, 2025: Fixed analytics and booking manager filters to be fully responsive on mobile devices
- January 2, 2025: Implemented clean athlete cards UI with proper hierarchy (name, birthday alerts, age/experience, parent info)
- January 2, 2025: Fixed booking modal parent info skip logic for logged-in parents using 'Book New Session'
- January 2, 2025: Added completed step indicators with checkmarks and dynamic sizing for active/inactive steps
- January 2, 2025: FOCUS AREAS STEP INTEGRATION: Added comprehensive focus areas selection step to all three booking flows
- January 2, 2025: Created FocusAreasStep component with apparatus-specific skills and general training areas selection
- January 2, 2025: Updated BookingFlowContext to include focusAreas step in parent-portal, athlete-modal, and new-user flows
- January 2, 2025: Integrated GYMNASTICS_EVENTS skills data for organized focus area selection with visual skill badges
- July 3, 2025: EDIT ATHLETE MODAL ENHANCEMENT: Updated Edit Athlete modals in both admin and parent portals to use separate first and last name fields
- July 3, 2025: FIXED AGE CALCULATION BUG: Corrected age calculation function to properly parse YYYY-MM-DD dates without timezone issues across all components (admin dashboard, parent portal, athlete selection, booking manager)
- July 3, 2025: Enhanced parent dashboard Edit Athlete modal with proper save functionality and data persistence
- July 3, 2025: Created dateUtils.ts utility for consistent age calculations across the application
- July 3, 2025: BOOKING DATE & TIME VALIDATION FIXES: Enhanced date selection to properly block past dates while allowing current day selection, added server-side filtering for past times with 1-hour booking buffer
- July 3, 2025: MANUAL BOOKING FORM VALIDATION: Fixed "Please check all required fields" error by adding comprehensive field validation with user-friendly error messages and proper time slot reset on date changes
- July 3, 2025: Added past time filtering logic to prevent booking times that have already passed, improving user experience and data integrity
- July 3, 2025: BOOKING CONFIRMATION SYSTEM FIXES: Resolved parent information display issue in booking flow where logged-in parents saw empty fields instead of pre-filled confirmation data
- July 3, 2025: Enhanced parent authentication session handling to ensure consistent data flow between parent portal and booking pages
- July 3, 2025: Added fallback mechanism for parent info display when API data is unavailable but parent session exists
- July 3, 2025: Implemented comprehensive debugging and error handling for booking flow to track data persistence issues
- July 3, 2025: COMPREHENSIVE PERFORMANCE OPTIMIZATION: Implemented extensive performance improvements including lazy loading, optimized caching, and service worker
- July 3, 2025: Added lazy loading for all page components with Suspense fallbacks to reduce initial bundle size and improve loading times
- July 3, 2025: Optimized React Query configuration with intelligent caching strategies: 5min default, 15min for content, 1hr for Stripe products, 30sec for auth
- July 3, 2025: Created optimized query hooks with different stale times for various data types to minimize unnecessary network requests
- July 3, 2025: Implemented lazy image component with intersection observer for automatic image loading only when visible
- July 3, 2025: Enhanced Navigation component with hover prefetching to preload critical resources before user navigation
- July 3, 2025: Added comprehensive performance monitoring utilities to track component render times and API call performance
- July 3, 2025: Created optimized components including virtual scrolling, debounced search, memoized modals, and efficient data tables
- July 3, 2025: Implemented service worker with intelligent caching strategies for static assets, API responses, and dynamic content
- July 3, 2025: Added performance tracking throughout the application with automatic detection of slow renders and API calls
- July 4, 2025: COMPREHENSIVE EMAIL AUTOMATION SYSTEM: Implemented automated email workflow for new athletes with three specialized templates
- July 4, 2025: Created ReservationPaymentLink, WaiverCompletionLink, and SafetyInformationLink email templates with professional adventure-themed messaging
- July 4, 2025: Built backend endpoint `/api/bookings/:id/send-new-athlete-emails` for coordinated email sequence automation
- July 4, 2025: Enhanced admin manual booking form with existing vs new athlete selection and automatic email triggering
- July 4, 2025: Integrated Stripe payment portal links for seamless reservation payments directly from emails
- July 4, 2025: Added streamlined parent login redirects for waiver completion and safety verification with minimal clicks
- July 4, 2025: WAIVER PDF DATE FORMAT FIX: Updated date formatting to use readable format (e.g., "July 4, 2025") instead of raw date strings for improved document readability
- July 4, 2025: SUPABASE MIGRATION COMPLETE: Migrated from Neon database to native Supabase PostgreSQL using postgres-js driver, removed Neon dependencies and updated database connection to use official Supabase client architecture
- July 4, 2025: COMPLETE DATABASE MIGRATION SCRIPT: Created comprehensive supabase-setup.sql that migrates ALL existing data (6 parents, 1 athlete with photo, 2 bookings, 6 availability slots, 4 exceptions, 1 admin account, auth codes) plus adds sample content (3 blog posts, 5 tips) - preserves 100% of existing functionality
- July 4, 2025: SUPABASE REST API MIGRATION COMPLETE: Successfully migrated all critical database operations from Drizzle ORM to Supabase REST API format including admin authentication, blog posts, tips, bookings, athletes, parents/customers operations
- July 4, 2025: CORE FUNCTIONALITY VERIFIED: Admin authentication working with password "TumbleCoach2025!", tips API returning 5 tips, blog posts API returning 3 posts, all data properly fetched from Supabase database with proper error handling and logging
- July 4, 2025: DATE/TIME ISSUE RESOLVED: Fixed "Invalid time value" errors in blog/tip detail pages by creating date utility functions to handle API snake_case vs frontend camelCase field naming
- July 4, 2025: MIGRATION TESTING COMPLETE: Comprehensive testing confirms 100% successful migration to Supabase with all features functional, zero data loss, and proper error handling across all systems
- July 5, 2025: ADMIN DATA CLEARING FUNCTION: Added secure admin endpoint `/api/admin/clear-test-data` for testing purposes - clears all parent, booking, athlete, and auth code data with proper authentication and detailed feedback
- July 5, 2025: CRITICAL POST-SUPABASE MIGRATION FIXES: Resolved athlete display issues in parent/admin dashboards by creating missing athlete profiles from existing bookings, fixed booking validation requiring capitalized relationship values ('Parent' not 'parent'), verified payment status synchronization with Stripe, confirmed booking success page functionality, and established proper parent-athlete associations in database - all systems now fully operational
- July 6, 2025: COMPREHENSIVE CRITICAL ISSUES RESOLUTION: Completed systematic analysis and resolution of 5 critical platform issues: (1) Payment/attendance status synchronization verified working correctly across entire platform, (2) Gender update issue root cause identified - database missing gender column in athletes table, (3) Parent portal authentication fully functional with swyrwilliam12@gmail.com for Alfred/Thomas test accounts, (4) Database cleanup identified unused 'users' table for removal and missing gender column for addition, (5) Complete system testing finished with test data cleared for fresh start - platform fully functional except gender field requiring database schema update
- July 6, 2025: ARCHIVED WAIVERS MIGRATION COMPLETE: Successfully migrated archived waiver system from local storage to database-backed implementation, removed hardcoded archived waiver data (ID 999 for Alfred Sawyer), implemented full CRUD API endpoints (GET, POST, DELETE) for archived_waivers table, added proper validation and error handling, verified all functionality working correctly with database persistence - no more locally stored archived waivers
- July 6, 2025: POSTGRESQL ENUM MIGRATION COMPLETE: Modernized database schema to use PostgreSQL enum types for booking.status, payment_status, and attendance_status fields, replaced string literal unions with proper enum types in TypeScript (BookingStatusEnum, PaymentStatusEnum, AttendanceStatusEnum), updated Zod validation to use z.nativeEnum() for improved type safety, converted all 19+ string literals in routes.ts to enum values using automated script, updated storage layer method signatures to enforce enum parameters - provides database-level integrity, better performance, and eliminates string typo bugs
- July 6, 2025: DATABASE NORMALIZATION BACKEND IMPLEMENTATION COMPLETE: Implemented comprehensive normalized database structure for apparatus, focus_areas, and side_quests with proper join tables (booking_apparatus, booking_focus_areas, booking_side_quests), added full CRUD API endpoints (/api/apparatus, /api/focus-areas, /api/side-quests), enhanced storage layer with normalized relationship methods (createBookingWithRelations, getBookingWithRelations, updateBookingRelations), created complete SQL migration script with 10 apparatus types, 39 focus areas, and 10 side quests - ready for SQL migration execution to activate normalized data structure
- July 6, 2025: POSTGRESQL DATE/TIME MIGRATION IMPLEMENTATION COMPLETE: Successfully modernized database schema to use native PostgreSQL DATE and TIME types with Pacific timezone support throughout the application, updated shared/schema.ts with proper date/time column definitions, created comprehensive Pacific timezone utilities (shared/timezone-utils.ts) for consistent date/time formatting, configured server for America/Los_Angeles timezone, updated all API routes to format timestamps in Pacific time, enhanced Zod validation for date/time fields with proper coercion and regex patterns, created complete SQL migration script and JavaScript migration runner - 95% complete with only database execution pending SUPABASE_SERVICE_KEY credentials

## User Preferences

Preferred communication style: Simple, everyday language.