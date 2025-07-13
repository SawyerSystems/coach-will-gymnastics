# Fresh Supabase Setup Guide

## Step 1: Get Your Supabase Credentials

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/projects
2. **Select Your Project** or create a new one
3. **Get Project URL**:
   - Go to Settings → API
   - Copy the "Project URL" (starts with `https://`)
4. **Get Anon Key**:
   - In the same API settings page
   - Copy the "anon" key (starts with `eyJ`)
5. **Get Database URL**:
   - Click "Connect" button in the top toolbar
   - Select "Connection string" → "Transaction pooler"
   - Copy the URI (starts with `postgresql://`)
   - Replace `[YOUR-PASSWORD]` with your database password

## Step 2: Add to Replit Secrets

You'll need to add these three secrets:

1. **SUPABASE_URL**: Your project URL
2. **SUPABASE_ANON_KEY**: Your anon key  
3. **DATABASE_URL**: Your connection string with password

## Step 3: Run Migration

After adding the secrets, I'll run the migration script to create all tables and migrate your data.

## What This Will Enable

- Complete booking system with payments
- Admin dashboard with all features
- Parent portal functionality
- Blog and tips content management
- Email notifications
- All existing data preserved

Ready to proceed? Please add the three secrets to Replit and I'll handle the rest!