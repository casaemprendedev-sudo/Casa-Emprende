# Integración con Google Drive - Casa Emprende

## 📋 Resumen

La aplicación ahora puede conectarse con Google Drive para almacenar automáticamente facturas y órdenes de compra de los emprendedores en cada feria.

## 🏗️ Estructura de Carpetas en Google Drive

Los documentos se organizan automáticamente de la siguiente manera:

```
Casa Emprende Docs/
└── [Año] (ej: 2025)
    └── [Centro Comercial] (ej: Parque Arauco)
        └── [Feria - Mes] (ej: Feria Navideña - Diciembre)
            ├── Facturas/
            │   └── [NombreEmprendedor]_[Fecha].pdf
            └── Ordenes de Compra/
                └── [NombreEmprendedor]_[Fecha].pdf
```

## ⚙️ Configuración

### 1. Crear Proyecto en Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto o seleccionar uno existente
3. Habilitar **Google Drive API**:
   - En el menú lateral, ir a "APIs & Services" > "Library"
   - Buscar "Google Drive API"
   - Click en "Enable"

### 2. Crear Credenciales OAuth 2.0

1. Ir a "APIs & Services" > "Credentials"
2. Click en "+ CREATE CREDENTIALS" > "OAuth client ID"
3. Configurar pantalla de consentimiento (si es la primera vez):
   - User Type: External (para pruebas) o Internal (solo para usuarios de tu organización)
   - Completar información básica de la aplicación
   - Agregar scopes: `https://www.googleapis.com/auth/drive.file`
4. Crear credenciales:
   - Application type: **Web application**
   - Name: Casa Emprende App
   - Authorized JavaScript origins:
     - `http://localhost:5173` (desarrollo)
     - `https://tu-dominio.com` (producción)
   - Authorized redirect URIs:
     - `http://localhost:5173` (desarrollo)
     - `https://tu-dominio.com` (producción)
5. Click en "CREATE"
6. Copiar el **Client ID**

### 3. Crear API Key (Opcional pero recomendado)

1. En "Credentials", click en "+ CREATE CREDENTIALS" > "API key"
2. Copiar la API Key generada
3. (Opcional) Restringir la key solo para Drive API

### 4. Configurar Variables de Entorno

1. Copiar `.env.example` a `.env`:

   ```bash
   cp .env.example .env
   ```

2. Editar `.env` y agregar tus credenciales:

   ```env
   VITE_GOOGLE_DRIVE_CLIENT_ID=tu-client-id-aqui.apps.googleusercontent.com
   VITE_GOOGLE_DRIVE_API_KEY=tu-api-key-aqui
   ```

3. **IMPORTANTE**: El archivo `.env` está en `.gitignore` y NO debe subirse a git

## 🚀 Uso

### Para Administradores

1. **Conectar Google Drive**:

   - Abrir una feria en "Gestión de Ferias"
   - Click en un emprendedor para editar su participación
   - En la sección "Documentos", click en "Conectar Drive"
   - Autorizar acceso en la ventana popup de Google
   - La conexión persiste durante la sesión

2. **Subir Documentos**:

   - Una vez conectado, verás dos opciones:
     - **Facturas**: Para subir facturas del emprendedor
     - **Órdenes de Compra**: Para órdenes de compra
   - Seleccionar archivo PDF
   - El archivo se sube automáticamente con el nombre: `[NombreEmprendedor]_[Fecha].pdf`
   - Se crea automáticamente la estructura de carpetas si no existe

3. **Desconectar**:
   - Click en "Desconectar" en cualquier momento
   - La siguiente vez deberás autorizar nuevamente

## 🔒 Seguridad

### Autenticación de Usuario

- **NO afecta el login principal**: Los usuarios siguen iniciando sesión con email/password en Supabase
- **OAuth solo para Drive**: La conexión con Google Drive es independiente y adicional
- **Scope limitado**: Solo se solicita acceso a archivos creados por la app (`drive.file`)
- **Por sesión**: El token se almacena localmente y expira al cerrar sesión

### Permisos

- La app **NO** tiene acceso a todos los archivos del Drive del usuario
- Solo puede ver/modificar archivos que ella misma creó
- El usuario puede revocar acceso en cualquier momento desde su [cuenta de Google](https://myaccount.google.com/permissions)

### Datos Sensibles

- El Client ID y API Key están en el frontend (necesario para OAuth)
- Estos valores son seguros de exponer (Google los diseñó así)
- **NUNCA** compartas el Client Secret (no se usa en este proyecto)

## 📁 Archivos Creados

```
src/
├── services/
│   └── google/
│       └── drive.service.js         # Servicio principal de Google Drive
├── composables/
│   └── useGoogleDrive.js           # Composable para Vue components
└── components/
    └── common/
        └── GoogleDriveUpload.vue   # Componente UI de upload

.env.example                        # Template de variables de entorno
```

## 🧪 Verificación

### 1. Verificar Autenticación

- [ ] Click en "Conectar Drive" abre popup de Google
- [ ] Autorizar acceso funciona correctamente
- [ ] Email del usuario conectado se muestra
- [ ] Botón "Desconectar" funciona

### 2. Verificar Estructura de Carpetas

- [ ] Crear una feria de prueba
- [ ] Subir un documento
- [ ] Verificar en Google Drive que la estructura se creó:
  - `Casa Emprende Docs/2025/[Mall]/[Feria - Mes]/Facturas/`

### 3. Verificar Subida de Archivos

- [ ] Subir una factura (PDF)
- [ ] Verificar que el archivo aparece en Drive con el nombre correcto
- [ ] Verificar que el alert de éxito se muestra
- [ ] Subir una orden de compra
- [ ] Verificar que va a la carpeta correcta

## 🐛 Troubleshooting

### Error: "Google Drive Client ID not configured"

- Verificar que `.env` existe y tiene `VITE_GOOGLE_DRIVE_CLIENT_ID`
- Reiniciar el servidor de desarrollo (`npm run dev`)

### Popup de autorización no abre

- Verificar que el dominio está en "Authorized JavaScript origins"
- Desactivar bloqueadores de popups en el navegador

### Error: "redirect_uri_mismatch"

- Verificar que la URL en "Authorized redirect URIs" coincide exactamente con la URL actual
- Incluir el puerto si es desarrollo (ej: `http://localhost:5173`)

### Los archivos no se suben

- Verificar que estás conectado (email se muestra)
- Abrir la consola del navegador para ver errores
- Verificar que el archivo es PDF

## 📝 Notas Adicionales

- Los archivos con el mismo nombre se sobrescriben
- Recomendable hacer naming único: `[Emprendedor]_[Fecha]_[Numero].pdf`
- Google Drive tiene límite de 15GB en cuenta gratuita
- Considerar usar una cuenta de Google Workspace para mayor almacenamiento

## 🔄 Próximas Mejoras

- [ ] Listar documentos ya subidos
- [ ] Eliminar documentos
- [ ] Preview de documentos
- [ ] Subir múltiples archivos a la vez
- [ ] Soporte para otros formatos (Excel, Word, etc.)
- [ ] Compartir enlaces de documentos con emprendedores
