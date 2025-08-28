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
    
    # Test the same JOIN query that createWaiver uses
    result = supabase.table('waivers').select('''
        *,
        athlete_name:athletes!athlete_id(
            first_name,
            last_name
        )
    ''').eq('athlete_id', 66).limit(1).execute()
    
    if result.data:
        waiver = result.data[0]
        print("JOIN query result for athlete 66:")
        print(f"  athlete_id: {waiver.get('athlete_id')}")
        print(f"  athlete_name field: {waiver.get('athlete_name')}")
        print(f"  athlete_name type: {type(waiver.get('athlete_name'))}")
        if waiver.get('athlete_name'):
            print(f"  athlete_name content: {waiver.get('athlete_name')}")
        print(f"  All keys: {sorted(waiver.keys())}")
    else:
        print("No waivers found for athlete 66")
        
    # Also check if athlete 66 exists
    athlete_result = supabase.table('athletes').select('*').eq('id', 66).execute()
    if athlete_result.data:
        athlete = athlete_result.data[0]
        print(f"\nAthlete 66 exists:")
        print(f"  first_name: {athlete.get('first_name')}")
        print(f"  last_name: {athlete.get('last_name')}")
    else:
        print("\nAthlete 66 not found!")
        
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
