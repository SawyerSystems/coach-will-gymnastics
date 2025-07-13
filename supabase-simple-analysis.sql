-- =====================================================
-- SIMPLIFIED SUPABASE DATABASE ANALYSIS
-- =====================================================
-- This uses only standard SQL that works in Supabase

-- =====================================================
-- 1. DATABASE OVERVIEW
-- =====================================================
SELECT 
    'DATABASE OVERVIEW' as section,
    current_database() as database_name,
    current_user as current_user,
    now() as analysis_timestamp;

-- =====================================================
-- 2. ALL TABLES
-- =====================================================
SELECT 
    'TABLES' as section,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- 3. BOOKINGS TABLE COLUMNS (CRITICAL)
-- =====================================================
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

-- =====================================================
-- 4. ATHLETES TABLE COLUMNS  
-- =====================================================
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
-- 5. ALL COLUMNS IN ALL TABLES
-- =====================================================
SELECT 
    'ALL COLUMNS' as section,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 6. PRIMARY KEYS
-- =====================================================
SELECT 
    'PRIMARY KEYS' as section,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY tc.table_name;

-- =====================================================
-- 7. FOREIGN KEYS
-- =====================================================
SELECT 
    'FOREIGN KEYS' as section,
    tc.table_name as source_table,
    kcu.column_name as source_column,
    ccu.table_name as target_table,
    ccu.column_name as target_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public' 
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- =====================================================
-- 8. CHECK IF OLD BOOKING COLUMNS EXIST
-- =====================================================
SELECT 
    'OLD SCHEMA CHECK' as section,
    'athlete1_name' as column_name,
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
    'athlete1_allergies' as column_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'bookings' 
            AND column_name = 'athlete1_allergies'
        ) THEN 'EXISTS' 
        ELSE 'NOT_EXISTS' 
    END as status;

SELECT 
    'OLD SCHEMA CHECK' as section,
    'athlete1_age' as column_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'bookings' 
            AND column_name = 'athlete1_age'
        ) THEN 'EXISTS' 
        ELSE 'NOT_EXISTS' 
    END as status;

-- =====================================================
-- 9. CHECK IF NEW BOOKING COLUMNS EXIST
-- =====================================================
SELECT 
    'NEW SCHEMA CHECK' as section,
    'focus_area_ids' as column_name,
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
-- 10. SAMPLE DATA (IF TABLES EXIST)
-- =====================================================

-- Bookings data (if table exists)
SELECT 'BOOKINGS DATA' as section, * FROM bookings LIMIT 3;

-- Parents data (if table exists)
SELECT 'PARENTS DATA' as section, * FROM parents LIMIT 3;

-- Athletes data (if table exists)  
SELECT 'ATHLETES DATA' as section, * FROM athletes LIMIT 3;

-- Focus areas data (if table exists)
SELECT 'FOCUS_AREAS DATA' as section, * FROM focus_areas LIMIT 5;

-- Apparatus data (if table exists)
SELECT 'APPARATUS DATA' as section, * FROM apparatus LIMIT 5;

-- =====================================================
-- 11. JUNCTION TABLES (if they exist)
-- =====================================================
SELECT 'BOOKING_ATHLETES DATA' as section, * FROM booking_athletes LIMIT 5;

-- =====================================================
-- 12. ANALYSIS COMPLETE
-- =====================================================
SELECT 
    'ANALYSIS COMPLETE' as section,
    'Review results above to understand schema mismatch' as note,
    now() as completed_at;
