-- Script compatible con UUIDs para resolver problemas de user_settings
-- Maneja correctamente los tipos UUID sin usar MIN() en UUIDs

-- 1. Eliminar todas las políticas existentes de forma segura
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    RAISE NOTICE 'Eliminando políticas existentes...';
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_settings'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON user_settings';
        RAISE NOTICE 'Política eliminada: %', pol.policyname;
    END LOOP;
    RAISE NOTICE 'Todas las políticas eliminadas';
END $$;

-- 2. Deshabilitar RLS temporalmente para operaciones de limpieza
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
RAISE NOTICE 'RLS deshabilitado temporalmente';

-- 3. Limpiar duplicados usando ROW_NUMBER (compatible con UUID)
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    RAISE NOTICE 'Iniciando limpieza de duplicados...';
    
    -- Eliminar duplicados manteniendo el más reciente por user_id
    WITH duplicates AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY user_id 
                ORDER BY 
                    COALESCE(updated_at, created_at) DESC NULLS LAST,
                    created_at DESC NULLS LAST,
                    id::text DESC
            ) as rn
        FROM user_settings
    )
    DELETE FROM user_settings 
    WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Duplicados eliminados: %', deleted_count;
END $$;

-- 4. Habilitar RLS nuevamente
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
RAISE NOTICE 'RLS habilitado nuevamente';

-- 5. Crear política ultra-permisiva para usuarios autenticados
CREATE POLICY "user_settings_authenticated_access" 
ON user_settings 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

RAISE NOTICE 'Política permisiva creada para usuarios autenticados';

-- 6. Crear política para acceso público a configuración global (opcional)
CREATE POLICY "user_settings_public_global_read" 
ON user_settings 
FOR SELECT 
TO anon
USING (user_id::text = '00000000-0000-0000-0000-000000000001');

RAISE NOTICE 'Política de lectura pública para configuración global creada';

-- 7. Verificar estructura de la tabla
DO $$
BEGIN
    RAISE NOTICE 'Verificando estructura de la tabla...';
    
    -- Agregar columna updated_at si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_settings' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE user_settings 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna updated_at agregada';
    ELSE
        RAISE NOTICE 'Columna updated_at ya existe';
    END IF;
END $$;

-- 8. Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();

RAISE NOTICE 'Trigger updated_at configurado';

-- 10. Verificaciones finales
DO $$
DECLARE
    record_count INTEGER;
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO record_count FROM user_settings;
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'user_settings';
    
    RAISE NOTICE '📊 Registros en user_settings: %', record_count;
    RAISE NOTICE '🔐 Políticas activas: %', policy_count;
    RAISE NOTICE '✅ Script completado exitosamente';
END $$;

-- 11. Mostrar información de las políticas creadas
SELECT 
    policyname as "Política",
    cmd as "Comando",
    roles as "Roles"
FROM pg_policies 
WHERE tablename = 'user_settings'
ORDER BY policyname;
