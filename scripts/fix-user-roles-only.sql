-- PASO 1: Deshabilitar RLS temporalmente solo en user_roles
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar TODAS las políticas existentes de user_roles
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Allow superadmins to view all roles" ON user_roles;
DROP POLICY IF EXISTS "Allow superadmins to manage all roles" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_insert_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_delete_policy" ON user_roles;

-- PASO 3: Crear políticas SIMPLES sin recursión para user_roles

-- Política para SELECT: Permitir a todos los usuarios autenticados ver roles
CREATE POLICY "user_roles_simple_select" ON user_roles
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Política para INSERT: Permitir a todos los usuarios autenticados crear roles
CREATE POLICY "user_roles_simple_insert" ON user_roles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para UPDATE: Permitir a todos los usuarios autenticados actualizar roles
CREATE POLICY "user_roles_simple_update" ON user_roles
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Política para DELETE: Permitir a todos los usuarios autenticados eliminar roles
CREATE POLICY "user_roles_simple_delete" ON user_roles
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- PASO 4: Rehabilitar RLS en user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- PASO 5: Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_roles';
