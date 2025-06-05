-- Configurar el endpoint por defecto en la configuración global
DO $$
BEGIN
  -- Verificar si existe la configuración global
  IF EXISTS (SELECT 1 FROM user_settings WHERE user_id = '00000000-0000-0000-0000-000000000001') THEN
    -- Actualizar el endpoint existente
    UPDATE user_settings 
    SET api_endpoint = 'https://cibet.app.n8n.cloud/webhook/uploadfile',
        updated_at = NOW()
    WHERE user_id = '00000000-0000-0000-0000-000000000001';
    
    RAISE NOTICE '✅ Endpoint actualizado en configuración existente';
  ELSE
    -- Crear nueva configuración global con el endpoint
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
    
    RAISE NOTICE '✅ Nueva configuración global creada con endpoint';
  END IF;
  
  -- Verificar que se guardó correctamente
  PERFORM api_endpoint FROM user_settings WHERE user_id = '00000000-0000-0000-0000-000000000001' AND api_endpoint IS NOT NULL;
  
  IF FOUND THEN
    RAISE NOTICE '✅ Endpoint configurado correctamente: https://cibet.app.n8n.cloud/webhook/uploadfile';
  ELSE
    RAISE EXCEPTION '❌ Error: No se pudo configurar el endpoint';
  END IF;
  
END $$;

-- Mostrar la configuración actual
SELECT 
  project_name,
  api_endpoint,
  theme,
  custom_color,
  CASE 
    WHEN company_logo IS NOT NULL THEN 'Configurado'
    ELSE 'No configurado'
  END as logo_status
FROM user_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
