# Configuración OAuth 2.0 para Google Drive

## Paso 1: Crear credenciales OAuth 2.0

1. **Ve a Google Cloud Console**

   - Abre: https://console.cloud.google.com/
   - Selecciona tu proyecto: "Casa Emprende Drive" (o el que creaste antes)

2. **Habilita Google Drive API** (si no lo hiciste)

   - Ve a: https://console.cloud.google.com/apis/library/drive.googleapis.com
   - Click "HABILITAR"

3. **Configura la pantalla de consentimiento OAuth**

   - Ve a: https://console.cloud.google.com/apis/credentials/consent
   - Tipo de usuario: **"Externo"** (para cuentas personales)
   - Click "CREAR"

   **Información de la app:**

   - Nombre de la aplicación: `Casa Emprende`
   - Correo de asistencia: tu email
   - Logo de la app: (opcional)
   - Dominio de la app: `localhost` (para desarrollo)
   - Correo del desarrollador: tu email
   - Click "GUARDAR Y CONTINUAR"

   **Scopes:**

   - Click "AGREGAR O QUITAR SCOPES"
   - Busca y selecciona:
     - `https://www.googleapis.com/auth/drive.file`
   - Click "ACTUALIZAR"
   - Click "GUARDAR Y CONTINUAR"

   **Usuarios de prueba:**

   - Click "AGREGAR USUARIOS"
   - Agrega tu email (el que usarás para autenticarte)
   - Click "AGREGAR"
   - Click "GUARDAR Y CONTINUAR"

4. **Crear credenciales OAuth 2.0**

   - Ve a: https://console.cloud.google.com/apis/credentials
   - Click "CREAR CREDENCIALES" → "ID de cliente de OAuth 2.0"

   **Configuración:**

   - Tipo de aplicación: **"Aplicación web"**
   - Nombre: `Casa Emprende Web Client`

   **Orígenes de JavaScript autorizados:**

   - Agregar URI: `http://localhost:5173`
   - Agregar URI: `http://localhost:5174`

   **URI de redireccionamiento autorizados:**

   - Agregar URI: `http://localhost:3001/api/oauth-callback`

   - Click "CREAR"

5. **Copiar credenciales**
   - Se mostrará un modal con:
     - **Client ID**: `123456789-xxxxx.apps.googleusercontent.com`
     - **Client Secret**: `GOCSPX-xxxxxxxxxxxxx`
   - **COPIA AMBOS** (los necesitarás en el siguiente paso)

---

## Listo para el Paso 2

Cuando termines, avísame y te daré las credenciales a copiar en el `.env`
