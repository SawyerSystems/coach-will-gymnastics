# CoachWillTumbles - Gymnastics Booking & Management System

A comprehensive gymnastics coaching platform that enables parents to book sessions, manage athletes, and handle waivers. Built with React, Express, and Supabase.

## Features

- **Parent Portal**: Book sessions, manage athletes, view schedules
- **Admin Dashboard**: Comprehensive booking and athlete management
- **Integrated Waiver System**: Digital waiver signing and management
- **Stripe Payment Integration**: Secure payment processing
- **Email Notifications**: Automated email communications
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **Payment**: Stripe
- **Email**: React Email
- **Styling**: Tailwind CSS, Radix UI

## Getting Started

For detailed setup instructions, see the [setup/](./setup/) folder which contains comprehensive guides for:
- Environment configuration
- Database setup
- Storage configuration  
- Email system setup
- Payment processing setup
- Development workflow

### Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (copy from `setup/example.env` to `.env`)

3. Run database migrations:
   ```bash
   npm run db:push
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared types and database schema
- `emails/` - React Email templates
- `scripts/` - Database utilities and build scripts
- `setup/` - Complete setup documentation and configuration files
- `Tests/` - Test files, debug scripts, and development utilities
- `attached_assets/` - Static assets and documentation