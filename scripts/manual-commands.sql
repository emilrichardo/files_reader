-- Comandos para ejecutar manualmente uno por uno si es necesario

-- Paso 1: Deshabilitar RLS
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Paso 2: Eliminar política existente
DROP POLICY IF EXISTS "allow_all_user_settings" ON user_settings;

-- Paso 3: Habilitar RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Paso 4: Crear nueva política con nombre diferente
CREATE POLICY "user_settings_access_final" 
ON user_settings 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);
