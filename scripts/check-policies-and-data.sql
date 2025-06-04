-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_settings';

-- Verificar contenido actual de user_settings
SELECT user_id, project_name, api_endpoint, theme, created_at, updated_at
FROM user_settings
ORDER BY created_at;

-- Verificar si existe el registro global
SELECT user_id, project_name, api_endpoint
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Verificar usuario actual autenticado (si aplica)
SELECT auth.uid() as current_user_id;
