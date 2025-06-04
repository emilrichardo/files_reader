-- 1. Verificar el estado actual completo
SELECT 
  user_id,
  project_name,
  color_scheme,
  custom_color,
  company_logo,
  company_logo_type,
  LENGTH(company_logo) as logo_length,
  created_at,
  updated_at
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- 2. Actualizar con un logo de ejemplo si no existe
UPDATE user_settings 
SET 
  company_logo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiMzYjgyZjYiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMiIgeT0iMTIiPgo8cGF0aCBkPSJNMTIgMkw0IDdWMTdMMTIgMjJMMjAgMTdWN0wxMiAyWiIgZmlsbD0id2hpdGUiLz4KPHN2Zz4KPHN2Zz4K',
  company_logo_type = 'svg',
  updated_at = NOW()
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- 3. Verificar que se actualizó correctamente
SELECT 
  user_id,
  project_name,
  CASE 
    WHEN company_logo IS NOT NULL AND company_logo != '' THEN 'Logo updated'
    ELSE 'Still no logo'
  END as logo_status,
  LENGTH(company_logo) as logo_length,
  company_logo_type,
  updated_at
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
