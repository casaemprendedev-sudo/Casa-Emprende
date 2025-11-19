-- =====================================================
-- COORDINADORES - SCHEMA
-- =====================================================

-- Crear tabla coordinadores solo si no existe
CREATE TABLE IF NOT EXISTS coordinadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  rut VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Agregar campo coordinador_id a tabla ferias (solo si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ferias' AND column_name = 'coordinador_id'
  ) THEN
    ALTER TABLE ferias ADD COLUMN coordinador_id UUID REFERENCES coordinadores(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Índices (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_coordinadores_activo ON coordinadores(activo);
CREATE INDEX IF NOT EXISTS idx_coordinadores_deleted_at ON coordinadores(deleted_at);
CREATE INDEX IF NOT EXISTS idx_ferias_coordinador_id ON ferias(coordinador_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_coordinadores_updated_at ON coordinadores;
CREATE TRIGGER update_coordinadores_updated_at
    BEFORE UPDATE ON coordinadores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE coordinadores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permitir todo por ahora)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'coordinadores' AND policyname = 'Allow all operations on coordinadores'
  ) THEN
    CREATE POLICY "Allow all operations on coordinadores" ON coordinadores
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Comentarios
COMMENT ON TABLE coordinadores IS 'Coordinadores a cargo de las ferias en los centros comerciales';
COMMENT ON COLUMN coordinadores.rut IS 'RUT del coordinador (único)';
COMMENT ON COLUMN coordinadores.activo IS 'Si el coordinador está activo y disponible para asignación';
COMMENT ON COLUMN ferias.coordinador_id IS 'Coordinador asignado a la feria';

-- =====================================================
-- ASISTENCIA DE COORDINADORES
-- =====================================================

-- Crear tabla asistencia_coordinadores solo si no existe
CREATE TABLE IF NOT EXISTS asistencia_coordinadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feria_id UUID NOT NULL REFERENCES ferias(id) ON DELETE CASCADE,
  coordinador_id UUID NOT NULL REFERENCES coordinadores(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  asistio BOOLEAN DEFAULT false,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feria_id, coordinador_id, fecha)
);

-- Índices (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_asistencia_feria_id ON asistencia_coordinadores(feria_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_coordinador_id ON asistencia_coordinadores(coordinador_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_fecha ON asistencia_coordinadores(fecha);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_asistencia_coordinadores_updated_at ON asistencia_coordinadores;
CREATE TRIGGER update_asistencia_coordinadores_updated_at
    BEFORE UPDATE ON asistencia_coordinadores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE asistencia_coordinadores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permitir todo por ahora)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'asistencia_coordinadores' AND policyname = 'Allow all operations on asistencia_coordinadores'
  ) THEN
    CREATE POLICY "Allow all operations on asistencia_coordinadores" ON asistencia_coordinadores
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Comentarios
COMMENT ON TABLE asistencia_coordinadores IS 'Registro de asistencia diaria de coordinadores a las ferias';
COMMENT ON COLUMN asistencia_coordinadores.fecha IS 'Fecha específica de asistencia';
COMMENT ON COLUMN asistencia_coordinadores.asistio IS 'Si el coordinador asistió ese día';
COMMENT ON COLUMN asistencia_coordinadores.observaciones IS 'Notas adicionales sobre la asistencia del día';
