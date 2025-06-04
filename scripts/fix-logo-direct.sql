-- Insertar un logo SVG simple directamente
UPDATE user_settings
SET 
  company_logo = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzYjgyZjYiIHJ4PSIyMCIgcnk9IjIwIi8+PHRleHQgeD0iNTAiIHk9IjYwIiBmb250LXNpemU9IjQwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DPC90ZXh0Pjwvc3ZnPg==',
  company_logo_type = 'svg',
  updated_at = NOW()
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Verificar que se haya actualizado
SELECT 
  user_id, 
  project_name,
  LEFT(company_logo, 100) as logo_preview,
  LENGTH(company_logo) as logo_length,
  company_logo_type
FROM user_settings
WHERE user_id = '00000000-0000-0000-0000-000000000001';
