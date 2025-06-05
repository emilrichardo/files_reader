-- Eliminar todas las configuraciones existentes para evitar duplicados
DELETE FROM user_settings WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Insertar la configuración con el endpoint correcto usando los nombres de columnas reales
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
    'https://cibet.app.n8n.cloud/webhook/uploadfile',
    '{"openai": "", "google_vision": "", "supabase": ""}',
    'light',
    'blue',
    '#3b82f6',
    'Inter',
    'flat',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiMzYjgyZjYiIHJ4PSIxMiIgcnk9IjEyIi8+PHRleHQgeD0iMzIiIHk9IjQyIiBmb250LXNpemU9IjI4IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+QzwvdGV4dD48L3N2Zz4=',
    'svg',
    NOW(),
    NOW()
);

-- Verificar que se insertó correctamente
SELECT 
    user_id,
    project_name,
    api_endpoint,
    custom_color,
    company_logo IS NOT NULL as has_logo,
    style_mode,
    created_at
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Contar cuántas configuraciones hay para este user_id
SELECT COUNT(*) as total_configs 
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
