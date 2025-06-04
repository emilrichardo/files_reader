-- Deshabilitar RLS temporalmente solo en user_roles
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas existentes de user_roles
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Allow superadmins to view all roles" ON user_roles;
DROP POLICY IF EXISTS "Allow superadmins to manage all roles" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_insert_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_delete_policy" ON user_roles;

-- Crear políticas SIMPLES sin recursión para user_roles
CREATE POLICY "user_roles_simple_select" ON user_roles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "user_roles_simple_insert" ON user_roles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "user_roles_simple_update" ON user_roles
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "user_roles_simple_delete" ON user_roles
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Rehabilitar RLS en user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_roles';
