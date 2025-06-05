-- Limpiar configuraciones duplicadas y dejar solo una
DO $$
BEGIN
  -- Eliminar todas las configuraciones globales duplicadas
  DELETE FROM user_settings 
  WHERE user_id = '00000000-0000-0000-0000-000000000001';
  
  RAISE NOTICE '🗑️ Configuraciones duplicadas eliminadas';
  
  -- Crear UNA SOLA configuración global
  INSERT INTO user_settings (
    id,
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
  
  RAISE NOTICE '✅ Configuración global única creada';
  
  -- Verificar que solo hay una fila
  IF (SELECT COUNT(*) FROM user_settings WHERE user_id = '00000000-0000-0000-0000-000000000001') = 1 THEN
    RAISE NOTICE '✅ Verificación exitosa: Solo una configuración global';
  ELSE
    RAISE EXCEPTION '❌ Error: Múltiples configuraciones encontradas';
  END IF;
  
END $$;

-- Mostrar la configuración final
SELECT 
  'Configuración Global' as tipo,
  project_name,
  api_endpoint,
  theme,
  custom_color
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
