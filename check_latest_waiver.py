#!/usr/bin/env python3

import os
import sys
from supabase import create_client, Client

# Get Supabase credentials from environment
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: Missing Supabase credentials")
    sys.exit(1)

try:
    # Create Supabase client with service role key
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    # Get the latest waiver for athlete 66
    result = supabase.table('waivers').select('*').eq('athlete_id', 66).order('created_at', desc=True).limit(1).execute()
    
    if result.data:
        waiver = result.data[0]
        print("Latest waiver for athlete 66:")
        print(f"  ID: {waiver.get('id')}")
        print(f"  athlete_id: {waiver.get('athlete_id')}")
        print(f"  athleteName: {waiver.get('athleteName', 'NOT SET')}")
        print(f"  athlete_name: {waiver.get('athlete_name', 'NOT SET')}")
        print(f"  signerName: {waiver.get('signerName')}")
        print(f"  created_at: {waiver.get('created_at')}")
        print(f"  signed_at: {waiver.get('signed_at')}")
        
        # Also get athlete info
        athlete_result = supabase.table('athletes').select('*').eq('id', 66).execute()
        if athlete_result.data:
            athlete = athlete_result.data[0]
            print(f"\nAthlete 66 info:")
            print(f"  Name: {athlete.get('first_name')} {athlete.get('last_name')}")
            print(f"  Full name field: {athlete.get('name')}")
            
    else:
        print("No waivers found for athlete 66")
        
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
