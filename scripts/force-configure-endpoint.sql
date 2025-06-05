-- Eliminar todas las configuraciones existentes para evitar duplicados
DELETE FROM user_settings WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Insertar la configuración con el endpoint correcto
INSERT INTO user_settings (
    user_id,
    api_endpoint,
    primary_color,
    company_logo,
    style_mode,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'https://cibet.app.n8n.cloud/webhook/uploadfile',
    '#3b82f6',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im0xNCAyLTMgMTBMMTQgMjIgMjEgMTJaIi8+PHBhdGggZD0ibTEwIDItMyAxMEwxMCAyMiAzIDEyWiIvPjwvc3ZnPg==',
    'light',
    NOW(),
    NOW()
);

-- Verificar que se insertó correctamente
SELECT 
    user_id,
    api_endpoint,
    primary_color,
    company_logo IS NOT NULL as has_logo,
    style_mode,
    created_at
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
