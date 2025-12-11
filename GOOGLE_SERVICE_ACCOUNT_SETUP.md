# Configuración de Service Account para Google Drive

## Paso 1: Crear Service Account

1. **Ve a Google Cloud Console**

   - Abre: https://console.cloud.google.com/

2. **Selecciona o crea un proyecto**

   - Click en el selector de proyectos (arriba a la izquierda)
   - Click en "NUEVO PROYECTO"
   - Nombre: "Casa Emprende Drive"
   - Click "CREAR"

3. **Habilita Google Drive API**

   - Ve a: https://console.cloud.google.com/apis/library/drive.googleapis.com
   - Click en "HABILITAR"
   - Espera unos segundos

4. **Crea Service Account**

   - Ve a: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Click "CREAR CUENTA DE SERVICIO"
   - Nombre: `casa-emprende-drive`
   - ID: `casa-emprende-drive` (se genera automáticamente)
   - Descripción: "Service account para subir archivos a Google Drive"
   - Click "CREAR Y CONTINUAR"
   - En "Otorgar acceso": NO selecciones nada, click "CONTINUAR"
   - Click "LISTO"

5. **Descarga las credenciales JSON**

   - En la lista de service accounts, encuentra el que acabas de crear
   - Click en los 3 puntos (⋮) a la derecha
   - Click "Administrar claves"
   - Click "AGREGAR CLAVE" → "Crear clave nueva"
   - Selecciona "JSON"
   - Click "CREAR"
   - Se descargará un archivo JSON (ej: `casa-emprende-drive-abc123.json`)

6. **Copia el email del Service Account**
   - En la lista verás algo como: `casa-emprende-drive@tu-proyecto.iam.gserviceaccount.com`
   - **COPIA ESTE EMAIL** (lo necesitarás en el Paso 2)

---

## Paso 2: Compartir carpeta de Google Drive

1. **Abre Google Drive**

   - Ve a: https://drive.google.com/drive/folders/15NZ1SMABN2dfKGNctnAOIrj6PQic5Y-j

2. **Comparte la carpeta con el Service Account**
   - Click derecho en la carpeta (o click en los 3 puntos)
   - Click "Compartir"
   - En "Agregar personas y grupos":
     - Pega el email del Service Account (el que copiaste arriba)
     - Selecciona "Editor" (para que pueda crear carpetas y subir archivos)
   - **IMPORTANTE**: Desmarca "Notificar a las personas"
   - Click "Compartir"

---

## Paso 3: Configurar credenciales en el proyecto

El JSON descargado se ve así:

```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "casa-emprende-drive@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

**Debes copiar TODO el contenido del archivo JSON y pegarlo en `.env` (se hará en el siguiente paso)**

---

## ✅ Cuando termines estos pasos, avísame y continúo con la instalación
