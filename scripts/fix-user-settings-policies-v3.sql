-- Script compatible con diferentes versiones de PostgreSQL
-- Eliminar todas las políticas existentes de user_settings
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Superadmins can manage all settings" ON user_settings;
DROP POLICY IF EXISTS "Allow global settings access" ON user_settings;
DROP POLICY IF EXISTS "Allow superadmin full access" ON user_settings;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON user_settings;
DROP POLICY IF EXISTS "Allow public read of global settings" ON user_settings;

-- Verificar si la tabla existe
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        RAISE NOTICE 'Tabla user_settings encontrada, procediendo con la limpieza...';
        
        -- Deshabilitar RLS temporalmente para limpiar
        ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
        
        -- Eliminar registros duplicados si existen
        DELETE FROM user_settings 
        WHERE id NOT IN (
            SELECT MIN(id) 
            FROM user_settings 
            GROUP BY user_id
        );
        
        -- Habilitar RLS nuevamente
        ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'RLS configurado y duplicados eliminados';
    ELSE
        RAISE NOTICE 'Tabla user_settings no encontrada';
    END IF;
END $$;

-- Crear políticas simplificadas y permisivas
CREATE POLICY "Allow all operations for authenticated users" 
ON user_settings 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Política adicional para usuarios públicos (solo lectura de configuración global)
CREATE POLICY "Allow public read of global settings" 
ON user_settings 
FOR SELECT 
TO anon 
USING (user_id = '00000000-0000-0000-0000-000000000001');

-- Asegurar que la tabla tenga las columnas correctas
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar estructura de la tabla (compatible con versiones anteriores)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
ORDER BY ordinal_position;

-- Verificar políticas actuales
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_settings';

-- Verificar estado de RLS (compatible)
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_settings';

-- Mensaje de confirmación
DO $$ 
BEGIN
    RAISE NOTICE '✅ Script completado exitosamente';
    RAISE NOTICE '📋 Políticas creadas: Allow all operations for authenticated users, Allow public read of global settings';
    RAISE NOTICE '🔧 Trigger updated_at configurado';
END $$;
