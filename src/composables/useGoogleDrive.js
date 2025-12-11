/**
 * Composable for Google Drive Integration - OAuth Version
 */

import { ref } from "vue";
import googleDriveService from "../services/google/drive.service";

const isConfigured = ref(false);
const isAuthenticated = ref(false);
const isLoading = ref(false);
const error = ref(null);

export function useGoogleDrive() {
  /**
   * Check if Google Drive is properly configured
   */
  const checkConfiguration = () => {
    isConfigured.value = googleDriveService.isConfigured();
    return isConfigured.value;
  };

  /**
   * Check authentication status
   */
  const checkAuthStatus = async () => {
    try {
      const status = await googleDriveService.checkAuthStatus();
      isAuthenticated.value = status.authenticated;
      return status;
    } catch (err) {
      console.error("Error checking auth status:", err);
      isAuthenticated.value = false;
      return { authenticated: false };
    }
  };

  /**
   * Authenticate with Google OAuth
   */
  const authenticate = async () => {
    try {
      await googleDriveService.authenticate();
      // Después de la autenticación, verificar el estado
      await checkAuthStatus();
    } catch (err) {
      error.value = err.message || "Error en la autenticación";
      console.error("Error authenticating:", err);
    }
  };

  /**
   * Upload a document (Invoice or Purchase Order)
   */
  const uploadDocument = async (
    file,
    fairData,
    entrepreneurName,
    documentType
  ) => {
    if (!checkConfiguration()) {
      error.value =
        "Google Drive no está configurado. Por favor configure las variables de entorno.";
      return { success: false, error: error.value };
    }

    if (!isAuthenticated.value) {
      error.value = "No estás autenticado. Por favor autentícate primero.";
      return { success: false, error: error.value };
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await googleDriveService.uploadDocument(
        file,
        fairData,
        entrepreneurName,
        documentType
      );

      if (!result.success) {
        error.value = result.error;
      }

      return result;
    } catch (err) {
      error.value = err.message || "Error al subir documento";
      console.error("Error uploading document:", err);
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Upload invoice
   */
  const uploadInvoice = async (file, fairData, entrepreneurName) => {
    return uploadDocument(file, fairData, entrepreneurName, "Facturas");
  };

  /**
   * Upload purchase order
   */
  const uploadPurchaseOrder = async (file, fairData, entrepreneurName) => {
    return uploadDocument(
      file,
      fairData,
      entrepreneurName,
      "Ordenes de Compra"
    );
  };

  // Initialize
  checkConfiguration();
  checkAuthStatus();

  return {
    // State
    isConfigured,
    isAuthenticated,
    isLoading,
    error,

    // Methods
    checkConfiguration,
    checkAuthStatus,
    authenticate,
    uploadInvoice,
    uploadPurchaseOrder,
  };
}

export default useGoogleDrive;
