-- Obtener y eliminar TODAS las políticas de user_roles
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Buscar todas las políticas en user_roles
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_roles' AND schemaname = 'public'
    LOOP
        -- Eliminar cada política encontrada
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_roles', policy_record.policyname);
        RAISE NOTICE 'Eliminada política: %', policy_record.policyname;
    END LOOP;
END $$;

-- Verificar que todas las políticas fueron eliminadas
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'user_roles' AND schemaname = 'public';

-- Confirmar estado final
SELECT 
    t.schemaname,
    t.tablename,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.tablename = 'user_roles'
GROUP BY t.schemaname, t.tablename, t.rowsecurity;
