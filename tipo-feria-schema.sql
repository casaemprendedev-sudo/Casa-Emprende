-- =====================================================
-- TIPO DE FERIA - SCHEMA
-- =====================================================

-- Agregar campo tipo_feria a tabla ferias
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ferias' AND column_name = 'tipo_feria'
  ) THEN
    ALTER TABLE ferias ADD COLUMN tipo_feria VARCHAR(20) DEFAULT 'itinerante' CHECK (tipo_feria IN ('fija', 'itinerante'));
  END IF;
END $$;

-- Actualizar todas las ferias existentes como 'itinerante'
UPDATE ferias 
SET tipo_feria = 'itinerante' 
WHERE tipo_feria IS NULL;

-- Agregar índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_ferias_tipo_feria ON ferias(tipo_feria);

-- Comentarios
COMMENT ON COLUMN ferias.tipo_feria IS 'Tipo de feria: fija (permanente en un centro) o itinerante (temporal)';
