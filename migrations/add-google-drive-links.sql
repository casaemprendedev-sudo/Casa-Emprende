-- Migration: Add Google Drive documents table
-- Date: 2025-12-05
-- Description: Creates table to store documents at multiple levels (mall, fair, participation)

-- Create documents table (IF NOT EXISTS handles if table already exists)
CREATE TABLE IF NOT EXISTS documentos_drive (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relaciones opcionales (según el nivel del documento)
  centro_comercial_id UUID REFERENCES centros_comerciales(id) ON DELETE CASCADE,
  feria_id UUID REFERENCES ferias(id) ON DELETE CASCADE,
  participacion_id UUID REFERENCES participaciones(id) ON DELETE CASCADE,
  
  -- Información del documento
  tipo_documento VARCHAR(50) NOT NULL, -- 'Factura', 'Orden de Compra', 'Contrato', etc.
  nombre_archivo TEXT NOT NULL,
  descripcion TEXT,
  
  -- Google Drive info
  drive_file_id TEXT NOT NULL UNIQUE,
  drive_web_view_link TEXT NOT NULL,
  drive_folder_path TEXT, -- Ruta completa de carpetas para referencia
  
  -- Metadata
  fecha_documento DATE, -- Fecha del documento (si aplica)
  fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subido_por UUID,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraint: Al menos una relación debe existir
  CONSTRAINT documento_tiene_relacion CHECK (
    centro_comercial_id IS NOT NULL OR 
    feria_id IS NOT NULL OR 
    participacion_id IS NOT NULL
  )
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_documentos_centro ON documentos_drive(centro_comercial_id) WHERE centro_comercial_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documentos_feria ON documentos_drive(feria_id) WHERE feria_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documentos_participacion ON documentos_drive(participacion_id) WHERE participacion_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos_drive(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_documentos_drive_id ON documentos_drive(drive_file_id);
CREATE INDEX IF NOT EXISTS idx_documentos_fecha ON documentos_drive(fecha_documento) WHERE fecha_documento IS NOT NULL;

-- Add comments
COMMENT ON TABLE documentos_drive IS 'Almacena documentos de Google Drive a nivel de mall, feria o participación';
COMMENT ON COLUMN documentos_drive.centro_comercial_id IS 'ID del mall (para documentos a nivel de mall)';
COMMENT ON COLUMN documentos_drive.feria_id IS 'ID de la feria (para documentos a nivel de feria como órdenes de compra)';
COMMENT ON COLUMN documentos_drive.participacion_id IS 'ID de la participación (para documentos a nivel de emprendedor como facturas)';
COMMENT ON COLUMN documentos_drive.tipo_documento IS 'Tipo: Factura, Orden de Compra, Contrato, etc.';
COMMENT ON COLUMN documentos_drive.nombre_archivo IS 'Nombre original del archivo subido';
COMMENT ON COLUMN documentos_drive.drive_file_id IS 'ID único del archivo en Google Drive';
COMMENT ON COLUMN documentos_drive.drive_web_view_link IS 'URL de visualización en Google Drive';
COMMENT ON COLUMN documentos_drive.drive_folder_path IS 'Ruta de carpetas: Ej: 2025/Mall Arauco/Feria Nov/Emprendedor';

-- Enable RLS
ALTER TABLE documentos_drive ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations (ajustar según necesidades de seguridad)
DROP POLICY IF EXISTS "Enable all for documentos_drive" ON documentos_drive;
CREATE POLICY "Enable all for documentos_drive" ON documentos_drive FOR ALL USING (true);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_documentos_drive_updated_at ON documentos_drive;
CREATE TRIGGER update_documentos_drive_updated_at 
  BEFORE UPDATE ON documentos_drive
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- FACTURAS TABLE
-- ===================================================================
-- Create table to register invoice data for reporting
CREATE TABLE IF NOT EXISTS facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relaciones
  emprendimiento_id UUID NOT NULL REFERENCES emprendimientos(id) ON DELETE CASCADE,
  participacion_id UUID REFERENCES participaciones(id) ON DELETE SET NULL,
  feria_id UUID REFERENCES ferias(id) ON DELETE SET NULL,
  centro_comercial_id UUID REFERENCES centros_comerciales(id) ON DELETE SET NULL,
  
  -- Datos de la factura
  numero_factura VARCHAR(100) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha_factura DATE NOT NULL,
  
  -- Información adicional
  descripcion TEXT,
  estado VARCHAR(50) DEFAULT 'Pendiente', -- Pendiente, Pagada, Anulada
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraint: Número de factura único por emprendimiento
  CONSTRAINT unique_factura_por_emprendimiento UNIQUE (emprendimiento_id, numero_factura)
);

-- Indexes for facturas
CREATE INDEX IF NOT EXISTS idx_facturas_emprendimiento ON facturas(emprendimiento_id);
CREATE INDEX IF NOT EXISTS idx_facturas_participacion ON facturas(participacion_id) WHERE participacion_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_facturas_feria ON facturas(feria_id) WHERE feria_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_facturas_centro ON facturas(centro_comercial_id) WHERE centro_comercial_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);

-- Comments
COMMENT ON TABLE facturas IS 'Registro de facturas de emprendedores para reportes';
COMMENT ON COLUMN facturas.emprendimiento_id IS 'ID del emprendimiento (requerido)';
COMMENT ON COLUMN facturas.numero_factura IS 'Número de factura';
COMMENT ON COLUMN facturas.monto IS 'Monto total de la factura';
COMMENT ON COLUMN facturas.fecha_factura IS 'Fecha de emisión de la factura';
COMMENT ON COLUMN facturas.estado IS 'Estado: Pendiente, Pagada, Anulada';

-- Enable RLS
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

-- Create policy
DROP POLICY IF EXISTS "Enable all for facturas" ON facturas;
CREATE POLICY "Enable all for facturas" ON facturas FOR ALL USING (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_facturas_updated_at ON facturas;
CREATE TRIGGER update_facturas_updated_at 
  BEFORE UPDATE ON facturas
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- ÓRDENES DE COMPRA TABLE
-- ===================================================================
-- Create table to register purchase orders for reporting
CREATE TABLE IF NOT EXISTS ordenes_compra (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relaciones
  feria_id UUID NOT NULL REFERENCES ferias(id) ON DELETE CASCADE,
  centro_comercial_id UUID NOT NULL REFERENCES centros_comerciales(id) ON DELETE CASCADE,
  
  -- Datos de la orden de compra
  numero_oc VARCHAR(100) NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha_oc DATE NOT NULL,
  
  -- Información adicional
  proveedor VARCHAR(255),
  descripcion TEXT,
  estado VARCHAR(50) DEFAULT 'Pendiente', -- Pendiente, Aprobada, Rechazada, Pagada
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraint: Número de OC único por feria
  CONSTRAINT unique_oc_por_feria UNIQUE (feria_id, numero_oc)
);

-- Indexes for ordenes_compra
CREATE INDEX IF NOT EXISTS idx_ordenes_feria ON ordenes_compra(feria_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_centro ON ordenes_compra(centro_comercial_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha ON ordenes_compra(fecha_oc);
CREATE INDEX IF NOT EXISTS idx_ordenes_numero ON ordenes_compra(numero_oc);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes_compra(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_proveedor ON ordenes_compra(proveedor) WHERE proveedor IS NOT NULL;

-- Comments
COMMENT ON TABLE ordenes_compra IS 'Registro de órdenes de compra de ferias para reportes';
COMMENT ON COLUMN ordenes_compra.feria_id IS 'ID de la feria (requerido)';
COMMENT ON COLUMN ordenes_compra.numero_oc IS 'Número de orden de compra';
COMMENT ON COLUMN ordenes_compra.monto IS 'Monto total de la orden';
COMMENT ON COLUMN ordenes_compra.fecha_oc IS 'Fecha de emisión de la OC';
COMMENT ON COLUMN ordenes_compra.proveedor IS 'Nombre del proveedor';
COMMENT ON COLUMN ordenes_compra.estado IS 'Estado: Pendiente, Aprobada, Rechazada, Pagada';

-- Enable RLS
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;

-- Create policy
DROP POLICY IF EXISTS "Enable all for ordenes_compra" ON ordenes_compra;
CREATE POLICY "Enable all for ordenes_compra" ON ordenes_compra FOR ALL USING (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_ordenes_compra_updated_at ON ordenes_compra;
CREATE TRIGGER update_ordenes_compra_updated_at 
  BEFORE UPDATE ON ordenes_compra
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- LINK DOCUMENTS TO FACTURAS AND ORDENES
-- ===================================================================
-- First, drop the view if it exists to avoid conflicts
DROP VIEW IF EXISTS documentos_por_mall;

-- Add optional foreign keys to documentos_drive to link with facturas/ordenes
ALTER TABLE documentos_drive 
  ADD COLUMN IF NOT EXISTS factura_id UUID REFERENCES facturas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS orden_compra_id UUID REFERENCES ordenes_compra(id) ON DELETE SET NULL;

-- Recreate the view with the new columns
CREATE OR REPLACE VIEW documentos_por_mall AS
SELECT 
  d.*,
  cc.nombre as mall_nombre,
  f.nombre as feria_nombre,
  e.nombre_emprendimiento,
  e.nombre_emprendedor
FROM documentos_drive d
LEFT JOIN centros_comerciales cc ON d.centro_comercial_id = cc.id
LEFT JOIN ferias f ON d.feria_id = f.id
LEFT JOIN participaciones p ON d.participacion_id = p.id
LEFT JOIN emprendimientos e ON p.emprendimiento_id = e.id;

-- Indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_documentos_factura ON documentos_drive(factura_id) WHERE factura_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documentos_orden ON documentos_drive(orden_compra_id) WHERE orden_compra_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN documentos_drive.factura_id IS 'ID de la factura asociada (si aplica)';
COMMENT ON COLUMN documentos_drive.orden_compra_id IS 'ID de la orden de compra asociada (si aplica)';

-- ===================================================================
-- REPORTING VIEWS
-- ===================================================================
-- View for invoice reports with all related data
CREATE OR REPLACE VIEW reporte_facturas AS
SELECT 
  f.*,
  e.nombre_emprendimiento,
  e.nombre_emprendedor,
  e.rut as emprendedor_rut,
  e.email as emprendedor_email,
  e.telefono as emprendedor_telefono,
  fer.nombre as feria_nombre,
  fer.fecha_inicio as feria_fecha_inicio,
  fer.fecha_fin as feria_fecha_fin,
  cc.nombre as mall_nombre,
  COUNT(d.id) as documentos_adjuntos
FROM facturas f
INNER JOIN emprendimientos e ON f.emprendimiento_id = e.id
LEFT JOIN participaciones p ON f.participacion_id = p.id
LEFT JOIN ferias fer ON f.feria_id = fer.id
LEFT JOIN centros_comerciales cc ON f.centro_comercial_id = cc.id
LEFT JOIN documentos_drive d ON d.factura_id = f.id
GROUP BY f.id, e.id, fer.id, cc.id;

COMMENT ON VIEW reporte_facturas IS 'Vista completa de facturas con datos de emprendedor, feria y mall para reportes';

-- View for purchase order reports with all related data
CREATE OR REPLACE VIEW reporte_ordenes_compra AS
SELECT 
  o.*,
  f.nombre as feria_nombre,
  f.fecha_inicio as feria_fecha_inicio,
  f.fecha_fin as feria_fecha_fin,
  cc.nombre as mall_nombre,
  COUNT(d.id) as documentos_adjuntos
FROM ordenes_compra o
INNER JOIN ferias f ON o.feria_id = f.id
INNER JOIN centros_comerciales cc ON o.centro_comercial_id = cc.id
LEFT JOIN documentos_drive d ON d.orden_compra_id = o.id
GROUP BY o.id, f.id, cc.id;

COMMENT ON VIEW reporte_ordenes_compra IS 'Vista completa de órdenes de compra con datos de feria y mall para reportes';
