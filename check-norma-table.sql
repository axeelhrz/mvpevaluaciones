-- Verificar estructura de la tabla NormaDecil
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'NormaDecil'
ORDER BY ordinal_position;
