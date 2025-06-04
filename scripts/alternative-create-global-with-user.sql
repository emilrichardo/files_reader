-- Alternativa: Crear un usuario ficticio primero y luego la configuración
DO $$
BEGIN
    -- Verificar si existe la tabla auth.users (Supabase)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        -- Insertar usuario ficticio en auth.users si no existe
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            '00000000-0000-0000-0000-000000000001',
            'global@system.local',
            'encrypted_dummy_password',
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "system", "providers": ["system"]}',
            '{"name": "Global System"}',
            false,
            'authenticated'
        ) ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Global system user created or already exists';
    ELSE
        RAISE NOTICE 'auth.users table not found, skipping user creation';
    END IF;
END $$;

-- Crear configuración global
INSERT INTO user_settings (
    user_id,
    project_name,
    api_endpoint,
    api_keys,
    theme,
    color_scheme,
    custom_color,
    font_family,
    style_mode,
    company_logo,
    company_logo_type,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Civet',
    'https://cibet.app.n8n.cloud/webhook/Civet-public-upload',
    '{"openai": "", "google_vision": "", "supabase": ""}',
    'light',
    'black',
    '',
    'Inter',
    'flat',
    '',
    null,
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    project_name = EXCLUDED.project_name,
    api_endpoint = EXCLUDED.api_endpoint,
    updated_at = NOW();

-- Verificar resultado
SELECT 
    user_id,
    project_name,
    color_scheme,
    company_logo IS NOT NULL as has_logo,
    created_at
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
