-- Verificar el estado actual de la configuración global
SELECT 
    'Global Settings Check' as check_type,
    user_id,
    project_name,
    color_scheme,
    custom_color,
    company_logo,
    created_at,
    updated_at
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Si no existe, mostrar todos los registros para debug
SELECT 
    'All Settings' as check_type,
    user_id,
    project_name,
    color_scheme,
    custom_color,
    LEFT(company_logo, 50) as logo_preview,
    created_at
FROM user_settings 
ORDER BY created_at DESC
LIMIT 5;
