-- =====================================================
-- TABLA DE ASISTENCIA DE EMPRENDEDORES
-- =====================================================
-- Esta tabla registra la asistencia diaria de los emprendedores
-- participantes en cada feria, permitiendo al coordinador marcar
-- si llegaron a tiempo y agregar observaciones.

CREATE TABLE IF NOT EXISTS asistencia_emprendedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participacion_id UUID NOT NULL REFERENCES participaciones(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  llego_a_tiempo BOOLEAN DEFAULT false,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  -- Un emprendedor solo puede tener un registro de asistencia por día
  UNIQUE(participacion_id, fecha)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_asistencia_emprendedores_participacion ON asistencia_emprendedores(participacion_id);
CREATE INDEX idx_asistencia_emprendedores_fecha ON asistencia_emprendedores(fecha);

-- Comentarios
COMMENT ON TABLE asistencia_emprendedores IS 'Registro de asistencia diaria de emprendedores en ferias';
COMMENT ON COLUMN asistencia_emprendedores.participacion_id IS 'Referencia a la participación del emprendedor en la feria';
COMMENT ON COLUMN asistencia_emprendedores.fecha IS 'Fecha del día de asistencia';
COMMENT ON COLUMN asistencia_emprendedores.llego_a_tiempo IS 'Indica si el emprendedor llegó puntual';
COMMENT ON COLUMN asistencia_emprendedores.observaciones IS 'Comentarios sobre la asistencia (retrasos, ausencias, etc)';
