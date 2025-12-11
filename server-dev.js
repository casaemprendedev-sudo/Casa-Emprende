// Servidor Express local para desarrollo
// Maneja OAuth 2.0 y operaciones de Google Drive

import express from "express";
import cors from "cors";
import { google } from "googleapis";
import formidable from "formidable";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware - CORS con configuración específica
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// OAuth 2.0 Client
let oauth2Client = null;
let userTokens = null; // Almacenamiento temporal de tokens (en producción usar DB)

function getOAuth2Client() {
  if (!oauth2Client) {
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI ||
        "http://localhost:3001/api/oauth-callback"
    );
  }
  return oauth2Client;
}

// Endpoint: Iniciar flujo OAuth
app.get("/api/auth-url", (req, res) => {
  console.log("🔐 Generating OAuth URL...");

  const oauth2Client = getOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"],
    prompt: "consent", // Fuerza el consentimiento para obtener refresh token
  });

  console.log("✅ Auth URL generated");
  res.json({ authUrl });
});

// Endpoint: Callback OAuth
app.get("/api/oauth-callback", async (req, res) => {
  console.log("🔄 OAuth callback received");
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("No authorization code provided");
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Guardar tokens (en producción, guardar en DB)
    userTokens = tokens;

    console.log("✅ Tokens obtained and saved");
    console.log(
      "   Access Token:",
      tokens.access_token?.substring(0, 20) + "..."
    );
    console.log("   Refresh Token:", tokens.refresh_token ? "Yes" : "No");

    // Redirigir de vuelta a la app
    res.send(`
      <html>
        <body>
          <h1>✅ Autenticación exitosa</h1>
          <p>Ya puedes cerrar esta ventana y volver a la aplicación.</p>
          <script>
            setTimeout(() => window.close(), 2000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Error getting tokens:", error);
    res.status(500).send("Error during authentication");
  }
});

// Endpoint: Verificar estado de autenticación
app.get("/api/auth-status", (req, res) => {
  res.json({
    authenticated: !!userTokens,
    hasRefreshToken: !!userTokens?.refresh_token,
  });
});

// Endpoint: Crear estructura de carpetas
app.post("/api/drive-folders", async (req, res) => {
  console.log("📁 Creating folder structure...");
  console.log("Request body:", req.body);

  if (!userTokens) {
    return res
      .status(401)
      .json({ error: "Not authenticated. Please authenticate first." });
  }

  try {
    const { year, mall, fair, entrepreneur, rootFolderId } = req.body;

    if (!year || !mall || !fair || !rootFolderId) {
      return res.status(400).json({
        error: "Faltan parámetros requeridos: year, mall, fair, rootFolderId",
      });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(userTokens);
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // Función helper para crear o encontrar carpeta
    async function ensureFolder(name, parentId) {
      console.log(`  🔍 Looking for folder: "${name}" in parent: ${parentId}`);

      // Buscar si ya existe
      const response = await drive.files.list({
        q: `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id, name)",
      });

      if (response.data.files.length > 0) {
        console.log(`  ✅ Found existing folder: ${response.data.files[0].id}`);
        return response.data.files[0].id;
      }

      // Si no existe, crearla
      console.log(`  ➕ Creating new folder: "${name}"`);
      const fileMetadata = {
        name: name,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      };

      const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: "id",
      });

      console.log(`  ✅ Created folder: ${folder.data.id}`);
      return folder.data.id;
    }

    // Crear estructura: Root → Year → Mall → Fair → [Entrepreneur] → [Facturas, Ordenes]
    console.log("📂 Creating folder structure:");
    console.log(`   Root: ${rootFolderId}`);

    const yearFolderId = await ensureFolder(year, rootFolderId);
    console.log(`   Year folder: ${yearFolderId}`);

    const mallFolderId = await ensureFolder(mall, yearFolderId);
    console.log(`   Mall folder: ${mallFolderId}`);

    const fairFolderId = await ensureFolder(fair, mallFolderId);
    console.log(`   Fair folder: ${fairFolderId}`);

    let entrepreneurFolderId = null;
    let facturasFolderId, ordenesFolderId;

    // If entrepreneur is provided, create subfolder structure (for Facturas)
    if (entrepreneur) {
      entrepreneurFolderId = await ensureFolder(entrepreneur, fairFolderId);
      console.log(`   Entrepreneur folder: ${entrepreneurFolderId}`);

      facturasFolderId = await ensureFolder("Facturas", entrepreneurFolderId);
      ordenesFolderId = await ensureFolder(
        "Ordenes de Compra",
        entrepreneurFolderId
      );
    } else {
      // No entrepreneur folder (for Ordenes de Compra at fair level)
      facturasFolderId = await ensureFolder("Facturas", fairFolderId);
      ordenesFolderId = await ensureFolder("Ordenes de Compra", fairFolderId);
    }

    console.log("✅ Folder structure created successfully!");

    return res.status(200).json({
      success: true,
      structure: {
        year: { id: yearFolderId, name: year },
        mall: { id: mallFolderId, name: mall },
        fair: { id: fairFolderId, name: fair },
        entrepreneur: entrepreneurFolderId
          ? { id: entrepreneurFolderId, name: entrepreneur }
          : null,
        facturas: { id: facturasFolderId, name: "Facturas" },
        ordenes: { id: ordenesFolderId, name: "Ordenes de Compra" },
      },
    });
  } catch (error) {
    console.error("❌ Error creating folders:", error);
    return res.status(500).json({
      error: "Error creando estructura de carpetas",
      details: error.message,
    });
  }
});

// Endpoint: Subir archivo
app.post("/api/drive-upload", async (req, res) => {
  console.log("📤 Uploading file...");

  if (!userTokens) {
    return res
      .status(401)
      .json({ error: "Not authenticated. Please authenticate first." });
  }

  try {
    // Parse form data
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(400).json({ error: "Error parsing form data" });
      }

      const file = files.file?.[0] || files.file;
      const folderId = fields.folderId?.[0] || fields.folderId;
      const fileName = fields.fileName?.[0] || fields.fileName;

      console.log("File:", file?.originalFilename);
      console.log("Folder ID:", folderId);
      console.log("File name:", fileName);

      if (!file || !folderId) {
        return res.status(400).json({
          error: "Faltan parámetros requeridos: file, folderId",
        });
      }

      const oauth2Client = getOAuth2Client();
      oauth2Client.setCredentials(userTokens);
      const drive = google.drive({ version: "v3", auth: oauth2Client });

      // Upload file
      const fileMetadata = {
        name: fileName || file.originalFilename,
        parents: [folderId],
      };

      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.filepath),
      };

      console.log(`📤 Uploading: ${fileMetadata.name} to folder ${folderId}`);

      const uploadedFile = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, name, webViewLink",
      });

      // Clean up temp file
      fs.unlinkSync(file.filepath);

      console.log("✅ File uploaded successfully:", uploadedFile.data.id);

      return res.status(200).json({
        success: true,
        id: uploadedFile.data.id,
        name: uploadedFile.data.name,
        webViewLink: uploadedFile.data.webViewLink,
      });
    });
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    return res.status(500).json({
      error: "Error uploading file",
      details: error.message,
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Google Drive OAuth API server running",
    authenticated: !!userTokens,
  });
});

app.listen(PORT, () => {
  console.log(
    "🚀 Google Drive OAuth API server running on http://localhost:" + PORT
  );
  console.log("📋 Available endpoints:");
  console.log("   GET  /api/auth-url - Get OAuth URL");
  console.log("   GET  /api/oauth-callback - OAuth callback");
  console.log("   GET  /api/auth-status - Check auth status");
  console.log("   POST /api/drive-folders - Create folder structure");
  console.log("   POST /api/drive-upload - Upload file");
  console.log("   GET  /api/health - Health check");
  console.log("");
  console.log("⚠️  Remember to authenticate first by visiting /api/auth-url");
});
