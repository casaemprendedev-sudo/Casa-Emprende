// API endpoint para Vercel que crea carpetas en Google Drive
// Usa Service Account en vez de API Key

import { google } from "googleapis";

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { year, mall, fair, rootFolderId } = req.body;

    // Validar datos requeridos
    if (!year || !mall || !fair || !rootFolderId) {
      return res.status(400).json({
        error: "Faltan parámetros requeridos: year, mall, fair, rootFolderId",
      });
    }

    // Configurar autenticación con Service Account
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Función helper para crear o encontrar carpeta
    async function ensureFolder(name, parentId) {
      // Buscar si ya existe
      const response = await drive.files.list({
        q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id, name)",
      });

      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Si no existe, crearla
      const fileMetadata = {
        name: name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      };

      const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: "id",
      });

      return folder.data.id;
    }

    // Crear estructura: Root → Year → Mall → Fair → [Facturas, Ordenes]
    console.log("Creando estructura de carpetas...");

    const yearFolderId = await ensureFolder(year, rootFolderId);
    console.log(`Carpeta año: ${yearFolderId}`);

    const mallFolderId = await ensureFolder(mall, yearFolderId);
    console.log(`Carpeta mall: ${mallFolderId}`);

    const fairFolderId = await ensureFolder(fair, mallFolderId);
    console.log(`Carpeta feria: ${fairFolderId}`);

    const facturasFolderId = await ensureFolder("Facturas", fairFolderId);
    const ordenesFolderId = await ensureFolder(
      "Ordenes de Compra",
      fairFolderId
    );

    return res.status(200).json({
      success: true,
      structure: {
        year: { id: yearFolderId, name: year },
        mall: { id: mallFolderId, name: mall },
        fair: { id: fairFolderId, name: fair },
        facturas: { id: facturasFolderId, name: "Facturas" },
        ordenes: { id: ordenesFolderId, name: "Ordenes de Compra" },
      },
    });
  } catch (error) {
    console.error("Error creando carpetas:", error);
    return res.status(500).json({
      error: "Error creando estructura de carpetas",
      details: error.message,
    });
  }
}
