# Implementación de Ferias Fijas e Itinerantes

## 📋 Resumen

Se ha implementado la funcionalidad para diferenciar entre **Ferias Fijas** (permanentes) y **Ferias Itinerantes** (temporales).

## 🗄️ Cambios en Base de Datos

### 1. Aplicar Schema SQL

Ejecutar en Supabase el siguiente archivo:

```bash
tipo-feria-schema.sql
```

Este script:

- Agrega el campo `tipo_feria` a la tabla `ferias`
- Establece 'itinerante' como valor por defecto
- Actualiza todas las ferias existentes como 'itinerante'
- Crea índice para mejorar performance

## 🔧 Cambios en el Código

### 2. Store actualizado (`src/stores/ferias.js`)

**Nuevas exportaciones:**

- `TIPOS_FERIA.FIJA` = 'fija'
- `TIPOS_FERIA.ITINERANTE` = 'itinerante'

**Nuevos computed properties:**

- `feriasFijas` - Lista de ferias fijas
- `feriasItinerantes` - Lista de ferias itinerantes
- `feriasFijasActivas` - Ferias fijas activas
- `feriasItinerantesActivas` - Ferias itinerantes activas

**Función actualizada:**

- `agregarFeria(datos)` - Ahora acepta `tipoFeria` en los datos

### 3. Nueva Vista (`src/views/GestionFeriasNuevo.vue`)

**Características:**

- ✅ Sistema de tabs para separar Ferias Fijas e Itinerantes
- ✅ Estadísticas independientes por tipo
- ✅ Tablas separadas con filtros por tipo
- ✅ Formulario modal adaptado según el tipo
- ✅ Badges de contador en cada tab

**Secciones:**

- **Tab Ferias Fijas**: Gestión de ferias permanentes
- **Tab Ferias Itinerantes**: Gestión de ferias temporales

## 📦 Pasos para Implementar

### Paso 1: Base de Datos

```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: tipo-feria-schema.sql
```

### Paso 2: Actualizar Router (opcional)

Si quieres usar la nueva vista, actualiza `src/router/index.js`:

```javascript
{
  path: '/ferias',
  name: 'GestionFerias',
  component: () => import('../views/GestionFeriasNuevo.vue')
}
```

O puedes mantener ambas vistas y cambiar gradualmente.

### Paso 3: Verificar

1. Ejecuta el servidor de desarrollo
2. Ve a la sección de Ferias
3. Verifica que aparecen los dos tabs
4. Crea una feria de cada tipo
5. Confirma que se guardan correctamente

## 🎨 Diferencias Visuales

### Ferias Fijas

- **Color**: Azul (primary)
- **Ícono**: fa-store (tienda)
- **Características**:
  - Permanentes en un centro comercial
  - Pueden ser pausadas temporalmente
  - Gestión manual de fechas

### Ferias Itinerantes

- **Color**: Naranja/Amarillo (warning)
- **Ícono**: fa-route (ruta)
- **Características**:
  - Temporales con fecha de inicio y fin definida
  - Pueden cambiar de ubicación
  - Son las ferias tradicionales del sistema

## 📊 Reportes Separados

Los computed properties permiten generar reportes independientes:

```javascript
// Ejemplo de uso
const totalFeriasFijas = feriasStore.feriasFijas.length;
const activasFijas = feriasStore.feriasFijasActivas.length;

const totalItinerantes = feriasStore.feriasItinerantes.length;
const activasItinerantes = feriasStore.feriasItinerantesActivas.length;
```

## 🔄 Migración de Datos

Todas las ferias existentes se marcarán automáticamente como **'itinerante'** al ejecutar el script SQL, manteniendo la compatibilidad con el sistema actual.

## ✅ Checklist de Implementación

- [x] Crear schema SQL para campo `tipo_feria`
- [x] Actualizar store con tipos y computed properties
- [x] Crear nueva vista con tabs
- [x] Agregar formulario modal adaptado
- [x] Documentar cambios
- [x] Actualizar router
- [ ] Ejecutar migration en Supabase (siguiente paso)
- [ ] Probar creación de ferias fijas
- [ ] Probar creación de ferias itinerantes
- [ ] Verificar filtros y estadísticas

## 🎯 Estado Actual

✅ **Router actualizado** - La ruta `/ferias` ahora apunta a `GestionFeriasNuevo.vue`
✅ **Store configurado** - Tipos y computed properties listos
✅ **Vista lista** - Sistema de tabs implementado
⏳ **Falta ejecutar SQL** - Aplicar `tipo-feria-schema.sql` en Supabase

## 🚀 Próximos Pasos Sugeridos

1. **Dashboard mejorado**: Vista de calendario para ferias fijas
2. **Alertas**: Notificaciones para ferias fijas próximas a finalizar
3. **Plantillas**: Crear plantillas de ferias fijas para replicar rápidamente
4. **Reportes**: Exportar estadísticas separadas por tipo
5. **Permisos**: Diferenciar permisos entre gestión de fijas e itinerantes

## 📝 Notas Importantes

- Las ferias fijas pueden compartir emprendimientos
- Los precios pueden variar entre instancias
- El sistema mantiene retrocompatibilidad con ferias existentes
- Se pueden migrar ferias de un tipo a otro editándolas
