-- Verificar la estructura real de la tabla user_settings
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
ORDER BY ordinal_position;

-- Mostrar todas las configuraciones existentes
SELECT * FROM user_settings LIMIT 5;
