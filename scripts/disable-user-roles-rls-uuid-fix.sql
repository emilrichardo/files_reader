-- Deshabilitar completamente RLS en user_roles para evitar cualquier recursión
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "user_roles_simple_select" ON user_roles;
DROP POLICY IF EXISTS "user_roles_simple_insert" ON user_roles;
DROP POLICY IF EXISTS "user_roles_simple_update" ON user_roles;
DROP POLICY IF EXISTS "user_roles_simple_delete" ON user_roles;

-- Verificar que no hay políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'user_roles';

-- Confirmar que RLS está deshabilitado (versión compatible)
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'user_roles';

-- Verificar el estado de la tabla (sin columnas que puedan causar problemas)
SELECT 
    t.schemaname,
    t.tablename,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.tablename = 'user_roles'
GROUP BY t.schemaname, t.tablename, t.rowsecurity;
