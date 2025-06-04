-- Crear configuración global con el UUID fijo
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

-- Verificar que se creó correctamente
SELECT 
    user_id,
    project_name,
    color_scheme,
    company_logo IS NOT NULL as has_logo,
    created_at
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
