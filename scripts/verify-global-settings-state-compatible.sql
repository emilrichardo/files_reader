-- Verificar el estado actual de la configuración global (compatible con versiones anteriores de PostgreSQL)
SELECT 
    'Global Settings Check' as check_type,
    user_id,
    project_name,
    color_scheme,
    custom_color,
    CASE 
        WHEN company_logo IS NOT NULL AND LENGTH(company_logo) > 0 THEN 'Present'
        ELSE 'Not found'
    END as logo_status,
    created_at,
    updated_at
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Si no existe, mostrar todos los registros para debug
SELECT 
    'All Settings' as check_type,
    user_id,
    project_name,
    color_scheme,
    custom_color,
    CASE 
        WHEN company_logo IS NOT NULL AND LENGTH(company_logo) > 0 THEN 'Has Logo'
        ELSE 'No Logo'
    END as logo_status,
    created_at
FROM user_settings 
ORDER BY created_at DESC
LIMIT 5;

-- Verificar estructura de la tabla
SELECT 
    'Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
ORDER BY ordinal_position;

-- Verificar políticas RLS (compatible)
SELECT 
    'RLS Policies' as check_type,
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_settings';
