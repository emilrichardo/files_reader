-- Script mínimo - solo lo esencial

-- Deshabilitar RLS
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'user_settings'
    LOOP
        EXECUTE 'DROP POLICY "' || r.policyname || '" ON user_settings';
    END LOOP;
END $$;

-- Habilitar RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Crear una política que permita todo
CREATE POLICY "full_access" ON user_settings FOR ALL USING (true) WITH CHECK (true);
