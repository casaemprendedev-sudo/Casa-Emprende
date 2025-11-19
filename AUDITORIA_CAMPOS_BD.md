# AUDITORÍA DE CAMPOS DE BASE DE DATOS

Verificación completa de uso de todos los campos definidos en el esquema de Supabase.

---

## 1. CENTROS_COMERCIALES

### Campos en BD:

- `id` ✅ UUID
- `nombre` ✅ Usado en centros.js (insert/update/select)
- `direccion` ✅ Usado en centros.js (insert/update)
- `telefono` ✅ Usado en centros.js (insert/update)
- `email` ✅ Usado en centros.js (insert/update)
- `created_at` ✅ Automático
- `updated_at` ✅ Automático (trigger)
- `created_by` ❌ **NO USADO** - No hay implementación de usuarios/auth
- `updated_by` ❌ **NO USADO** - No hay implementación de usuarios/auth
- `deleted_at` ✅ Usado para soft delete

**Campos faltantes en UI:**

- Ninguno en stores
- ⚠️ **created_by/updated_by** requieren sistema de autenticación

---

## 2. ZONAS

### Campos en BD:

- `id` ✅ UUID
- `centro_comercial_id` ✅ Foreign key usado
- `nombre` ✅ Usado en centros.js
- `capacidad_maxima` ✅ Usado en centros.js (agregarZona, actualizarZona)
- `descripcion` ✅ Usado en centros.js (agregarZona, actualizarZona)
- `created_at` ✅ Automático
- `updated_at` ✅ Automático (trigger)
- `created_by` ❌ **NO USADO**
- `updated_by` ❌ **NO USADO**
- `deleted_at` ✅ Usado para soft delete

**Estado:** ✅ Todos los campos funcionales están siendo usados

---

## 3. CATEGORIAS_EMPRENDIMIENTO

### Campos en BD:

- `id` ✅ UUID
- `nombre` ✅ Usado en emprendimientos.js (select, mostrado en UI)
- `descripcion` ❌ **NO USADO** - No se muestra ni edita
- `activo` ✅ Usado en emprendimientos.js (cargarCategorias .eq("activo", true))
- `orden` ❌ **NO USADO** - Las categorías no se ordenan por este campo
- `created_at` ✅ Automático
- `updated_at` ✅ Automático (trigger)

**Campos faltantes en UI:**

- ⚠️ `descripcion` - Podría mostrarse como tooltip o en modal de categoría
- ⚠️ `orden` - No se usa en ORDER BY

---

## 4. EMPRENDIMIENTOS

### Campos en BD:

- `id` ✅ UUID
- `nombre_emprendedor` ✅ Usado
- `rut` ✅ Usado en emprendimientos.js (insert/update/búsqueda)
- `email` ✅ Usado
- `telefono` ✅ Usado
- `nombre_emprendimiento` ✅ Usado
- `categoria_id` ✅ Foreign key usado
- `descripcion` ✅ Usado en emprendimientos.js (insert/update)
- `instagram` ✅ Usado en emprendimientos.js (insert/update)
- `activo` ✅ Usado (filtros, update)
- `created_at` ✅ Automático
- `updated_at` ✅ Automático (trigger)
- `created_by` ❌ **NO USADO**
- `updated_by` ❌ **NO USADO**
- `deleted_at` ✅ Usado para soft delete

**Estado:** ✅ Todos los campos funcionales están siendo usados correctamente

---

## 5. CONTACTOS

### Campos en BD:

- `id` ✅ UUID
- `emprendimiento_id` ✅ Foreign key usado
- `tipo` ✅ Usado ('principal', 'pagos') en emprendimientos.js
- `nombre` ✅ Usado
- `telefono` ✅ Usado
- `email` ✅ Usado
- `es_principal` ✅ Usado (contacto principal = true)
- `created_at` ✅ Automático
- `updated_at` ✅ Automático (trigger)

**Estado:** ✅ Todos los campos están siendo usados correctamente

---

## 6. HISTORIAL_VALOR_UF

### Campos en BD:

- `id` ✅ UUID
- `fecha` ⚠️ **PARCIALMENTE USADO** - Tabla existe pero no hay CRUD
- `valor` ⚠️ **PARCIALMENTE USADO** - No hay gestión de UF
- `created_at` ✅ Automático

**Campos faltantes en UI:**

- ❌ **NO HAY STORE** para gestión de valores UF
- ❌ **NO HAY VISTA** para cargar/ver histórico de UF
- ⚠️ Campo `valor_uf` en ferias se guarda manualmente, no consulta esta tabla

---

## 7. FERIAS

### Campos en BD:

- `id` ✅ UUID
- `nombre` ✅ Usado
- `fecha_inicio` ✅ Usado
- `fecha_fin` ✅ Usado
- `centro_comercial_id` ✅ Foreign key usado
- `zona_id` ✅ Foreign key usado
- `limite_puestos` ✅ Usado
- `precio_base_puesto` ✅ Usado
- `moneda` ✅ Usado
- `valor_uf` ✅ Usado en ferias.js (insert/update)
- `estado` ✅ Usado (cambiarEstado + trigger de histórico)
- `notas` ✅ Usado en ferias.js (insert/update)
- `created_at` ✅ Automático
- `updated_at` ✅ Automático (trigger)
- `created_by` ❌ **NO USADO**
- `updated_by` ❌ **NO USADO**
- `deleted_at` ✅ Usado para soft delete

**Estado:** ✅ Todos los campos funcionales están siendo usados

---

## 8. GASTOS_FERIA

### Campos en BD:

- `id` ✅ UUID
- `feria_id` ✅ Foreign key usado
- `categoria` ✅ Usado ('coordinadores', 'montaje', 'flete', 'otros')
- `descripcion` ✅ Usado
- `monto` ✅ Usado
- `fecha` ✅ Usado en ferias.js (agregarGasto, actualizarGasto)
- `comprobante_url` ✅ Usado en ferias.js (campo existe)
- `created_at` ✅ Automático
- `updated_at` ✅ Automático (trigger)

**Campos faltantes en UI:**

- ⚠️ `comprobante_url` - Campo existe en BD y store, pero NO HAY INPUT en GestionFerias.vue para subir archivo
- ⚠️ `fecha` - Campo existe pero podría no mostrarse en lista de gastos

---

## 9. HISTORIAL_ESTADOS_FERIA

### Campos en BD:

- `id` ✅ UUID
- `feria_id` ✅ Foreign key usado
- `estado_anterior` ✅ Automático (trigger)
- `estado_nuevo` ✅ Automático (trigger)
- `fecha_cambio` ✅ Automático
- `usuario_id` ❌ **NO USADO** - Trigger no lo registra
- `notas` ❌ **NO USADO** - Trigger no permite agregar notas en cambio de estado

**Estado:** ⚠️ Funciona pero sin usuario ni notas. Trigger debería mejorar.

---

## 10. ITEMS_MOBILIARIO

### Campos en BD:

- `id` ✅ UUID
- `nombre` ✅ Usado en participaciones.js (cargarItemsMobiliario)
- `descripcion` ⚠️ **NO SE MUESTRA** - Se carga pero no se visualiza en UI
- `precio` ✅ Usado (cálculo de cargo_mobiliario)
- `activo` ⚠️ **NO SE FILTRA** - No hay filtro .eq("activo", true) en cargarItemsMobiliario()
- `created_at` ✅ Automático
- `updated_at` ✅ Automático (trigger)

**Campos faltantes en UI:**

- ❌ **NO HAY VISTA** para gestionar items_mobiliario (crear/editar/eliminar)
- ⚠️ `descripcion` se carga pero no se muestra
- ⚠️ `activo` no se filtra al cargar items

---

## 11. PARTICIPACIONES

### Campos en BD:

- `id` ✅ UUID
- `feria_id` ✅ Foreign key usado
- `emprendimiento_id` ✅ Foreign key usado
- `numero_puesto` ✅ Usado
- `precio_base` ✅ Usado
- `descuento_porcentaje` ✅ Usado
- `descuento_monto` ✅ Usado
- `subtotal` ✅ Usado
- `cargo_mobiliario` ✅ Usado
- `precio_neto` ✅ Usado
- `iva` ✅ Usado
- `total` ✅ Usado
- `monto_final` ✅ Usado
- `monto_pagado` ✅ Usado (actualizarMontoPagado)
- `estado_pago` ✅ Usado (se calcula automáticamente)
- `mobiliario_extra` ✅ Usado en participaciones.js
- `observaciones` ✅ Usado en participaciones.js
- `created_at` ✅ Automático
- `updated_at` ✅ Automático (trigger)
- `created_by` ❌ **NO USADO**
- `updated_by` ❌ **NO USADO**
- `deleted_at` ✅ Usado para soft delete

**Estado:** ✅ Todos los campos funcionales están siendo usados

---

## 12. PARTICIPACION_MOBILIARIO

### Campos en BD:

- `id` ✅ UUID
- `participacion_id` ✅ Foreign key usado
- `item_mobiliario_id` ✅ Foreign key usado
- `cantidad` ✅ Usado en participaciones.js
- `created_at` ✅ Automático

**Estado:** ✅ Todos los campos están siendo usados correctamente

---

## 13. ABONOS

### Campos en BD:

- `id` ✅ UUID
- `participacion_id` ✅ Foreign key usado
- `numero_abono` ✅ Usado
- `fecha` ✅ Usado
- `monto` ✅ Usado
- `banco` ✅ Usado
- `numero_operacion` ✅ Usado en abonos.js (insert/update)
- `comprobante_url` ✅ Usado (subirComprobante, eliminarComprobante)
- `notas` ✅ Usado en abonos.js (insert/update)
- `created_at` ✅ Automático
- `updated_at` ✅ Automático (trigger)
- `created_by` ❌ **NO USADO**
- `updated_by` ❌ **NO USADO**

**Campos faltantes en UI:**

- ❌ `numero_operacion` - **NO HAY INPUT** en GestionFerias.vue
- ❌ `comprobante_url` - **NO HAY INPUT** para subir archivo en modal de abonos
- ❌ `notas` - **NO HAY INPUT** en formulario de abonos

---

## RESUMEN DE PROBLEMAS

### 🔴 CRÍTICOS (campos en BD pero sin UI)

1. **ABONOS - GestionFerias.vue**:

   - ❌ Falta input `numero_operacion`
   - ❌ Falta input para cargar `comprobante_url`
   - ❌ Falta textarea `notas`

2. **GASTOS_FERIA - GestionFerias.vue**:

   - ❌ Falta input para cargar `comprobante_url`

3. **HISTORIAL_VALOR_UF**:

   - ❌ No hay store ni vista para gestionar valores UF
   - ⚠️ Campo `valor_uf` en ferias se guarda manual, no consulta tabla

4. **ITEMS_MOBILIARIO**:
   - ❌ No hay vista para gestionar items (CRUD)
   - ⚠️ Campo `descripcion` no se muestra en UI
   - ⚠️ Campo `activo` no se filtra al cargar

### 🟡 ADVERTENCIAS (campos que existen pero no implementados)

1. **Campos de auditoría** (en todas las tablas):

   - `created_by`, `updated_by` - Requieren sistema de autenticación

2. **CATEGORIAS_EMPRENDIMIENTO**:

   - `descripcion` - No se muestra
   - `orden` - No se usa para ordenar

3. **HISTORIAL_ESTADOS_FERIA**:
   - `usuario_id` - Trigger no lo registra
   - `notas` - No permite agregar contexto en cambio de estado

### ✅ FUNCIONANDO CORRECTAMENTE

- CENTROS_COMERCIALES: Todos los campos funcionales ✅
- ZONAS: Todos los campos ✅
- EMPRENDIMIENTOS: Todos los campos ✅
- CONTACTOS: Todos los campos ✅
- FERIAS: Todos los campos ✅
- PARTICIPACIONES: Todos los campos ✅
- PARTICIPACION_MOBILIARIO: Todos los campos ✅

---

## RECOMENDACIONES

### Prioridad ALTA:

1. Agregar campos faltantes en modal de abonos (numero_operacion, comprobante, notas)
2. Agregar input para comprobante en gastos de feria
3. Crear vista para gestionar items_mobiliario

### Prioridad MEDIA:

4. Implementar gestión de valores UF (store + vista)
5. Mejorar trigger de historial_estados_feria para registrar usuario y notas
6. Mostrar campo descripcion de categorías
7. Usar campo orden en categorías

### Prioridad BAJA:

8. Implementar sistema de autenticación para usar created_by/updated_by
9. Filtrar items_mobiliario por campo activo

---

**Fecha de auditoría:** 11 de noviembre de 2025
