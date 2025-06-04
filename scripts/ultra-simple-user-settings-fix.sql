-- Script ultra-simple sin RAISE NOTICE ni comandos complejos
-- Solo comandos SQL básicos que funcionan en cualquier versión

-- Eliminar políticas conocidas (ignorar errores si no existen)
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Superadmins can manage all settings" ON user_settings;
DROP POLICY IF EXISTS "Allow global settings access" ON user_settings;
DROP POLICY IF EXISTS "Allow superadmin full access" ON user_settings;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON user_settings;
DROP POLICY IF EXISTS "Allow public read of global settings" ON user_settings;
DROP POLICY IF EXISTS "user_settings_all_access" ON user_settings;
DROP POLICY IF EXISTS "user_settings_authenticated_access" ON user_settings;
DROP POLICY IF EXISTS "user_settings_public_global_read" ON user_settings;
DROP POLICY IF EXISTS "simple_user_settings_policy" ON user_settings;

-- Deshabilitar RLS
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Crear tabla temporal para limpiar duplicados
CREATE TEMP TABLE IF NOT EXISTS user_settings_to_keep AS
SELECT DISTINCT ON (user_id) id
FROM user_settings
ORDER BY user_id, created_at DESC;

-- Eliminar duplicados
DELETE FROM user_settings 
WHERE id NOT IN (SELECT id FROM user_settings_to_keep);

-- Habilitar RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Crear política simple
CREATE POLICY "allow_all_user_settings" 
ON user_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Verificar resultado
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users
FROM user_settings;
