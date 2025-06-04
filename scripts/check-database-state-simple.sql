-- Script compatible con versiones antiguas de PostgreSQL
-- Verificar tablas y políticas

-- Verificar tablas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar columnas de user_settings
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;

-- Verificar políticas existentes
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar datos en user_settings
SELECT 
    id, 
    user_id, 
    project_name, 
    theme, 
    color_scheme, 
    custom_color,
    LENGTH(company_logo) as logo_length,
    company_logo_type,
    updated_at
FROM user_settings
ORDER BY updated_at DESC
LIMIT 10;

-- Verificar configuración global
SELECT 
    id, 
    user_id, 
    project_name, 
    theme, 
    color_scheme, 
    custom_color,
    LENGTH(company_logo) as logo_length,
    company_logo_type,
    updated_at
FROM user_settings
WHERE user_id = '00000000-0000-0000-0000-000000000001'
LIMIT 1;
