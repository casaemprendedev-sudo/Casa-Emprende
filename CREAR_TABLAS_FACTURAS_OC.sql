-- ============================================
-- MIGRACIÓN: Tablas para Facturas, Órdenes de Compra y Documentos Drive
-- ============================================
-- Propósito: Crear las tablas necesarias para gestión de documentos financieros
-- Fecha: 2024
-- Ejecutar en: Supabase SQL Editor
-- ============================================

-- TABLA: facturas
-- Gestión de facturas emitidas a emprendimientos
CREATE TABLE IF NOT EXISTS facturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emprendimiento_id UUID NOT NULL REFERENCES emprendimientos(id) ON DELETE CASCADE,
  feria_id UUID REFERENCES ferias(id) ON DELETE SET NULL,
  participacion_id UUID REFERENCES participaciones(id) ON DELETE SET NULL,
  numero_factura VARCHAR(100) NOT NULL UNIQUE,
  monto DECIMAL(12,2) NOT NULL CHECK (monto >= 0),
  fecha_factura DATE NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Pagada', 'Anulada')),
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para facturas
CREATE INDEX IF NOT EXISTS idx_facturas_emprendimiento ON facturas(emprendimiento_id);
CREATE INDEX IF NOT EXISTS idx_facturas_feria ON facturas(feria_id);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero_factura);

-- TABLA: ordenes_compra
-- Gestión de órdenes de compra para ferias
CREATE TABLE IF NOT EXISTS ordenes_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feria_id UUID NOT NULL REFERENCES ferias(id) ON DELETE CASCADE,
  centro_comercial_id UUID NOT NULL REFERENCES centros_comerciales(id) ON DELETE CASCADE,
  numero_oc VARCHAR(100) NOT NULL UNIQUE,
  monto DECIMAL(12,2) NOT NULL CHECK (monto >= 0),
  proveedor VARCHAR(255),
  fecha_oc DATE NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Aprobada', 'Rechazada', 'Pagada', 'Anulada')),
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para ordenes_compra
CREATE INDEX IF NOT EXISTS idx_ordenes_feria ON ordenes_compra(feria_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_centro ON ordenes_compra(centro_comercial_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha ON ordenes_compra(fecha_oc);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes_compra(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_numero ON ordenes_compra(numero_oc);

-- TABLA: documentos_drive
-- Enlaces a archivos de Google Drive vinculados a diferentes entidades
CREATE TABLE IF NOT EXISTS documentos_drive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_documento VARCHAR(100) NOT NULL,
  drive_file_id VARCHAR(255) NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  url_drive TEXT NOT NULL,
  
  -- Vínculos opcionales a diferentes entidades (al menos uno requerido)
  centro_comercial_id UUID REFERENCES centros_comerciales(id) ON DELETE CASCADE,
  feria_id UUID REFERENCES ferias(id) ON DELETE CASCADE,
  participacion_id UUID REFERENCES participaciones(id) ON DELETE CASCADE,
  factura_id UUID REFERENCES facturas(id) ON DELETE CASCADE,
  orden_compra_id UUID REFERENCES ordenes_compra(id) ON DELETE CASCADE,
  
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Validación: al menos una FK debe estar presente
  CONSTRAINT check_at_least_one_relation CHECK (
    centro_comercial_id IS NOT NULL OR
    feria_id IS NOT NULL OR
    participacion_id IS NOT NULL OR
    factura_id IS NOT NULL OR
    orden_compra_id IS NOT NULL
  )
);

-- Índices para documentos_drive
CREATE INDEX IF NOT EXISTS idx_docs_centro ON documentos_drive(centro_comercial_id);
CREATE INDEX IF NOT EXISTS idx_docs_feria ON documentos_drive(feria_id);
CREATE INDEX IF NOT EXISTS idx_docs_participacion ON documentos_drive(participacion_id);
CREATE INDEX IF NOT EXISTS idx_docs_factura ON documentos_drive(factura_id);
CREATE INDEX IF NOT EXISTS idx_docs_orden ON documentos_drive(orden_compra_id);
CREATE INDEX IF NOT EXISTS idx_docs_tipo ON documentos_drive(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_docs_drive_file ON documentos_drive(drive_file_id);

-- ============================================
-- TRIGGERS para updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_facturas_updated_at ON facturas;
CREATE TRIGGER update_facturas_updated_at
  BEFORE UPDATE ON facturas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ordenes_compra_updated_at ON ordenes_compra;
CREATE TRIGGER update_ordenes_compra_updated_at
  BEFORE UPDATE ON ordenes_compra
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documentos_drive_updated_at ON documentos_drive;
CREATE TRIGGER update_documentos_drive_updated_at
  BEFORE UPDATE ON documentos_drive
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_drive ENABLE ROW LEVEL SECURITY;

-- Políticas para facturas (acceso completo para usuarios autenticados)
DROP POLICY IF EXISTS "Usuarios pueden ver facturas" ON facturas;
CREATE POLICY "Usuarios pueden ver facturas"
  ON facturas FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuarios pueden crear facturas" ON facturas;
CREATE POLICY "Usuarios pueden crear facturas"
  ON facturas FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios pueden actualizar facturas" ON facturas;
CREATE POLICY "Usuarios pueden actualizar facturas"
  ON facturas FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuarios pueden eliminar facturas" ON facturas;
CREATE POLICY "Usuarios pueden eliminar facturas"
  ON facturas FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para ordenes_compra
DROP POLICY IF EXISTS "Usuarios pueden ver órdenes" ON ordenes_compra;
CREATE POLICY "Usuarios pueden ver órdenes"
  ON ordenes_compra FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuarios pueden crear órdenes" ON ordenes_compra;
CREATE POLICY "Usuarios pueden crear órdenes"
  ON ordenes_compra FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios pueden actualizar órdenes" ON ordenes_compra;
CREATE POLICY "Usuarios pueden actualizar órdenes"
  ON ordenes_compra FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuarios pueden eliminar órdenes" ON ordenes_compra;
CREATE POLICY "Usuarios pueden eliminar órdenes"
  ON ordenes_compra FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para documentos_drive
DROP POLICY IF EXISTS "Usuarios pueden ver documentos" ON documentos_drive;
CREATE POLICY "Usuarios pueden ver documentos"
  ON documentos_drive FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuarios pueden crear documentos" ON documentos_drive;
CREATE POLICY "Usuarios pueden crear documentos"
  ON documentos_drive FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios pueden actualizar documentos" ON documentos_drive;
CREATE POLICY "Usuarios pueden actualizar documentos"
  ON documentos_drive FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Usuarios pueden eliminar documentos" ON documentos_drive;
CREATE POLICY "Usuarios pueden eliminar documentos"
  ON documentos_drive FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- VERIFICACIÓN DE INSTALACIÓN
-- ============================================
-- Ejecutar esta query después de crear las tablas para verificar:

SELECT 
  'facturas' as tabla,
  count(*) as total_registros
FROM facturas
UNION ALL
SELECT 
  'ordenes_compra',
  count(*)
FROM ordenes_compra
UNION ALL
SELECT 
  'documentos_drive',
  count(*)
FROM documentos_drive;

-- ============================================
-- INSTRUCCIONES DE USO:
-- ============================================
-- 1. Copiar todo este script
-- 2. Ir a Supabase Dashboard > SQL Editor
-- 3. Pegar el script completo
-- 4. Ejecutar (Run)
-- 5. Verificar que las 3 tablas se crearon correctamente
-- 6. Las tablas estarán listas para usar desde la aplicación Vue
-- ============================================
