-- 1. Verificar estado actual
SELECT 'Current State Check' as step;

-- Ver si existe configuración global
SELECT 
    'Global Settings' as type,
    user_id,
    project_name,
    color_scheme,
    custom_color,
    CASE 
        WHEN company_logo IS NOT NULL AND LENGTH(company_logo) > 0 THEN 'Has Logo'
        ELSE 'No Logo'
    END as logo_status
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- 2. Eliminar configuración global existente si hay problemas
DELETE FROM user_settings WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- 3. Crear configuración global completa y funcional
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
);

-- 4. Verificar que se creó correctamente
SELECT 
    'Final Verification' as step,
    user_id,
    project_name,
    color_scheme,
    custom_color,
    api_endpoint,
    created_at
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- 5. Mostrar todos los settings para debug
SELECT 
    'All Settings Debug' as step,
    user_id,
    project_name,
    color_scheme,
    custom_color
FROM user_settings 
ORDER BY created_at DESC;
