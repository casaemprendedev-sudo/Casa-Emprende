/**
 * Google Drive Service - OAuth Version
 * Handles folder management and file uploads using backend API with OAuth 2.0
 */

// Google Drive API Configuration
const FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || "";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

class GoogleDriveService {
  constructor() {
    this.rootFolderId = FOLDER_ID;
    this.backendUrl = BACKEND_URL || "/api";
  }

  /**
   * Check if service is configured
   */
  isConfigured() {
    return !!this.rootFolderId;
  }

  /**
   * Check authentication status
   */
  async checkAuthStatus() {
    try {
      const response = await fetch(`${this.backendUrl}/api/auth-status`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking auth status:", error);
      return { authenticated: false };
    }
  }

  /**
   * Authenticate with Google OAuth
   */
  async authenticate() {
    try {
      // Get auth URL from backend
      const response = await fetch(`${this.backendUrl}/api/auth-url`);
      const data = await response.json();

      if (!data.authUrl) {
        throw new Error("Failed to get auth URL");
      }

      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        data.authUrl,
        "Google OAuth",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Poll for authentication status
      return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
          const status = await this.checkAuthStatus();
          if (status.authenticated) {
            clearInterval(pollInterval);
            resolve(status);
          }
        }, 1000);

        // Timeout after 2 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          reject(new Error("Authentication timeout"));
        }, 120000);
      });
    } catch (error) {
      console.error("Error authenticating:", error);
      throw error;
    }
  }

  /**
   * Ensure directory structure exists using backend API
   */
  async ensureDirectoryStructure(
    year,
    mallName,
    fairName,
    month,
    entrepreneurName,
    subfolder
  ) {
    if (!this.isConfigured()) {
      throw new Error("Google Drive not configured. Please set FOLDER_ID.");
    }

    try {
      const fairFullName = `${fairName} - ${month}`;

      const response = await fetch(`${this.backendUrl}/api/drive-folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: year.toString(),
          mall: mallName,
          fair: fairFullName,
          entrepreneur: entrepreneurName,
          rootFolderId: this.rootFolderId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create folder structure");
      }

      // Return the correct subfolder ID
      if (subfolder === "Facturas") {
        return data.structure.facturas.id;
      } else if (subfolder === "Ordenes de Compra") {
        return data.structure.ordenes.id;
      } else {
        throw new Error(`Invalid subfolder: ${subfolder}`);
      }
    } catch (error) {
      console.error("Error ensuring directory structure:", error);
      throw error;
    }
  }

  /**
   * Upload file using backend API (OAuth)
   */
  async uploadFile(file, folderId, metadata = {}) {
    if (!this.isConfigured()) {
      throw new Error("Google Drive not configured");
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderId", folderId);
      formData.append("fileName", metadata.name || file.name);

      const response = await fetch(`${this.backendUrl}/api/drive-upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      console.log(`File uploaded: ${data.name} (${data.id})`);

      return {
        id: data.id,
        name: data.name,
        webViewLink: data.webViewLink,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  /**
   * Upload document with automatic folder structure
   */
  async uploadDocument(file, fairData, entrepreneurName, documentType) {
    try {
      const { year, mallName, fairName, month } = fairData;

      // For "Orden de Compra", don't include entrepreneur folder
      const includeEntrepreneur = documentType === "Facturas";

      // Create/find the target folder
      const folderId = await this.ensureDirectoryStructure(
        year,
        mallName,
        fairName,
        month,
        includeEntrepreneur ? entrepreneurName : null,
        documentType
      );

      // Use original filename (no renaming)
      const fileName = file.name;

      // Upload the file
      const result = await this.uploadFile(file, folderId, { name: fileName });

      return {
        success: true,
        fileId: result.id,
        fileName: result.name,
        webViewLink: result.webViewLink,
      };
    } catch (error) {
      console.error("Error uploading document:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();
export default googleDriveService;
