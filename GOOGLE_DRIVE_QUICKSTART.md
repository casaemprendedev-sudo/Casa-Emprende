# Google Drive Integration - Quick Start (Simplified - No OAuth)

## ✅ Implementación Completada

### Archivos Creados

1. **Servicio Principal**: `src/services/google/drive.service.js`

   - API REST directa (sin OAuth)
   - Búsqueda de carpetas
   - Subida de archivos a carpeta compartida

2. **Composable Vue**: `src/composables/useGoogleDrive.js`

   - Estado reactivo simplificado
   - Métodos helper para componentes

3. **Componente UI**: `src/components/common/GoogleDriveUpload.vue`

   - Upload directo de Facturas
   - Upload directo de Órdenes de Compra
   - Sin necesidad de login
   - Indicadores de progreso

4. **Integración**: `src/components/fairs/FairDetailsModal.vue`
   - Componente GoogleDriveUpload agregado al modal de edición

### Dependencias

✅ **No requiere dependencias externas** - Solo usa `fetch` nativo del navegador

## 🔧 Configuración Requerida (MÁS SIMPLE)

### 1. Crear Estructura de Carpetas en Google Drive

Manualmente crear esta estructura en tu Google Drive:

```
Casa Emprende Docs/
└── 2025/
    └── Parque Arauco/  (o tu mall)
        └── Feria Navideña - Diciembre/
            ├── Facturas/
            └── Ordenes de Compra/
```

### 2. Compartir la Carpeta Raíz

1. Click derecho en "Casa Emprende Docs"
2. "Compartir" → "Obtener enlace"
3. Cambiar a: **"Cualquiera con el enlace puede editar"**
4. Copiar el ID de la carpeta desde la URL:
   ```
   https://drive.google.com/drive/folders/1ABC...XYZ
                                          ^^^^^^^^^^^
                                          Este es el FOLDER_ID
   ```

### 3. Google Cloud Console

1. Ir a https://console.cloud.google.com/
2. Crear proyecto nuevo
3. Habilitar **Google Drive API**
4. Ir a "Credentials" → "Create Credentials" → "API Key"
5. (Opcional) Restringir la clave solo a Google Drive API
6. Copiar la API Key

### 4. Variables de Entorno

Crear/editar archivo `.env`:

```env
VITE_GOOGLE_DRIVE_API_KEY=AIzaSy...tu-api-key
VITE_GOOGLE_DRIVE_FOLDER_ID=1ABC...XYZ-folder-id
```

### 5. Reiniciar Servidor

```bash
npm run dev
```

## 📁 Estructura de Carpetas

**IMPORTANTE**: Las carpetas deben existir ANTES de subir archivos.

```
Casa Emprende Docs/ (compartida públicamente)
└── [Año]/
    └── [Mall]/
        └── [Feria - Mes]/
            ├── Facturas/
            └── Ordenes de Compra/
```

## 🚀 Uso

1. Abrir una feria en "Gestión de Ferias"
2. Editar participación de un emprendedor
3. Scroll hasta sección "Documentos"
4. Seleccionar archivo PDF
5. ¡El archivo se sube automáticamente!

**Sin login, sin popups, sin OAuth** ✨

## 🔒 Seguridad

- ✅ **NO requiere OAuth** - Más simple
- ✅ **Carpeta compartida específica** - Solo acceso a esa carpeta
- ✅ **API Key pública** - Segura para uso client-side con restricciones
- ✅ **Estructura pre-creada** - Control total sobre carpetas

## ⚠️ Limitaciones

- Las carpetas deben estar pre-creadas manualmente
- La carpeta debe estar compartida públicamente (con edición)
- No hay autenticación de usuario (todos usan la misma carpeta)

## 📖 Ventajas vs OAuth

| Característica       | OAuth       | API Key (Actual)       |
| -------------------- | ----------- | ---------------------- |
| Configuración        | Compleja    | Simple                 |
| Login requerido      | Sí          | No                     |
| Popups               | Sí          | No                     |
| Carpetas automáticas | Sí          | No (manual)            |
| UX                   | Más pasos   | Directo                |
| Seguridad            | Por usuario | Por carpeta compartida |

## ✅ Checklist de Verificación

- [ ] Crear estructura de carpetas en Google Drive
- [ ] Compartir "Casa Emprende Docs" con enlace público (edición)
- [ ] Copiar FOLDER_ID desde URL
- [ ] Crear API Key en Google Cloud Console
- [ ] Habilitar Google Drive API
- [ ] Crear archivo `.env` con credenciales
- [ ] Reiniciar servidor: `npm run dev`
- [ ] Subir documento de prueba
- [ ] Verificar archivo en Google Drive
