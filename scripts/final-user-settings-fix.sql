-- Script final que maneja políticas existentes correctamente

-- Deshabilitar RLS temporalmente
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Eliminar política específica si existe
DROP POLICY IF EXISTS "allow_all_user_settings" ON user_settings;

-- Eliminar otras políticas comunes si existen
DROP POLICY IF EXISTS "full_access" ON user_settings;
DROP POLICY IF EXISTS "temp_policy" ON user_settings;
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Superadmins can manage all settings" ON user_settings;

-- Limpiar duplicados usando método simple
DELETE FROM user_settings a USING user_settings b 
WHERE a.id > b.id AND a.user_id = b.user_id;

-- Habilitar RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Crear política nueva con nombre único
CREATE POLICY "user_settings_full_access_v2" 
ON user_settings 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Verificar resultado
SELECT COUNT(*) as total_settings FROM user_settings;
SELECT COUNT(DISTINCT user_id) as unique_users FROM user_settings;
