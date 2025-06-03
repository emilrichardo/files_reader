-- Eliminar políticas existentes que pueden estar causando problemas
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can create own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

DROP POLICY IF EXISTS "Users can view own document rows" ON document_rows;
DROP POLICY IF EXISTS "Users can create own document rows" ON document_rows;
DROP POLICY IF EXISTS "Users can update own document rows" ON document_rows;
DROP POLICY IF EXISTS "Users can delete own document rows" ON document_rows;

DROP POLICY IF EXISTS "Users can view own templates" ON templates;
DROP POLICY IF EXISTS "Users can create own templates" ON templates;
DROP POLICY IF EXISTS "Users can update own templates" ON templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON templates;

DROP POLICY IF EXISTS "Users can view own user_roles" ON user_roles;
DROP POLICY IF EXISTS "Users can create own user_roles" ON user_roles;
DROP POLICY IF EXISTS "Users can update own user_roles" ON user_roles;

-- Crear políticas más permisivas para documents
CREATE POLICY "Allow all authenticated users to view documents" ON documents
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all authenticated users to create documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid()::text);

CREATE POLICY "Allow users to update own documents" ON documents
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Allow users to delete own documents" ON documents
    FOR DELETE USING (auth.uid()::text = user_id);

-- Crear políticas para document_rows
CREATE POLICY "Allow all authenticated users to view document rows" ON document_rows
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all authenticated users to create document rows" ON document_rows
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all authenticated users to update document rows" ON document_rows
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all authenticated users to delete document rows" ON document_rows
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Crear políticas para templates
CREATE POLICY "Allow all authenticated users to view templates" ON templates
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all authenticated users to create templates" ON templates
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid()::text);

CREATE POLICY "Allow users to update own templates" ON templates
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Allow users to delete own templates" ON templates
    FOR DELETE USING (auth.uid()::text = user_id);

-- Crear políticas para user_roles (más restrictivas)
CREATE POLICY "Allow users to view own role" ON user_roles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Allow superadmins to view all roles" ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid()::text 
            AND ur.role = 'superadmin'
        )
    );

CREATE POLICY "Allow superadmins to manage all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid()::text 
            AND ur.role = 'superadmin'
        )
    );

-- Crear políticas para user_settings
CREATE POLICY "Allow users to view own settings" ON user_settings
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Allow users to create own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow users to update own settings" ON user_settings
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Allow all authenticated users to view public settings" ON user_settings
    FOR SELECT USING (auth.uid() IS NOT NULL);
