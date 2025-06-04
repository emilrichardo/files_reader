-- PASO 1: Deshabilitar RLS temporalmente para limpiar
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_rows DISABLE ROW LEVEL SECURITY;
ALTER TABLE templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Allow superadmins to view all roles" ON user_roles;
DROP POLICY IF EXISTS "Allow superadmins to manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Allow users to view own settings" ON user_settings;
DROP POLICY IF EXISTS "Allow users to create own settings" ON user_settings;
DROP POLICY IF EXISTS "Allow users to update own settings" ON user_settings;
DROP POLICY IF EXISTS "Allow all authenticated users to view public settings" ON user_settings;
DROP POLICY IF EXISTS "Allow all authenticated users to view documents" ON documents;
DROP POLICY IF EXISTS "Allow all authenticated users to create documents" ON documents;
DROP POLICY IF EXISTS "Allow users to update own documents" ON documents;
DROP POLICY IF EXISTS "Allow users to delete own documents" ON documents;
DROP POLICY IF EXISTS "Allow all authenticated users to view document rows" ON document_rows;
DROP POLICY IF EXISTS "Allow all authenticated users to create document rows" ON document_rows;
DROP POLICY IF EXISTS "Allow all authenticated users to update document rows" ON document_rows;
DROP POLICY IF EXISTS "Allow all authenticated users to delete document rows" ON document_rows;
DROP POLICY IF EXISTS "Allow all authenticated users to view templates" ON templates;
DROP POLICY IF EXISTS "Allow all authenticated users to create templates" ON templates;
DROP POLICY IF EXISTS "Allow users to update own templates" ON templates;
DROP POLICY IF EXISTS "Allow users to delete own templates" ON templates;

-- PASO 3: Crear políticas SIMPLES sin recursión

-- Políticas para user_roles (MUY SIMPLES)
CREATE POLICY "user_roles_select_policy" ON user_roles
    FOR SELECT USING (true);

CREATE POLICY "user_roles_insert_policy" ON user_roles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "user_roles_update_policy" ON user_roles
    FOR UPDATE USING (true);

CREATE POLICY "user_roles_delete_policy" ON user_roles
    FOR DELETE USING (true);

-- Políticas para user_settings (SIMPLES)
CREATE POLICY "user_settings_select_policy" ON user_settings
    FOR SELECT USING (true);

CREATE POLICY "user_settings_insert_policy" ON user_settings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "user_settings_update_policy" ON user_settings
    FOR UPDATE USING (true);

-- Políticas para documents (SIMPLES)
CREATE POLICY "documents_select_policy" ON documents
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "documents_insert_policy" ON documents
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "documents_update_policy" ON documents
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "documents_delete_policy" ON documents
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas para document_rows (SIMPLES)
CREATE POLICY "document_rows_select_policy" ON document_rows
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "document_rows_insert_policy" ON document_rows
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "document_rows_update_policy" ON document_rows
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "document_rows_delete_policy" ON document_rows
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas para templates (SIMPLES)
CREATE POLICY "templates_select_policy" ON templates
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "templates_insert_policy" ON templates
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "templates_update_policy" ON templates
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "templates_delete_policy" ON templates
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- PASO 4: Rehabilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
