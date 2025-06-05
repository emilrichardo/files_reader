-- Arreglar el constraint de style_mode para permitir valores correctos
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_style_mode_check;

-- Agregar el constraint correcto
ALTER TABLE user_settings ADD CONSTRAINT user_settings_style_mode_check 
CHECK (style_mode IN ('flat', 'soft', 'glass'));

-- Verificar que la tabla esté correcta
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND column_name = 'style_mode';
