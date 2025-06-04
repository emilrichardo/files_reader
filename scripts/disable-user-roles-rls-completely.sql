-- Deshabilitar completamente RLS en user_roles para evitar cualquier recursión
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "user_roles_simple_select" ON user_roles;
DROP POLICY IF EXISTS "user_roles_simple_insert" ON user_roles;
DROP POLICY IF EXISTS "user_roles_simple_update" ON user_roles;
DROP POLICY IF EXISTS "user_roles_simple_delete" ON user_roles;

-- Verificar que no hay políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_roles';

-- Confirmar que RLS está deshabilitado
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'user_roles';
