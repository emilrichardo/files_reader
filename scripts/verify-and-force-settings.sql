-- Verificar estado actual de configuración global
SELECT 
  'Current global settings:' as info,
  user_id,
  project_name,
  custom_color,
  color_scheme,
  company_logo IS NOT NULL as has_logo,
  LENGTH(company_logo) as logo_size,
  company_logo_type,
  updated_at
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Si no existe, crear configuración global
INSERT INTO user_settings (
  user_id,
  project_name,
  custom_color,
  color_scheme,
  company_logo,
  company_logo_type,
  font_family,
  theme,
  style_mode,
  api_endpoint,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Civet',
  '#3b82f6',
  'blue',
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiMzYjgyZjYiIHJ4PSIxMiIgcnk9IjEyIi8+PHRleHQgeD0iMzIiIHk9IjQyIiBmb250LXNpemU9IjI4IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+QzwvdGV4dD48L3N2Zz4=',
  'svg',
  'Inter',
  'light',
  'flat',
  'https://cibet.app.n8n.cloud/webhook/Civet-public-upload',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  project_name = EXCLUDED.project_name,
  custom_color = EXCLUDED.custom_color,
  color_scheme = EXCLUDED.color_scheme,
  company_logo = EXCLUDED.company_logo,
  company_logo_type = EXCLUDED.company_logo_type,
  updated_at = NOW();

-- Verificar que se guardó correctamente
SELECT 
  'After insert/update:' as info,
  user_id,
  project_name,
  custom_color,
  color_scheme,
  company_logo IS NOT NULL as has_logo,
  LENGTH(company_logo) as logo_size,
  company_logo_type,
  updated_at
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
