-- =====================================================
-- CONFIGURACIÓN DE SUPABASE STORAGE
-- =====================================================

-- Crear bucket para comprobantes de pago
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprobantes', 'comprobantes', true);

-- =====================================================
-- POLÍTICAS DE ACCESO AL STORAGE
-- =====================================================

-- Política: Permitir lectura pública de comprobantes
CREATE POLICY "Public Access to Comprobantes"
ON storage.objects FOR SELECT
USING (bucket_id = 'comprobantes');

-- Política: Permitir subida de archivos (usuarios autenticados)
CREATE POLICY "Allow Upload Comprobantes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'comprobantes');

-- Política: Permitir actualización de archivos
CREATE POLICY "Allow Update Comprobantes"
ON storage.objects FOR UPDATE
USING (bucket_id = 'comprobantes');

-- Política: Permitir eliminación de archivos
CREATE POLICY "Allow Delete Comprobantes"
ON storage.objects FOR DELETE
USING (bucket_id = 'comprobantes');
