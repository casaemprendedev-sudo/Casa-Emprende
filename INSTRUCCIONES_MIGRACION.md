# 🚀 Instrucciones de Migración a Supabase

## 📋 Pasos para Ejecutar el Schema

### 1. Acceder a Supabase Dashboard

1. Ir a https://supabase.com/dashboard
2. Seleccionar tu proyecto
3. En el menú lateral, ir a **SQL Editor**

### 2. Ejecutar el Schema

1. Click en **New query**
2. Copiar todo el contenido de `supabase-schema.sql`
3. Pegarlo en el editor
4. Click en **Run** (esquina inferior derecha)

### 3. Verificar Creación de Tablas

1. Ir a **Table Editor** en el menú lateral
2. Deberías ver las siguientes tablas:
   - ✅ centros_comerciales
   - ✅ zonas
   - ✅ categorias_emprendimiento (con 21 categorías)
   - ✅ emprendimientos
   - ✅ contactos
   - ✅ historial_valor_uf
   - ✅ ferias
   - ✅ gastos_feria
   - ✅ historial_estados_feria
   - ✅ items_mobiliario (con 4 items)
   - ✅ participaciones
   - ✅ participacion_mobiliario
   - ✅ abonos

### 4. Verificar Datos Iniciales

#### Categorías de Emprendimiento

En **Table Editor** > **categorias_emprendimiento** deberías ver:

- Ropa y Accesorios
- Joyería y Bisutería
- Artesanía
- ... (21 categorías en total)

#### Items de Mobiliario

En **Table Editor** > **items_mobiliario** deberías ver:

- Estante Negro
- Perchero
- Repisa Sobre Mesa
- Silla

---

## 🔄 Migración de Datos desde localStorage

### Opción 1: Script de Migración Automático (RECOMENDADO)

Ejecutaré un script en la consola del navegador que:

1. Lee datos de localStorage
2. Los transforma al nuevo formato
3. Los inserta en Supabase vía API

### Opción 2: Migración Manual

Si tienes pocos datos, puedes:

1. Exportar datos de localStorage
2. Insertarlos manualmente desde Table Editor
3. Ajustar relaciones (IDs de categorías, etc.)

---

## 📊 Cambios Principales del Modelo

### 1. **Emprendimientos**

**ANTES (localStorage)**:

```javascript
{
  categoria: "Ropa y Accesorios", // String
  contactoPagos: { nombre, correo, telefono } // Objeto embebido
}
```

**DESPUÉS (Supabase)**:

```sql
categoria_id: UUID, -- FK a categorias_emprendimiento
-- contactoPagos ahora en tabla 'contactos' separada
```

### 2. **Ferias**

**ANTES**:

```javascript
{
  gastos: {
    coordinadores, montaje, flete, otros;
  } // Objeto embebido
}
```

**DESPUÉS**:

```sql
-- gastos ahora en tabla 'gastos_feria' separada
-- cada gasto es un registro independiente
```

### 3. **Participaciones**

**ANTES**:

```javascript
{
  mobiliario: { estanteNegro, perchero, ... } // Boolean fields
}
```

**DESPUÉS**:

```sql
-- mobiliario ahora en tabla 'participacion_mobiliario'
-- relación con 'items_mobiliario' con cantidades
```

### 4. **Abonos**

**ANTES**:

```javascript
{
  comprobante: "data:image/png;base64,..."; // Base64 string
}
```

**DESPUÉS**:

```sql
comprobante_url: TEXT -- URL a Supabase Storage
```

---

## ⚙️ Configuración de Supabase Storage (Siguiente Paso)

### Crear Bucket para Comprobantes

```sql
-- En SQL Editor, ejecutar:
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprobantes', 'comprobantes', true);

-- Crear política de acceso
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'comprobantes');

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'comprobantes' AND auth.role() = 'authenticated');
```

---

## 🧪 Testing Recomendado

Después de ejecutar el schema:

1. **Test de Creación**:

   - Crear un centro comercial
   - Crear una zona asociada
   - Verificar relación FK

2. **Test de Categorías**:

   - Listar categorías desde la app
   - Crear emprendimiento con categoría
   - Verificar FK

3. **Test de Contactos**:

   - Crear emprendimiento
   - Agregar múltiples contactos
   - Marcar uno como principal

4. **Test de Histórico UF**:

   - Insertar valor UF del día
   - Consultar desde la app

5. **Test de Gastos**:
   - Crear feria
   - Agregar múltiples gastos
   - Verificar suma total

---

## 🚨 Rollback (en caso de error)

Si algo sale mal, puedes eliminar todas las tablas:

```sql
-- CUIDADO: Esto borra TODO
DROP TABLE IF EXISTS abonos CASCADE;
DROP TABLE IF EXISTS participacion_mobiliario CASCADE;
DROP TABLE IF EXISTS participaciones CASCADE;
DROP TABLE IF EXISTS items_mobiliario CASCADE;
DROP TABLE IF EXISTS historial_estados_feria CASCADE;
DROP TABLE IF EXISTS gastos_feria CASCADE;
DROP TABLE IF EXISTS ferias CASCADE;
DROP TABLE IF EXISTS historial_valor_uf CASCADE;
DROP TABLE IF EXISTS contactos CASCADE;
DROP TABLE IF EXISTS emprendimientos CASCADE;
DROP TABLE IF EXISTS categorias_emprendimiento CASCADE;
DROP TABLE IF EXISTS zonas CASCADE;
DROP TABLE IF EXISTS centros_comerciales CASCADE;
```

Luego puedes volver a ejecutar `supabase-schema.sql`.

---

## ✅ Checklist de Migración

- [ ] Schema ejecutado sin errores
- [ ] 13 tablas creadas
- [ ] 21 categorías insertadas
- [ ] 4 items de mobiliario insertados
- [ ] Triggers funcionando (updated_at)
- [ ] RLS habilitado en todas las tablas
- [ ] Políticas creadas
- [ ] Índices creados
- [ ] Storage bucket configurado

---

¿Listo para continuar con la actualización de los stores?
