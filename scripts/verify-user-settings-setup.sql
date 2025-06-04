-- Verificar el estado actual de user_settings

-- Ver todas las políticas activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_settings';

-- Ver todos los registros actuales
SELECT user_id, project_name, api_endpoint, theme, created_at, updated_at
FROM user_settings
ORDER BY created_at DESC;

-- Verificar RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'user_settings';

-- Ver si existe el registro global
SELECT user_id, project_name, api_endpoint
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
