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
    
    # Get the latest 5 waivers
    result = supabase.table('waivers').select('*').order('created_at', desc=True).limit(5).execute()
    
    if result.data:
        print(f"Latest {len(result.data)} waivers:")
        for i, waiver in enumerate(result.data):
            print(f"\n{i+1}. Waiver ID: {waiver.get('id')}")
            print(f"   athlete_id: {waiver.get('athlete_id')}")
            print(f"   athleteName: {waiver.get('athleteName', 'NOT SET')}")
            print(f"   athlete_name: {waiver.get('athlete_name', 'NOT SET')}")
            print(f"   signerName: {waiver.get('signerName')}")
            print(f"   created_at: {waiver.get('created_at')}")
            
            # Check what fields exist
            print(f"   All fields: {list(waiver.keys())}")
            
    else:
        print("No waivers found")
        
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
