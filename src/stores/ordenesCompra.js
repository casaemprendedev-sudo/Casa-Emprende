import { defineStore } from "pinia";
import { supabase } from "../lib/supabase";

export const useOrdenesCompraStore = defineStore("ordenesCompra", {
  state: () => ({
    ordenes: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalOrdenado: (state) => {
      return state.ordenes
        .filter((o) => o.estado !== "Anulada")
        .reduce((sum, o) => sum + parseFloat(o.monto || 0), 0);
    },

    totalAprobado: (state) => {
      return state.ordenes
        .filter((o) => ["Aprobada", "Pagada"].includes(o.estado))
        .reduce((sum, o) => sum + parseFloat(o.monto || 0), 0);
    },

    totalPendiente: (state) => {
      return state.ordenes
        .filter((o) => o.estado === "Pendiente")
        .reduce((sum, o) => sum + parseFloat(o.monto || 0), 0);
    },

    totalPagado: (state) => {
      return state.ordenes
        .filter((o) => o.estado === "Pagada")
        .reduce((sum, o) => sum + parseFloat(o.monto || 0), 0);
    },

    cantidadOrdenes: (state) => {
      return state.ordenes.filter((o) => o.estado !== "Anulada").length;
    },

    ordenesPorFeria: (state) => (feriaId) => {
      return state.ordenes.filter((o) => o.feria_id === feriaId);
    },

    ordenesPorCentro: (state) => (centroId) => {
      return state.ordenes.filter((o) => o.centro_id === centroId);
    },
  },

  actions: {
    async fetchOrdenes() {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from("ordenes_compra")
          .select(
            `
            *,
            feria:ferias (
              id,
              nombre
            ),
            centro:centros_comerciales (
              id,
              nombre
            )
          `
          )
          .order("fecha_oc", { ascending: false });

        if (error) throw error;

        this.ordenes = data || [];
      } catch (error) {
        console.error("Error fetching ordenes:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createOrden(orden) {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from("ordenes_compra")
          .insert([orden])
          .select()
          .single();

        if (error) throw error;

        await this.fetchOrdenes();
        return { success: true, data };
      } catch (error) {
        console.error("Error creating orden:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateOrden(id, updates) {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from("ordenes_compra")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        await this.fetchOrdenes();
        return { success: true, data };
      } catch (error) {
        console.error("Error updating orden:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteOrden(id) {
      this.loading = true;
      this.error = null;

      try {
        const { error } = await supabase
          .from("ordenes_compra")
          .delete()
          .eq("id", id);

        if (error) throw error;

        await this.fetchOrdenes();
        return { success: true };
      } catch (error) {
        console.error("Error deleting orden:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
