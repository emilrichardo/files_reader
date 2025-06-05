-- Verificar estado de la base de datos sin usar forcerowsecurity
SELECT 'Verificando tablas principales...' as status;

-- Verificar si existen las tablas principales
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_settings', 'documents', 'templates', 'user_roles')
ORDER BY table_name;

-- Verificar configuración global
SELECT 'Verificando configuración global...' as status;

SELECT 
  user_id,
  project_name,
  custom_color,
  CASE 
    WHEN company_logo IS NOT NULL THEN 'HAS_LOGO'
    ELSE 'NO_LOGO'
  END as logo_status,
  api_endpoint
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
LIMIT 1;

-- Verificar políticas RLS (sin forcerowsecurity)
SELECT 'Verificando políticas RLS...' as status;

SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  'RLS_ENABLED' as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_settings', 'documents', 'templates', 'user_roles')
ORDER BY tablename;

-- Contar registros en tablas principales
SELECT 'Contando registros...' as status;

SELECT 
  'user_settings' as table_name,
  COUNT(*) as record_count
FROM user_settings
UNION ALL
SELECT 
  'documents' as table_name,
  COUNT(*) as record_count
FROM documents
UNION ALL
SELECT 
  'templates' as table_name,
  COUNT(*) as record_count
FROM templates
UNION ALL
SELECT 
  'user_roles' as table_name,
  COUNT(*) as record_count
FROM user_roles;

SELECT 'Verificación completada.' as status;
