import { defineStore } from "pinia";
import { supabase } from "../lib/supabase";

export const useDocumentosStore = defineStore("documentos", {
  state: () => ({
    documentos: [],
    loading: false,
    error: null,
  }),

  getters: {
    documentosPorTipo: (state) => (tipo) => {
      if (!tipo) return state.documentos;
      return state.documentos.filter((d) => d.tipo_documento === tipo);
    },

    documentosPorCentro: (state) => (centroId) => {
      return state.documentos.filter((d) => d.centro_id === centroId);
    },

    documentosPorFeria: (state) => (feriaId) => {
      return state.documentos.filter((d) => d.feria_id === feriaId);
    },

    documentosPorParticipacion: (state) => (participacionId) => {
      return state.documentos.filter(
        (d) => d.participacion_id === participacionId
      );
    },

    documentosPorFactura: (state) => (facturaId) => {
      return state.documentos.filter((d) => d.factura_id === facturaId);
    },

    documentosPorOrdenCompra: (state) => (ordenId) => {
      return state.documentos.filter((d) => d.orden_compra_id === ordenId);
    },

    tiposDocumento: (state) => {
      const tipos = [...new Set(state.documentos.map((d) => d.tipo_documento))];
      return tipos.sort();
    },

    cantidadPorTipo: (state) => {
      const conteo = {};
      state.documentos.forEach((d) => {
        const tipo = d.tipo_documento;
        conteo[tipo] = (conteo[tipo] || 0) + 1;
      });
      return conteo;
    },
  },

  actions: {
    async fetchDocumentos() {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from("documentos_drive")
          .select(
            `
            *,
            centro:centros_comerciales (id, nombre),
            feria:ferias (id, nombre),
            participacion:participaciones (
              id,
              numero_puesto,
              emprendimiento:emprendimientos (nombre_emprendimiento)
            ),
            factura:facturas (id, numero_factura),
            orden_compra:ordenes_compra (id, numero_oc)
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        this.documentos = data || [];
      } catch (error) {
        console.error("Error fetching documentos:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createDocumento(documento) {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from("documentos_drive")
          .insert([documento])
          .select()
          .single();

        if (error) throw error;

        await this.fetchDocumentos();
        return { success: true, data };
      } catch (error) {
        console.error("Error creating documento:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateDocumento(id, updates) {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from("documentos_drive")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        await this.fetchDocumentos();
        return { success: true, data };
      } catch (error) {
        console.error("Error updating documento:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteDocumento(id) {
      this.loading = true;
      this.error = null;

      try {
        const { error } = await supabase
          .from("documentos_drive")
          .delete()
          .eq("id", id);

        if (error) throw error;

        await this.fetchDocumentos();
        return { success: true };
      } catch (error) {
        console.error("Error deleting documento:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
