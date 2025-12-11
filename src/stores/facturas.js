import { defineStore } from "pinia";
import { supabase } from "../lib/supabase";

export const useFacturasStore = defineStore("facturas", {
  state: () => ({
    facturas: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalFacturado: (state) => {
      return state.facturas
        .filter((f) => f.estado !== "Anulada")
        .reduce((sum, f) => sum + parseFloat(f.monto || 0), 0);
    },

    totalPagado: (state) => {
      return state.facturas
        .filter((f) => f.estado === "Pagada")
        .reduce((sum, f) => sum + parseFloat(f.monto || 0), 0);
    },

    totalPendiente: (state) => {
      return state.facturas
        .filter((f) => f.estado === "Pendiente")
        .reduce((sum, f) => sum + parseFloat(f.monto || 0), 0);
    },

    cantidadFacturas: (state) => {
      return state.facturas.filter((f) => f.estado !== "Anulada").length;
    },

    facturasPorEmprendimiento: (state) => (emprendimientoId) => {
      return state.facturas.filter(
        (f) => f.emprendimiento_id === emprendimientoId
      );
    },

    facturasPorFeria: (state) => (feriaId) => {
      return state.facturas.filter((f) => f.feria_id === feriaId);
    },
  },

  actions: {
    async fetchFacturas() {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from("facturas")
          .select(
            `
            *,
            emprendimiento:emprendimientos (
              id,
              nombre_emprendimiento,
              nombre_emprendedor,
              rut
            ),
            feria:ferias (
              id,
              nombre,
              centro_comercial:centros_comerciales (
                id,
                nombre
              )
            ),
            participacion:participaciones (
              id,
              numero_puesto
            )
          `
          )
          .order("fecha_factura", { ascending: false });

        if (error) throw error;

        this.facturas = data || [];
      } catch (error) {
        console.error("Error fetching facturas:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createFactura(factura) {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from("facturas")
          .insert([factura])
          .select()
          .single();

        if (error) throw error;

        await this.fetchFacturas();
        return { success: true, data };
      } catch (error) {
        console.error("Error creating factura:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateFactura(id, updates) {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from("facturas")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        await this.fetchFacturas();
        return { success: true, data };
      } catch (error) {
        console.error("Error updating factura:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteFactura(id) {
      this.loading = true;
      this.error = null;

      try {
        const { error } = await supabase.from("facturas").delete().eq("id", id);

        if (error) throw error;

        await this.fetchFacturas();
        return { success: true };
      } catch (error) {
        console.error("Error deleting factura:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
