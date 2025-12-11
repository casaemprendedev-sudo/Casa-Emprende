-- =====================================================
-- DATOS DE FACTURACIÓN - SCHEMA
-- =====================================================

-- Agregar campos de facturación a tabla emprendimientos (solo si no existen)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'emprendimientos' AND column_name = 'facturacion_rut'
  ) THEN
    ALTER TABLE emprendimientos ADD COLUMN facturacion_rut VARCHAR(50);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'emprendimientos' AND column_name = 'facturacion_razon_social'
  ) THEN
    ALTER TABLE emprendimientos ADD COLUMN facturacion_razon_social VARCHAR(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'emprendimientos' AND column_name = 'facturacion_giro'
  ) THEN
    ALTER TABLE emprendimientos ADD COLUMN facturacion_giro VARCHAR(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'emprendimientos' AND column_name = 'facturacion_direccion'
  ) THEN
    ALTER TABLE emprendimientos ADD COLUMN facturacion_direccion TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'emprendimientos' AND column_name = 'facturacion_comuna'
  ) THEN
    ALTER TABLE emprendimientos ADD COLUMN facturacion_comuna VARCHAR(100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'emprendimientos' AND column_name = 'facturacion_telefono'
  ) THEN
    ALTER TABLE emprendimientos ADD COLUMN facturacion_telefono VARCHAR(50);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'emprendimientos' AND column_name = 'usar_datos_dueno'
  ) THEN
    ALTER TABLE emprendimientos ADD COLUMN usar_datos_dueno BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Comentarios
COMMENT ON COLUMN emprendimientos.facturacion_rut IS 'RUT para facturación (puede ser diferente al RUT del dueño)';
COMMENT ON COLUMN emprendimientos.facturacion_razon_social IS 'Razón social para facturación';
COMMENT ON COLUMN emprendimientos.facturacion_giro IS 'Giro comercial de la empresa';
COMMENT ON COLUMN emprendimientos.facturacion_direccion IS 'Dirección para facturación';
COMMENT ON COLUMN emprendimientos.facturacion_comuna IS 'Comuna para facturación';
COMMENT ON COLUMN emprendimientos.facturacion_telefono IS 'Teléfono de contacto para facturación';
COMMENT ON COLUMN emprendimientos.usar_datos_dueno IS 'Si TRUE, usa los datos del dueño para facturación';
