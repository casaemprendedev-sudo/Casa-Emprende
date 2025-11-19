-- =====================================================
-- CASA EMPRENDE - SUPABASE DATABASE SCHEMA (MEJORADO)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CENTROS COMERCIALES
-- =====================================================
CREATE TABLE centros_comerciales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 2. ZONAS
-- =====================================================
CREATE TABLE zonas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centro_comercial_id UUID NOT NULL REFERENCES centros_comerciales(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  capacidad_maxima INTEGER,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 3. CATEGORÍAS DE EMPRENDIMIENTO
-- =====================================================
CREATE TABLE categorias_emprendimiento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  orden INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. EMPRENDIMIENTOS
-- =====================================================
CREATE TABLE emprendimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_emprendedor VARCHAR(255) NOT NULL,
  rut VARCHAR(50),
  email VARCHAR(255),
  telefono VARCHAR(50),
  nombre_emprendimiento VARCHAR(255) NOT NULL,
  categoria_id UUID REFERENCES categorias_emprendimiento(id) ON DELETE SET NULL,
  descripcion TEXT,
  instagram VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 5. CONTACTOS (para emprendimientos)
-- =====================================================
CREATE TABLE contactos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emprendimiento_id UUID NOT NULL REFERENCES emprendimientos(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'principal', 'pagos', 'emergencia'
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  email VARCHAR(255),
  es_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. HISTÓRICO DE VALOR UF
-- =====================================================
CREATE TABLE historial_valor_uf (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE UNIQUE NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. FERIAS
-- =====================================================
CREATE TABLE ferias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  centro_comercial_id UUID NOT NULL REFERENCES centros_comerciales(id) ON DELETE RESTRICT,
  zona_id UUID REFERENCES zonas(id) ON DELETE SET NULL,
  limite_puestos INTEGER,
  precio_base_puesto DECIMAL(10,2),
  moneda VARCHAR(10) DEFAULT 'CLP',
  valor_uf DECIMAL(10,2), -- Valor UF al momento de creación (cache)
  estado VARCHAR(50) DEFAULT 'Planificada',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 8. GASTOS DE FERIA
-- =====================================================
CREATE TABLE gastos_feria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feria_id UUID NOT NULL REFERENCES ferias(id) ON DELETE CASCADE,
  categoria VARCHAR(100) NOT NULL, -- 'coordinadores', 'montaje', 'flete', 'otros'
  descripcion TEXT,
  monto DECIMAL(10,2) NOT NULL,
  fecha DATE,
  comprobante_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. HISTÓRICO DE ESTADOS DE FERIA
-- =====================================================
CREATE TABLE historial_estados_feria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feria_id UUID NOT NULL REFERENCES ferias(id) ON DELETE CASCADE,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50) NOT NULL,
  fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario_id UUID,
  notas TEXT
);

-- =====================================================
-- 10. ITEMS DE MOBILIARIO (catálogo)
-- =====================================================
CREATE TABLE items_mobiliario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. PARTICIPACIONES
-- =====================================================
CREATE TABLE participaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feria_id UUID NOT NULL REFERENCES ferias(id) ON DELETE CASCADE,
  emprendimiento_id UUID NOT NULL REFERENCES emprendimientos(id) ON DELETE CASCADE,
  numero_puesto VARCHAR(50),
  precio_base DECIMAL(10,2),
  descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
  descuento_monto DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2),
  cargo_mobiliario DECIMAL(10,2) DEFAULT 0,
  precio_neto DECIMAL(10,2),
  iva DECIMAL(10,2),
  total DECIMAL(10,2),
  monto_final DECIMAL(10,2),
  monto_pagado DECIMAL(10,2) DEFAULT 0,
  estado_pago VARCHAR(50) DEFAULT 'Pendiente',
  mobiliario_extra TEXT, -- Descripción libre de mobiliario adicional
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(feria_id, numero_puesto)
);

-- =====================================================
-- 12. PARTICIPACIÓN - MOBILIARIO (tabla intermedia)
-- =====================================================
CREATE TABLE participacion_mobiliario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participacion_id UUID NOT NULL REFERENCES participaciones(id) ON DELETE CASCADE,
  item_mobiliario_id UUID NOT NULL REFERENCES items_mobiliario(id) ON DELETE RESTRICT,
  cantidad INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. ABONOS
-- =====================================================
CREATE TABLE abonos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participacion_id UUID NOT NULL REFERENCES participaciones(id) ON DELETE CASCADE,
  numero_abono INTEGER NOT NULL,
  fecha DATE NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  banco VARCHAR(255),
  numero_operacion VARCHAR(255),
  comprobante_url TEXT, -- URL a Supabase Storage
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_zonas_centro ON zonas(centro_comercial_id);
CREATE INDEX idx_emprendimientos_categoria ON emprendimientos(categoria_id);
CREATE INDEX idx_emprendimientos_activo ON emprendimientos(activo) WHERE deleted_at IS NULL;
CREATE INDEX idx_contactos_emprendimiento ON contactos(emprendimiento_id);
CREATE INDEX idx_contactos_principal ON contactos(emprendimiento_id, es_principal);
CREATE INDEX idx_historial_uf_fecha ON historial_valor_uf(fecha);
CREATE INDEX idx_ferias_centro ON ferias(centro_comercial_id);
CREATE INDEX idx_ferias_zona ON ferias(zona_id);
CREATE INDEX idx_ferias_estado ON ferias(estado) WHERE deleted_at IS NULL;
CREATE INDEX idx_gastos_feria ON gastos_feria(feria_id);
CREATE INDEX idx_historial_estados_feria ON historial_estados_feria(feria_id);
CREATE INDEX idx_participaciones_feria ON participaciones(feria_id);
CREATE INDEX idx_participaciones_emprendimiento ON participaciones(emprendimiento_id);
CREATE INDEX idx_participacion_mobiliario_participacion ON participacion_mobiliario(participacion_id);
CREATE INDEX idx_abonos_participacion ON abonos(participacion_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_centros_comerciales_updated_at BEFORE UPDATE ON centros_comerciales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zonas_updated_at BEFORE UPDATE ON zonas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_emprendimiento_updated_at BEFORE UPDATE ON categorias_emprendimiento
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emprendimientos_updated_at BEFORE UPDATE ON emprendimientos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contactos_updated_at BEFORE UPDATE ON contactos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ferias_updated_at BEFORE UPDATE ON ferias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_feria_updated_at BEFORE UPDATE ON gastos_feria
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_mobiliario_updated_at BEFORE UPDATE ON items_mobiliario
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participaciones_updated_at BEFORE UPDATE ON participaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_abonos_updated_at BEFORE UPDATE ON abonos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: Registrar cambios de estado de feria
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_cambio_estado_feria()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO historial_estados_feria (feria_id, estado_anterior, estado_nuevo, fecha_cambio)
    VALUES (NEW.id, OLD.estado, NEW.estado, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrar_cambio_estado_feria
  AFTER UPDATE ON ferias
  FOR EACH ROW
  EXECUTE FUNCTION registrar_cambio_estado_feria();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE centros_comerciales ENABLE ROW LEVEL SECURITY;
ALTER TABLE zonas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_emprendimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE emprendimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_valor_uf ENABLE ROW LEVEL SECURITY;
ALTER TABLE ferias ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_feria ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_estados_feria ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_mobiliario ENABLE ROW LEVEL SECURITY;
ALTER TABLE participaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE participacion_mobiliario ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonos ENABLE ROW LEVEL SECURITY;

-- Policies (open for now, restrict later based on auth)
CREATE POLICY "Enable all for centros_comerciales" ON centros_comerciales FOR ALL USING (true);
CREATE POLICY "Enable all for zonas" ON zonas FOR ALL USING (true);
CREATE POLICY "Enable all for categorias_emprendimiento" ON categorias_emprendimiento FOR ALL USING (true);
CREATE POLICY "Enable all for emprendimientos" ON emprendimientos FOR ALL USING (true);
CREATE POLICY "Enable all for contactos" ON contactos FOR ALL USING (true);
CREATE POLICY "Enable all for historial_valor_uf" ON historial_valor_uf FOR ALL USING (true);
CREATE POLICY "Enable all for ferias" ON ferias FOR ALL USING (true);
CREATE POLICY "Enable all for gastos_feria" ON gastos_feria FOR ALL USING (true);
CREATE POLICY "Enable all for historial_estados_feria" ON historial_estados_feria FOR ALL USING (true);
CREATE POLICY "Enable all for items_mobiliario" ON items_mobiliario FOR ALL USING (true);
CREATE POLICY "Enable all for participaciones" ON participaciones FOR ALL USING (true);
CREATE POLICY "Enable all for participacion_mobiliario" ON participacion_mobiliario FOR ALL USING (true);
CREATE POLICY "Enable all for abonos" ON abonos FOR ALL USING (true);

-- =====================================================
-- DATOS INICIALES: Categorías de Emprendimiento
-- =====================================================
INSERT INTO categorias_emprendimiento (nombre, orden) VALUES
  ('Ropa y Accesorios', 1),
  ('Joyería y Bisutería', 2),
  ('Artesanía', 3),
  ('Decoración', 4),
  ('Alimentos', 5),
  ('Bebidas', 6),
  ('Belleza y Cosmética', 7),
  ('Salud y Bienestar', 8),
  ('Juguetes', 9),
  ('Libros y Papelería', 10),
  ('Tecnología', 11),
  ('Arte', 12),
  ('Fotografía', 13),
  ('Plantas y Jardinería', 14),
  ('Mascotas', 15),
  ('Deportes', 16),
  ('Música', 17),
  ('Vintage y Antigüedades', 18),
  ('Sustentabilidad', 19),
  ('Servicios', 20),
  ('Otros', 21);

-- =====================================================
-- DATOS INICIALES: Items de Mobiliario
-- =====================================================
INSERT INTO items_mobiliario (nombre, descripcion, precio) VALUES
  ('Estante Negro', 'Estante negro estándar para exhibición', 0),
  ('Perchero', 'Perchero para colgar prendas', 0),
  ('Repisa Sobre Mesa', 'Repisa adicional para colocar sobre mesa', 0),
  ('Silla', 'Silla para el emprendedor', 0);
