-- =====================================================
-- COMPREHENSIVE SUPABASE DATABASE ANALYSIS SCRIPT
-- =====================================================
-- Paste this entire script into Supabase SQL Editor
-- It will show all tables, columns, data, security, etc.

-- Enable output formatting
\pset border 2
\pset format aligned

-- =====================================================
-- 1. DATABASE OVERVIEW
-- =====================================================
SELECT 
    'DATABASE OVERVIEW' as section,
    current_database() as database_name,
    current_user as current_user,
    current_setting('server_version') as postgres_version,
    now() as analysis_timestamp;

-- =====================================================
-- 2. ALL SCHEMAS
-- =====================================================
SELECT 
    'SCHEMAS' as section,
    schema_name,
    schema_owner
FROM information_schema.schemata 
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;

-- =====================================================
-- 3. ALL TABLES WITH DETAILED INFO
-- =====================================================
SELECT 
    'TABLES OVERVIEW' as section,
    t.table_schema,
    t.table_name,
    t.table_type,
    obj_description(c.oid) as table_comment,
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = t.table_schema) as column_count
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name;

-- =====================================================
-- 4. ALL COLUMNS WITH DETAILED INFO
-- =====================================================
SELECT 
    'COLUMNS DETAIL' as section,
    table_name,
    column_name,
    ordinal_position,
    column_default,
    is_nullable,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_identity,
    identity_generation
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 5. PRIMARY KEYS AND CONSTRAINTS
-- =====================================================
SELECT 
    'PRIMARY KEYS' as section,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY tc.table_name;

-- =====================================================
-- 6. FOREIGN KEYS
-- =====================================================
SELECT 
    'FOREIGN KEYS' as section,
    tc.table_name as source_table,
    kcu.column_name as source_column,
    ccu.table_name as target_table,
    ccu.column_name as target_column,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- =====================================================
-- 7. INDEXES
-- =====================================================
SELECT 
    'INDEXES' as section,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) STATUS
-- =====================================================
SELECT 
    'RLS STATUS' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'ENABLED'
        ELSE 'DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 9. RLS POLICIES
-- =====================================================
SELECT 
    'RLS POLICIES' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 10. FUNCTIONS AND PROCEDURES
-- =====================================================
SELECT 
    'FUNCTIONS' as section,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as result_type,
    pg_get_function_arguments(p.oid) as arguments,
    CASE 
        WHEN p.prokind = 'f' THEN 'FUNCTION'
        WHEN p.prokind = 'p' THEN 'PROCEDURE' 
        WHEN p.prokind = 'a' THEN 'AGGREGATE'
        WHEN p.prokind = 'w' THEN 'WINDOW'
        ELSE 'OTHER'
    END as function_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- =====================================================
-- 11. TRIGGERS
-- =====================================================
SELECT 
    'TRIGGERS' as section,
    event_object_table as table_name,
    trigger_name,
    event_manipulation as event,
    action_timing as timing,
    action_statement as action
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 12. ENUM TYPES
-- =====================================================
SELECT 
    'ENUM TYPES' as section,
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;

-- =====================================================
-- 13. TABLE ROW COUNTS
-- =====================================================
SELECT 
    'ROW COUNTS' as section,
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- =====================================================
-- 14. SAMPLE DATA FROM KEY TABLES (Limited rows)
-- =====================================================

-- Check if bookings table exists and show sample
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings') THEN
        RAISE NOTICE 'BOOKINGS TABLE SAMPLE:';
        PERFORM * FROM bookings LIMIT 3;
    ELSE
        RAISE NOTICE 'BOOKINGS TABLE: Does not exist';
    END IF;
END $$;

-- Check if parents table exists and show sample
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'parents') THEN
        RAISE NOTICE 'PARENTS TABLE SAMPLE:';
        PERFORM * FROM parents LIMIT 3;
    ELSE
        RAISE NOTICE 'PARENTS TABLE: Does not exist';
    END IF;
END $$;

-- Check if athletes table exists and show sample
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'athletes') THEN
        RAISE NOTICE 'ATHLETES TABLE SAMPLE:';
        PERFORM * FROM athletes LIMIT 3;
    ELSE
        RAISE NOTICE 'ATHLETES TABLE: Does not exist';
    END IF;
END $$;

-- Check if focus_areas table exists and show sample
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'focus_areas') THEN
        RAISE NOTICE 'FOCUS_AREAS TABLE SAMPLE:';
        PERFORM * FROM focus_areas LIMIT 5;
    ELSE
        RAISE NOTICE 'FOCUS_AREAS TABLE: Does not exist';
    END IF;
END $$;

-- =====================================================
-- 15. STORAGE AND DISK USAGE
-- =====================================================
SELECT 
    'TABLE SIZES' as section,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- 16. RECENT TABLE ACTIVITY
-- =====================================================
SELECT 
    'TABLE ACTIVITY' as section,
    schemaname,
    relname as table_name,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins as inserts_today,
    n_tup_upd as updates_today,
    n_tup_del as deletes_today
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY (n_tup_ins + n_tup_upd + n_tup_del) DESC;

-- =====================================================
-- 17. EXTENSION AND CONFIGURATION INFO
-- =====================================================
SELECT 
    'EXTENSIONS' as section,
    extname as extension_name,
    extversion as version
FROM pg_extension
ORDER BY extname;

-- =====================================================
-- 18. SECURITY CONTEXT
-- =====================================================
SELECT 
    'SECURITY CONTEXT' as section,
    current_user as current_user,
    session_user as session_user,
    current_setting('is_superuser') as is_superuser,
    current_setting('log_statement') as log_statement,
    inet_client_addr() as client_ip;

-- =====================================================
-- 19. SPECIFIC BOOKING SYSTEM ANALYSIS
-- =====================================================

-- Check for old vs new schema columns in bookings
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings') THEN
        RAISE NOTICE 'BOOKINGS SCHEMA ANALYSIS:';
        
        -- Check for old athlete columns
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'athlete1_name') THEN
            RAISE NOTICE '  - OLD SCHEMA: Has athlete1_name column';
        ELSE
            RAISE NOTICE '  - NEW SCHEMA: No athlete1_name column';
        END IF;
        
        -- Check for new normalized columns
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'focus_area_ids') THEN
            RAISE NOTICE '  - NEW SCHEMA: Has focus_area_ids column';
        ELSE
            RAISE NOTICE '  - OLD SCHEMA: No focus_area_ids column';
        END IF;
    END IF;
END $$;

-- =====================================================
-- 20. FINAL SUMMARY
-- =====================================================
SELECT 
    'SUMMARY' as section,
    'Analysis Complete' as status,
    'Check results above for complete database state' as note,
    now() as completed_at;

-- Show actual data from key tables if they exist
\echo '===== ACTUAL TABLE DATA SAMPLES ====='

-- Bookings table data
\echo '--- BOOKINGS TABLE ---'
SELECT * FROM bookings LIMIT 3;

\echo '--- PARENTS TABLE ---'
SELECT * FROM parents LIMIT 3;

\echo '--- ATHLETES TABLE ---'  
SELECT * FROM athletes LIMIT 3;

\echo '--- FOCUS AREAS TABLE ---'
SELECT * FROM focus_areas LIMIT 5;

\echo '--- APPARATUS TABLE ---'
SELECT * FROM apparatus LIMIT 5;

\echo '--- BOOKING ATHLETES JUNCTION ---'
SELECT * FROM booking_athletes LIMIT 5;

\echo '==================================='
\echo 'DATABASE ANALYSIS COMPLETE'
\echo '==================================='
