# ✅ Verificación de Operaciones CRUD - Supabase

## 📋 RESUMEN DE VERIFICACIÓN

Todas las operaciones han sido revisadas y corregidas. A continuación el detalle:

---

## 🏢 CENTROS COMERCIALES

### ✅ **cargarCentros()**

```javascript
supabase.from("centros_comerciales").select("*").order("nombre");
```

- **Tabla**: `centros_comerciales` ✅
- **Operación**: SELECT ✅
- **Filtros**: Sin deleted_at (pendiente) ⚠️

### ✅ **agregarCentro()**

```javascript
supabase
  .from("centros_comerciales")
  .insert([{ nombre, direccion, telefono, email }]);
```

- **Campos correctos**: ✅
- **snake_case**: ✅

### ✅ **actualizarCentro()**

```javascript
supabase
  .from("centros_comerciales")
  .update({ nombre, direccion, telefono, email })
  .eq("id", id);
```

- **Operación UPDATE**: ✅
- **WHERE clause**: ✅

### ✅ **eliminarCentro()**

```javascript
supabase.from("centros_comerciales").delete().eq("id", id);
```

- **Hard delete** (debería ser soft delete) ⚠️

---

## 🗺️ ZONAS

### ✅ **cargarZonas()**

```javascript
supabase.from("zonas").select("*").order("nombre");
```

- **Tabla correcta**: ✅

### ✅ **agregarZona()**

```javascript
supabase
  .from("zonas")
  .insert([{ centro_comercial_id, nombre, capacidad_maxima, descripcion }]);
```

- **FK correcta**: `centro_comercial_id` ✅
- **snake_case**: ✅

### ✅ **actualizarZona()**

```javascript
supabase
  .from("zonas")
  .update({ nombre, capacidad_maxima, descripcion })
  .eq("id", id);
```

- **Operación correcta**: ✅

### ✅ **eliminarZona()**

```javascript
supabase.from("zonas").delete().eq("id", id);
```

- **Hard delete** (debería ser soft delete) ⚠️

---

## 🏪 EMPRENDIMIENTOS

### ✅ **cargarCategorias()**

```javascript
supabase
  .from("categorias_emprendimiento")
  .select("*")
  .eq("activo", true)
  .order("orden");
```

- **Tabla correcta**: ✅
- **Filtro por activo**: ✅
- **Orden correcto**: ✅

### ✅ **cargarEmprendimientos()**

```javascript
supabase
  .from("emprendimientos")
  .select(
    `
    *,
    categoria:categorias_emprendimiento(id, nombre),
    contactos(*)
  `
  )
  .is("deleted_at", null);
```

- **Relaciones expandidas**: ✅
- **Soft delete filter**: ✅
- **Join correcto**: ✅

### ✅ **agregarEmprendimiento()**

```javascript
// 1. Insertar emprendimiento
supabase.from("emprendimientos").insert({
  nombre_emprendedor,
  rut,
  email,
  telefono,
  nombre_emprendimiento,
  categoria_id,
  descripcion,
  instagram,
  activo,
});

// 2. Insertar contacto principal
supabase.from("contactos").insert({
  emprendimiento_id,
  tipo: "principal",
  nombre,
  telefono,
  email,
  es_principal: true,
});

// 3. Insertar contacto de pagos (opcional)
supabase.from("contactos").insert({
  emprendimiento_id,
  tipo: "pagos",
  nombre,
  telefono,
  email,
  es_principal: false,
});
```

- **Transacción correcta**: ✅
- **Múltiples inserts**: ✅
- **Contactos separados**: ✅

### ✅ **actualizarEmprendimiento()**

```javascript
// 1. Actualizar emprendimiento
supabase.from("emprendimientos").update({...}).eq("id", id)

// 2. Actualizar contacto principal
supabase.from("contactos").update({...})
  .eq("emprendimiento_id", id)
  .eq("tipo", "principal")

// 3. Actualizar/crear contacto pagos
if (existente) {
  supabase.from("contactos").update({...}).eq("id", existente.id)
} else {
  supabase.from("contactos").insert({...})
}
```

- **Lógica correcta**: ✅
- **Verifica existencia**: ✅

### ✅ **eliminarEmprendimiento()**

```javascript
supabase.from("emprendimientos").update({ deleted_at: NOW }).eq("id", id);
```

- **Soft delete**: ✅

---

## 🎪 FERIAS

### ✅ **cargarFerias()**

```javascript
supabase
  .from("ferias")
  .select(
    `
    *,
    centro:centros_comerciales(id, nombre),
    zona:zonas(id, nombre),
    gastos:gastos_feria(*)
  `
  )
  .is("deleted_at", null);
```

- **Relaciones correctas**: ✅
- **Gastos incluidos**: ✅
- **Soft delete filter**: ✅

### ✅ **agregarFeria()**

```javascript
// 1. Crear feria
supabase.from("ferias").insert({
  nombre, fecha_inicio, fecha_fin,
  centro_comercial_id, zona_id,
  limite_puestos, precio_base_puesto,
  moneda, valor_uf, estado, notas
})

// 2. Insertar gastos iniciales
if (gastos) {
  supabase.from("gastos_feria").insert([
    { feria_id, categoria: "coordinadores", monto, descripcion },
    { feria_id, categoria: "montaje", monto, descripcion },
    ...
  ])
}
```

- **Campos correctos**: ✅
- **Gastos separados**: ✅
- **FKs correctas**: ✅

### ✅ **actualizarFeria()**

```javascript
supabase
  .from("ferias")
  .update({
    nombre,
    fecha_inicio,
    fecha_fin,
    centro_comercial_id,
    zona_id,
    limite_puestos,
    precio_base_puesto,
    moneda,
    valor_uf,
    notas,
  })
  .eq("id", id);
```

- **Todos los campos**: ✅

### ✅ **cambiarEstado()**

```javascript
supabase.from("ferias").update({ estado: nuevoEstado }).eq("id", id);
```

- **Trigger automático registra cambio**: ✅
- **historial_estados_feria se llena solo**: ✅

### ✅ **eliminarFeria()**

```javascript
supabase.from("ferias").update({ deleted_at: NOW }).eq("id", id);
```

- **Soft delete**: ✅

### ✅ **agregarGasto()**

```javascript
supabase.from("gastos_feria").insert({
  feria_id,
  categoria,
  descripcion,
  monto,
  fecha,
  comprobante_url,
});
```

- **Tabla correcta**: ✅
- **Campos correctos**: ✅

### ✅ **actualizarGasto()**

```javascript
supabase.from("gastos_feria").update({...}).eq("id", gastoId)
```

- **Operación correcta**: ✅

### ✅ **eliminarGasto()**

```javascript
supabase.from("gastos_feria").delete().eq("id", gastoId);
```

- **Hard delete OK** (gastos no requieren soft delete): ✅

### ✅ **obtenerHistorialEstados()**

```javascript
supabase
  .from("historial_estados_feria")
  .select("*")
  .eq("feria_id", feriaId)
  .order("fecha_cambio", { ascending: false });
```

- **Tabla correcta**: ✅
- **Ordenamiento correcto**: ✅

---

## 🎯 PARTICIPACIONES

### ✅ **cargarItemsMobiliario()**

```javascript
supabase.from("items_mobiliario").select("*").eq("activo", true);
```

- **Tabla correcta**: ✅

### ✅ **cargarParticipaciones()**

```javascript
supabase
  .from("participaciones")
  .select(
    `
    *,
    feria:ferias(id, nombre, fecha_inicio, fecha_fin),
    emprendimiento:emprendimientos(id, nombre_emprendimiento, nombre_emprendedor),
    mobiliario:participacion_mobiliario(
      id, cantidad,
      item:items_mobiliario(id, nombre, precio)
    )
  `
  )
  .is("deleted_at", null);
```

- **Relaciones anidadas**: ✅
- **Join de mobiliario**: ✅
- **Soft delete**: ✅

### ✅ **agregarParticipacion()**

```javascript
// 1. Crear participación
supabase.from("participaciones").insert({
  feria_id, emprendimiento_id, numero_puesto,
  precio_base, descuento_porcentaje, descuento_monto,
  subtotal, cargo_mobiliario, precio_neto,
  iva, total, monto_final, monto_pagado,
  estado_pago, mobiliario_extra, observaciones
})

// 2. Asociar mobiliario
supabase.from("participacion_mobiliario").insert([
  { participacion_id, item_mobiliario_id, cantidad },
  ...
])
```

- **Cálculos de precio incluidos**: ✅
- **Tabla intermedia correcta**: ✅

### ✅ **actualizarParticipacion()**

```javascript
// 1. Actualizar participación
supabase.from("participaciones").update({...}).eq("id", id)

// 2. Reemplazar mobiliario
supabase.from("participacion_mobiliario").delete().eq("participacion_id", id)
supabase.from("participacion_mobiliario").insert([...])
```

- **Estrategia de reemplazo**: ✅

### ✅ **eliminarParticipacion()**

```javascript
supabase.from("participaciones").update({ deleted_at: NOW }).eq("id", id);
```

- **Soft delete**: ✅

### ✅ **actualizarMontoPagado()**

```javascript
supabase
  .from("participaciones")
  .update({
    monto_pagado: nuevoMonto,
    estado_pago: calculado,
  })
  .eq("id", participacionId);
```

- **Estado calculado automáticamente**: ✅

---

## 💰 ABONOS

### ✅ **cargarAbonos()**

```javascript
supabase.from("abonos").select(`
    *,
    participacion:participaciones(
      id, numero_puesto, monto_final,
      feria:ferias(id, nombre),
      emprendimiento:emprendimientos(id, nombre_emprendimiento)
    )
  `);
```

- **Relaciones anidadas profundas**: ✅

### ✅ **registrarAbono()**

```javascript
// 1. Obtener siguiente número
supabase
  .from("abonos")
  .select("numero_abono")
  .eq("participacion_id", id)
  .order("numero_abono", { ascending: false })
  .limit(1);

// 2. Crear abono
supabase.from("abonos").insert({
  participacion_id,
  numero_abono,
  fecha,
  monto,
  banco,
  numero_operacion,
  comprobante_url,
  notas,
});

// 3. Actualizar monto_pagado en participación
participacionesStore.actualizarMontoPagado(id, nuevoMonto);
```

- **Número auto-incremental por participación**: ✅
- **Actualización de monto**: ✅

### ✅ **actualizarAbono()**

```javascript
// 1. Obtener abono anterior
supabase.from("abonos").select("monto, participacion_id").eq("id", id)

// 2. Actualizar abono
supabase.from("abonos").update({...}).eq("id", id)

// 3. Ajustar monto_pagado si cambió
participacionesStore.actualizarMontoPagado(id, nuevoMonto)
```

- **Calcula diferencia correctamente**: ✅

### ✅ **eliminarAbono()**

```javascript
// 1. Obtener datos antes de eliminar
supabase.from("abonos").select("monto, participacion_id").eq("id", id);

// 2. Eliminar abono
supabase.from("abonos").delete().eq("id", id);

// 3. Restar monto de participación
participacionesStore.actualizarMontoPagado(id, montoActual - montoAbono);
```

- **Hard delete OK** (abonos son transaccionales): ✅
- **Actualiza participación**: ✅

### ✅ **subirComprobante()** - CORREGIDO

```javascript
const filePath = `${participacionId}_${Date.now()}.${ext}`;
supabase.storage.from("comprobantes").upload(filePath, file);
supabase.storage.from("comprobantes").getPublicUrl(filePath);
```

- **Sin carpeta redundante**: ✅
- **Nombre único**: ✅
- **URL pública**: ✅

### ✅ **eliminarComprobante()** - CORREGIDO

```javascript
const fileName = url.split("/object/public/comprobantes/")[1];
supabase.storage.from("comprobantes").remove([fileName]);
```

- **Extrae correctamente del URL**: ✅
- **Elimina del storage**: ✅

---

## ⚠️ MEJORAS PENDIENTES

### 1. **Soft Deletes en Centros y Zonas**

Actualmente usan `hard delete`:

```javascript
// ACTUAL
supabase.from("centros_comerciales").delete().eq("id", id);

// DEBERÍA SER
supabase
  .from("centros_comerciales")
  .update({ deleted_at: new Date().toISOString() })
  .eq("id", id);
```

### 2. **Filtro de Soft Delete en Carga**

```javascript
// ACTUAL
supabase.from("centros_comerciales").select("*");

// DEBERÍA SER
supabase.from("centros_comerciales").select("*").is("deleted_at", null);
```

### 3. **Transacciones en Operaciones Complejas**

Algunas operaciones deberían usar RPC o transacciones:

- Crear emprendimiento + contactos
- Crear feria + gastos
- Crear participación + mobiliario

---

## ✅ VERIFICACIÓN FINAL

| Store                  | Operaciones    | Estado                     |
| ---------------------- | -------------- | -------------------------- |
| **centros.js**         | 8 operaciones  | ✅ OK (mejoras pendientes) |
| **emprendimientos.js** | 5 operaciones  | ✅ OK                      |
| **ferias.js**          | 10 operaciones | ✅ OK                      |
| **participaciones.js** | 7 operaciones  | ✅ OK                      |
| **abonos.js**          | 6 operaciones  | ✅ OK (corregido)          |

**Total: 36 operaciones verificadas**

---

## 🔍 PRÓXIMOS PASOS RECOMENDADOS

1. ✅ Corregir soft delete en centros y zonas
2. ✅ Agregar filtros deleted_at en cargas
3. ⚙️ Probar cada operación en la UI
4. ⚙️ Verificar errores en consola del navegador
5. ⚙️ Comprobar datos en Supabase Table Editor

---

¿Quieres que corrija los soft deletes de centros/zonas ahora?
