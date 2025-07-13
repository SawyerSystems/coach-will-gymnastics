-- =====================================================
-- SUPABASE DATABASE ANALYSIS SCRIPT (CLEAN VERSION)
-- =====================================================
-- Paste this script into Supabase SQL Editor
-- Run each section separately or all at once

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
-- 10. ROW COUNTS AND TABLE ACTIVITY
-- =====================================================
SELECT 
    'ROW COUNTS' as section,
    schemaname,
    tablename,
    n_tup_ins as total_inserts,
    n_tup_upd as total_updates,
    n_tup_del as total_deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- =====================================================
-- 11. ENUM TYPES
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
-- 12. CRITICAL BOOKING SCHEMA ANALYSIS
-- =====================================================
-- Check what columns actually exist in bookings table
SELECT 
    'BOOKINGS COLUMNS' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'bookings'
ORDER BY ordinal_position;

-- Check what columns exist in athletes table  
SELECT 
    'ATHLETES COLUMNS' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'athletes'
ORDER BY ordinal_position;

-- =====================================================
-- 13. SAMPLE DATA FROM KEY TABLES
-- =====================================================
-- Bookings table sample
SELECT 'BOOKINGS SAMPLE' as section, * FROM bookings LIMIT 3;

-- Parents table sample  
SELECT 'PARENTS SAMPLE' as section, * FROM parents LIMIT 3;

-- Athletes table sample
SELECT 'ATHLETES SAMPLE' as section, * FROM athletes LIMIT 3;

-- Focus areas table sample
SELECT 'FOCUS_AREAS SAMPLE' as section, * FROM focus_areas LIMIT 5;

-- Apparatus table sample
SELECT 'APPARATUS SAMPLE' as section, * FROM apparatus LIMIT 5;

-- Booking athletes junction sample
SELECT 'BOOKING_ATHLETES SAMPLE' as section, * FROM booking_athletes LIMIT 5;

-- =====================================================
-- 14. SPECIFIC ERROR INVESTIGATION
-- =====================================================
-- Check if old athlete columns exist in bookings table
SELECT 
    'OLD SCHEMA CHECK' as section,
    'athlete1_name' as column_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'bookings' 
            AND column_name = 'athlete1_name'
        ) THEN 'EXISTS' 
        ELSE 'NOT_EXISTS' 
    END as status;

SELECT 
    'OLD SCHEMA CHECK' as section,
    'athlete1_allergies' as column_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'bookings' 
            AND column_name = 'athlete1_allergies'
        ) THEN 'EXISTS' 
        ELSE 'NOT_EXISTS' 
    END as status;

-- Check if new schema columns exist
SELECT 
    'NEW SCHEMA CHECK' as section,
    'focus_area_ids' as column_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'bookings' 
            AND column_name = 'focus_area_ids'
        ) THEN 'EXISTS' 
        ELSE 'NOT_EXISTS' 
    END as status;

-- =====================================================
-- 15. ANALYSIS COMPLETE
-- =====================================================
SELECT 
    'ANALYSIS COMPLETE' as section,
    'Check all results above' as note,
    now() as completed_at;
