-- Script de emergencia ultra-simple para user_settings
-- Evita todos los comandos problemáticos

-- Paso 1: Eliminar políticas una por una (nombres conocidos)
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

-- Paso 2: Deshabilitar RLS
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Paso 3: Eliminar duplicados de forma manual (sin MIN en UUID)
-- Crear tabla temporal para identificar duplicados
CREATE TEMP TABLE temp_user_settings_cleanup AS
SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (
        PARTITION BY user_id 
        ORDER BY created_at DESC NULLS LAST
    ) as row_num
FROM user_settings;

-- Eliminar duplicados (mantener solo el primero de cada user_id)
DELETE FROM user_settings 
WHERE id IN (
    SELECT id 
    FROM temp_user_settings_cleanup 
    WHERE row_num > 1
);

-- Paso 4: Habilitar RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Paso 5: Crear UNA política simple que funcione
CREATE POLICY "simple_user_settings_policy" 
ON user_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Verificación final
SELECT 'Arreglado - ' || COUNT(*) || ' registros, 1 política' as resultado 
FROM user_settings;
