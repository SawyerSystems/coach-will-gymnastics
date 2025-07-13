# DATABASE_URL Configuration Fix

## The Issue
Your current DATABASE_URL is trying to connect to port 5432 (standard PostgreSQL port) instead of port 6543 (Supabase pooler port), causing connection timeouts.

## Solution
You need to update your DATABASE_URL to use the correct Supabase pooler connection string.

## Correct Format
Your DATABASE_URL should look like this:
```
postgresql://postgres.nwdgtdzrcyfmislilucy:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

## Key Points:
1. **Host**: `aws-0-us-west-1.pooler.supabase.com` (not `db.nwdgtdzrcyfmislilucy.supabase.co`)
2. **Port**: `6543` (not `5432`)
3. **User**: `postgres.nwdgtdzrcyfmislilucy`
4. **Database**: `postgres`

## How to Get the Correct URL:
1. Go to your Supabase project dashboard
2. Click "Connect" in the top toolbar
3. Under "Connection string" → "Transaction pooler"
4. Copy the URI value exactly as shown
5. Replace `[YOUR-PASSWORD]` with your actual database password

## Current Status:
- ✅ Supabase REST API working perfectly
- ✅ All data migrated successfully
- ❌ DATABASE_URL using wrong port/host format
- ⏳ Need correct pooler connection string

Once you update the DATABASE_URL with the correct pooler connection string, all database operations will work immediately!