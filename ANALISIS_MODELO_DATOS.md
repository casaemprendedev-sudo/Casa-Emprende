# Análisis del Modelo de Datos - Casa Emprende

## 📊 MODELO ACTUAL

### 1. **Centros Comerciales**

```javascript
{
  id, nombre, direccion, telefono, email, created_at, updated_at;
}
```

### 2. **Zonas**

```javascript
{
  id,
    centro_comercial_id,
    nombre,
    capacidad_maxima,
    descripcion,
    created_at,
    updated_at;
}
```

### 3. **Emprendimientos**

```javascript
{
  id, nombreEmprendimiento, categoria,
  nombreEmprendedor, rut, correo, telefono,
  contactoPagos: { nombre, correo, telefono },
  instagram, activo,
  created_at, updated_at
}
```

### 4. **Ferias**

```javascript
{
  id, nombre, fechaInicio, fechaFin,
  centroComercialId, zonaId, limitePuestos,
  precioBasePuesto, moneda, valorUF, estado,
  gastos: { coordinadores, montaje, flete, otros },
  notas,
  created_at, updated_at
}
```

### 5. **Participaciones**

```javascript
{
  id, feriaId, emprendimientoId, numeroPuesto,
  mobiliario: { estanteNegro, perchero, repisaSobreMesa, silla },
  mobiliarioExtra, descuento,
  precioNeto, iva, total, montoFinal,
  montoPagado, estadoPago, observaciones,
  created_at, updated_at
}
```

### 6. **Abonos**

```javascript
{
  id,
    participacionId,
    numeroAbono,
    fecha,
    monto,
    banco,
    numeroOperacion,
    comprobante,
    notas,
    created_at,
    updated_at;
}
```

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 CRÍTICOS

1. **Emprendimientos - Estructura de Contactos**

   - **Problema**: `contactoPagos` es un JSON embebido
   - **Riesgo**: Si necesitas contactos múltiples, buscar por contacto, o reportes por contacto
   - **Impacto**: Dificulta queries y reportes

2. **Ferias - Gastos Embebidos**

   - **Problema**: `gastos` es un JSON con categorías fijas
   - **Riesgo**: No escalable si necesitas agregar nuevas categorías de gastos
   - **Impacto**: Requiere migración de datos cada vez que cambien categorías

3. **Participaciones - Mobiliario**

   - **Problema**: Mobiliario con campos booleanos fijos
   - **Riesgo**: Si el mobiliario disponible cambia, necesitas alterar el esquema
   - **Impacto**: Poca flexibilidad

4. **Moneda y UF**
   - **Problema**: `valorUF` solo en ferias, no hay histórico
   - **Riesgo**: Si la UF cambia durante una feria, no hay trazabilidad
   - **Impacto**: Cálculos incorrectos en reportes históricos

### 🟡 MODERADOS

5. **Estados de Feria**

   - **Problema**: Estados hardcodeados sin timestamps de transición
   - **Riesgo**: No sabes CUÁNDO cambió el estado
   - **Impacto**: Dificulta auditorías y reportes temporales

6. **Numeración de Puestos**

   - **Problema**: `numeroPuesto` es string libre
   - **Riesgo**: Duplicados, inconsistencias en formato
   - **Impacto**: Dificulta organización espacial

7. **Comprobantes de Pago**
   - **Problema**: Comprobante como base64 en texto
   - **Riesgo**: Base de datos pesada, difícil manejo de archivos
   - **Impacto**: Performance y escalabilidad

### 🟢 MENORES

8. **Falta de Auditoría**

   - No hay registro de quién creó/modificó registros
   - No hay soft deletes (eliminación lógica)

9. **Categorías de Emprendimientos**

   - Lista hardcodeada en código, debería estar en BD

10. **Relaciones de Integridad**
    - Faltan constraints ON DELETE CASCADE/RESTRICT claros

---

## ✅ MODELO MEJORADO PROPUESTO

### **Cambios Estructurales**

#### 1. **Nueva tabla: `contactos`**

```sql
CREATE TABLE contactos (
  id UUID PRIMARY KEY,
  emprendimiento_id UUID REFERENCES emprendimientos(id),
  tipo VARCHAR(50), -- 'principal', 'pagos', 'emergencia'
  nombre VARCHAR(255),
  telefono VARCHAR(50),
  email VARCHAR(255),
  es_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Beneficio**: Múltiples contactos por emprendimiento, búsquedas eficientes

#### 2. **Nueva tabla: `gastos_feria`**

```sql
CREATE TABLE gastos_feria (
  id UUID PRIMARY KEY,
  feria_id UUID REFERENCES ferias(id),
  categoria VARCHAR(100), -- 'coordinadores', 'montaje', 'flete', etc.
  descripcion TEXT,
  monto DECIMAL(10,2),
  fecha DATE,
  comprobante_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Beneficio**: Gastos ilimitados, categorizables, con documentación

#### 3. **Nueva tabla: `items_mobiliario`**

```sql
CREATE TABLE items_mobiliario (
  id UUID PRIMARY KEY,
  nombre VARCHAR(100), -- 'Estante Negro', 'Perchero', etc.
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);

CREATE TABLE participacion_mobiliario (
  id UUID PRIMARY KEY,
  participacion_id UUID REFERENCES participaciones(id),
  item_mobiliario_id UUID REFERENCES items_mobiliario(id),
  cantidad INTEGER DEFAULT 1,
  created_at TIMESTAMP
);
```

**Beneficio**: Mobiliario dinámico, cantidades, fácil agregar nuevos items

#### 4. **Nueva tabla: `historial_valor_uf`**

```sql
CREATE TABLE historial_valor_uf (
  id UUID PRIMARY KEY,
  fecha DATE UNIQUE NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP
);
```

**Beneficio**: Histórico completo, cálculos precisos en cualquier fecha

#### 5. **Nueva tabla: `historial_estados_feria`**

```sql
CREATE TABLE historial_estados_feria (
  id UUID PRIMARY KEY,
  feria_id UUID REFERENCES ferias(id),
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50) NOT NULL,
  fecha_cambio TIMESTAMP DEFAULT NOW(),
  usuario_id UUID, -- futuro: quien hizo el cambio
  notas TEXT
);
```

**Beneficio**: Trazabilidad completa de cambios de estado

#### 6. **Nueva tabla: `categorias_emprendimiento`**

```sql
CREATE TABLE categorias_emprendimiento (
  id UUID PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  orden INTEGER,
  created_at TIMESTAMP
);
```

**Beneficio**: Categorías administrables desde la app

#### 7. **Actualización tabla `participaciones`**

```sql
-- Eliminar campos de mobiliario (mover a tabla intermedia)
-- Agregar campos:
ALTER TABLE participaciones ADD COLUMN precio_base DECIMAL(10,2);
ALTER TABLE participaciones ADD COLUMN descuento_porcentaje DECIMAL(5,2);
ALTER TABLE participaciones ADD COLUMN descuento_monto DECIMAL(10,2);
ALTER TABLE participaciones ADD COLUMN subtotal DECIMAL(10,2);
ALTER TABLE participaciones ADD COLUMN cargo_mobiliario DECIMAL(10,2);
```

#### 8. **Actualización tabla `abonos`**

```sql
-- Usar storage de Supabase para comprobantes
ALTER TABLE abonos ADD COLUMN comprobante_url TEXT;
ALTER TABLE abonos DROP COLUMN comprobante; -- eliminar base64
```

#### 9. **Campos de Auditoría (todas las tablas)**

```sql
ALTER TABLE [tabla] ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE [tabla] ADD COLUMN updated_by UUID REFERENCES auth.users(id);
ALTER TABLE [tabla] ADD COLUMN deleted_at TIMESTAMP; -- soft delete
```

---

## 🎯 NOMENCLATURA Y CONVENCIONES

### **Reglas a Seguir**

1. **Nombres de Tablas**: snake_case, plural

   - ✅ `centros_comerciales`, `participaciones`
   - ❌ `CentrosComerciales`, `participacion`

2. **Nombres de Columnas**: snake_case

   - ✅ `centro_comercial_id`, `fecha_inicio`
   - ❌ `centroComercialId`, `fechaInicio`

3. **Foreign Keys**: `tabla_singular_id`

   - ✅ `centro_comercial_id`, `emprendimiento_id`
   - ❌ `centro_id`, `id_emprendimiento`

4. **IDs**: UUID en lugar de incrementales

   - ✅ Más seguros, distribuidos
   - ❌ Integers son predecibles

5. **Timestamps**: Siempre con timezone

   - ✅ `TIMESTAMP WITH TIME ZONE`
   - ❌ `TIMESTAMP` sin timezone

6. **Montos**: DECIMAL(10,2)

   - ✅ Precisión exacta
   - ❌ FLOAT (errores de redondeo)

7. **Campos Booleanos**: Prefijo `es_` o `tiene_`
   - ✅ `es_principal`, `tiene_descuento`
   - ❌ `principal`, `descuento`

---

## 📋 COMPARACIÓN: ANTES vs DESPUÉS

### **Escalabilidad**

| Aspecto                      | Antes            | Después          |
| ---------------------------- | ---------------- | ---------------- |
| Contactos por emprendimiento | 2 fijos          | Ilimitados       |
| Tipos de gastos              | 4 fijos          | Ilimitados       |
| Items de mobiliario          | 4 fijos          | Ilimitados       |
| Histórico de UF              | No existe        | Completo         |
| Cambios de estado            | Sin trazabilidad | Trazado completo |
| Categorías                   | Hardcoded        | BD administrable |

### **Integridad**

| Aspecto       | Antes       | Después               |
| ------------- | ----------- | --------------------- |
| Foreign Keys  | Básicos     | Completos con CASCADE |
| Eliminaciones | Hard delete | Soft delete           |
| Auditoría     | No          | Quién y cuándo        |
| Validaciones  | En app      | En BD + App           |

### **Performance**

| Aspecto           | Antes        | Después           |
| ----------------- | ------------ | ----------------- |
| Búsquedas en JSON | Lentas       | Índices en tablas |
| Comprobantes      | Base64 en BD | URLs (storage)    |
| Queries complejos | Difíciles    | Joins eficientes  |

---

## 🚀 PLAN DE MIGRACIÓN RECOMENDADO

### **Fase 1: Tablas Base (Día 1)**

1. Crear tablas principales con estructura mejorada
2. Migrar datos actuales
3. Probar CRUD básico

### **Fase 2: Tablas Relacionales (Día 2-3)**

4. Crear `contactos`, `categorias_emprendimiento`
5. Crear `items_mobiliario`, `participacion_mobiliario`
6. Migrar datos de JSON a tablas

### **Fase 3: Históricos y Auditoría (Día 4)**

7. Crear `historial_valor_uf`, `historial_estados_feria`
8. Implementar `gastos_feria`
9. Agregar campos de auditoría

### **Fase 4: Storage y Optimización (Día 5)**

10. Configurar Supabase Storage para comprobantes
11. Migrar comprobantes de base64 a storage
12. Crear índices y optimizar queries

---

## ❓ PREGUNTAS PARA DECIDIR

1. **¿Necesitas multiusuario?** → Si sí, agregar tabla `usuarios` y permisos
2. **¿Necesitas reportes financieros detallados?** → Si sí, tabla `gastos_feria` es crítica
3. **¿Los emprendimientos participan en múltiples ferias?** → Si sí, necesitas histórico completo
4. **¿Necesitas control de inventario de mobiliario?** → Si sí, agregar stock a `items_mobiliario`
5. **¿Necesitas enviar notificaciones?** → Si sí, tabla `notificaciones` o usar servicios externos

---

## 💡 RECOMENDACIÓN FINAL

**Implementar el modelo mejorado con prioridades:**

### ✅ **CRÍTICO (hacer ahora)**

- Tabla `contactos`
- Tabla `categorias_emprendimiento`
- Tabla `historial_valor_uf`
- Storage para comprobantes

### ⚡ **IMPORTANTE (hacer pronto)**

- Tabla `items_mobiliario` + intermedia
- Tabla `gastos_feria`
- Tabla `historial_estados_feria`

### 📊 **BUENO TENER (futuro)**

- Campos de auditoría completos
- Soft deletes
- Tabla de usuarios y permisos

---

¿Quieres que proceda con el modelo mejorado o prefieres ajustar algo primero?
