-- Verificar estado actual de la base de datos
-- Compatible con versiones anteriores de PostgreSQL

-- 1. Verificar tablas principales
SELECT 'Tabla users:' as info, count(*) as total FROM auth.users;
SELECT 'Tabla user_settings:' as info, count(*) as total FROM user_settings;
SELECT 'Tabla user_roles:' as info, count(*) as total FROM user_roles;
SELECT 'Tabla documents:' as info, count(*) as total FROM documents;
SELECT 'Tabla templates:' as info, count(*) as total FROM templates;

-- 2. Verificar estructura de user_settings
SELECT 
    'Columnas user_settings:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
ORDER BY ordinal_position;

-- 3. Verificar políticas en user_settings
SELECT 
    'Políticas user_settings:' as info,
    policyname as nombre_politica,
    cmd as comando,
    permissive as permisivo
FROM pg_policies 
WHERE tablename = 'user_settings';

-- 4. Verificar RLS (compatible con versiones anteriores)
SELECT 
    'Estado RLS:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'user_settings';

-- 5. Verificar contenido de user_settings (usando columnas correctas)
SELECT 
    'Configuración actual:' as info,
    user_id,
    project_name,
    color_scheme,
    custom_color,
    company_logo IS NOT NULL as tiene_logo,
    theme,
    created_at
FROM user_settings 
ORDER BY created_at DESC;

-- 6. Verificar roles de usuarios
SELECT 
    'Roles de usuarios:' as info,
    ur.user_id,
    ur.role,
    au.email
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.role, au.email;

-- 7. Verificar usuario específico emilrichardo
SELECT 
    'Usuario emilrichardo:' as info,
    au.id,
    au.email,
    ur.role,
    us.project_name
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN user_settings us ON au.id = us.user_id
WHERE au.email = 'emilrichardo@gmail.com';

-- 8. Verificar configuración global específica
SELECT 
    'Configuración global:' as info,
    user_id,
    project_name,
    color_scheme,
    custom_color,
    theme,
    company_logo IS NOT NULL as tiene_logo,
    api_endpoint
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
