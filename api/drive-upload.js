// API endpoint para subir archivos a Google Drive
// Usa Service Account para autenticación

import { google } from "googleapis";
import formidable from "formidable";
import fs from "fs";

// Disable body parsing, we'll handle it ourselves
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse form data
    const form = formidable();
    const [fields, files] = await form.parse(req);

    const file = files.file?.[0];
    const folderId = fields.folderId?.[0];
    const fileName = fields.fileName?.[0];

    if (!file || !folderId) {
      return res.status(400).json({
        error: "Missing required fields: file, folderId",
      });
    }

    // Configurar autenticación con Service Account
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Upload file
    const fileMetadata = {
      name: fileName || file.originalFilename,
      parents: [folderId],
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.filepath),
    };

    const uploadedFile = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink",
    });

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      id: uploadedFile.data.id,
      name: uploadedFile.data.name,
      webViewLink: uploadedFile.data.webViewLink,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({
      error: "Error uploading file",
      details: error.message,
    });
  }
}
