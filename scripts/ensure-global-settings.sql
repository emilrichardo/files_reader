-- Crear configuración global si no existe
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
    'blue',
    '#3b82f6',
    'Inter',
    'flat',
    '',
    NULL,
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    updated_at = NOW(),
    project_name = COALESCE(EXCLUDED.project_name, user_settings.project_name),
    api_endpoint = COALESCE(EXCLUDED.api_endpoint, user_settings.api_endpoint),
    color_scheme = COALESCE(EXCLUDED.color_scheme, user_settings.color_scheme),
    custom_color = COALESCE(EXCLUDED.custom_color, user_settings.custom_color);

-- Verificar que se creó correctamente
SELECT 
    'Global Settings Created' as status,
    user_id,
    project_name,
    color_scheme,
    custom_color,
    created_at,
    updated_at
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
