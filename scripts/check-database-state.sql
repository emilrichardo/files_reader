-- Verificar estado actual de la base de datos
-- Este script verifica tablas, políticas y datos

-- 1. Verificar tablas principales
SELECT 'Tabla users:' as info, count(*) as total FROM users;
SELECT 'Tabla user_settings:' as info, count(*) as total FROM user_settings;
SELECT 'Tabla documents:' as info, count(*) as total FROM documents;
SELECT 'Tabla templates:' as info, count(*) as total FROM templates;

-- 2. Verificar políticas en user_settings
SELECT 
    'Políticas user_settings:' as info,
    policyname as nombre_politica,
    cmd as comando,
    permissive as permisivo
FROM pg_policies 
WHERE tablename = 'user_settings';

-- 3. Verificar RLS
SELECT 
    'Estado RLS:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'user_settings';

-- 4. Verificar contenido de user_settings
SELECT 
    'Configuración actual:' as info,
    user_id,
    primary_color,
    logo_url,
    project_name,
    theme_mode
FROM user_settings 
ORDER BY user_id;

-- 5. Verificar usuario específico
SELECT 
    'Usuario emilrichardo:' as info,
    id,
    email,
    role
FROM users 
WHERE email = 'emilrichardo@gmail.com';
