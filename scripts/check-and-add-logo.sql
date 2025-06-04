-- Verificar si hay logo en la configuración global
SELECT 
  user_id,
  project_name,
  color_scheme,
  custom_color,
  CASE 
    WHEN company_logo IS NOT NULL AND company_logo != '' THEN 'Logo present'
    ELSE 'No logo'
  END as logo_status,
  CASE 
    WHEN company_logo IS NOT NULL AND company_logo != '' THEN LENGTH(company_logo)
    ELSE 0
  END as logo_size
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Si no hay logo, agregar uno de ejemplo (opcional)
-- Puedes comentar esta parte si no quieres un logo por defecto
INSERT INTO user_settings (
  user_id,
  project_name,
  color_scheme,
  custom_color,
  company_logo,
  company_logo_type,
  api_endpoint,
  theme,
  font_family,
  style_mode,
  api_keys,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Civet',
  'blue',
  '#3b82f6',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzNiODJmNiIvPgo8cGF0aCBkPSJNOCAxNkMxMiAxMiAxNiAxMiAyMCAxNkMyMCAyMCAxNiAyMCAxMiAyMEw4IDE2WiIgZmlsbD0id2hpdGUiLz4KPHN2Zz4K',
  'svg',
  'https://cibet.app.n8n.cloud/webhook/Civet-public-upload',
  'light',
  'Inter',
  'flat',
  '{"openai": "", "google_vision": "", "supabase": ""}',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  company_logo = EXCLUDED.company_logo,
  company_logo_type = EXCLUDED.company_logo_type,
  updated_at = NOW();
