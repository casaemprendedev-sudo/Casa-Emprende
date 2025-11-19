import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "../lib/supabase";
import { useParticipacionesStore } from "./participaciones";

export const useAbonosStore = defineStore("abonos", () => {
  const abonos = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Computed
  const totalAbonos = computed(() => abonos.value.length);

  // ===== ABONOS =====
  async function cargarAbonos() {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: err } = await supabase
        .from("abonos")
        .select(
          `
          *,
          participacion:participaciones(
            id,
            numero_puesto,
            monto_final,
            feria:ferias(id, nombre),
            emprendimiento:emprendimientos(id, nombre_emprendimiento)
          )
        `
        )
        .order("fecha", { ascending: false });

      if (err) throw err;
      abonos.value = data || [];
    } catch (err) {
      error.value = err.message;
      console.error("Error cargando abonos:", err);
    } finally {
      loading.value = false;
    }
  }

  async function registrarAbono(datos) {
    try {
      loading.value = true;
      error.value = null;

      // 1. Obtener siguiente número de abono
      const { data: abonosExistentes, error: errCount } = await supabase
        .from("abonos")
        .select("numero_abono")
        .eq("participacion_id", datos.participacionId)
        .order("numero_abono", { ascending: false })
        .limit(1);

      if (errCount) throw errCount;

      const siguienteNumero =
        abonosExistentes.length > 0 ? abonosExistentes[0].numero_abono + 1 : 1;

      // 2. Crear abono
      const { data: abono, error: err } = await supabase
        .from("abonos")
        .insert({
          participacion_id: datos.participacionId,
          numero_abono: siguienteNumero,
          fecha: datos.fecha,
          monto: datos.monto,
          banco: datos.banco || null,
          numero_operacion: datos.numeroOperacion || null,
          comprobante_url: datos.comprobanteUrl || null,
          notas: datos.notas || null,
        })
        .select()
        .single();

      if (err) throw err;

      // 3. Actualizar monto pagado en participación
      const participacionesStore = useParticipacionesStore();
      const { data: participacion } = await supabase
        .from("participaciones")
        .select("monto_pagado")
        .eq("id", datos.participacionId)
        .single();

      const nuevoMontoPagado = (participacion?.monto_pagado || 0) + datos.monto;
      await participacionesStore.actualizarMontoPagado(
        datos.participacionId,
        nuevoMontoPagado
      );

      await cargarAbonos();
      return abono;
    } catch (err) {
      error.value = err.message;
      console.error("Error registrando abono:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function actualizarAbono(id, datos) {
    try {
      loading.value = true;
      error.value = null;

      // 1. Obtener abono anterior
      const { data: abonoAnterior } = await supabase
        .from("abonos")
        .select("monto, participacion_id")
        .eq("id", id)
        .single();

      if (!abonoAnterior) throw new Error("Abono no encontrado");

      // 2. Actualizar abono
      const { error: err } = await supabase
        .from("abonos")
        .update({
          fecha: datos.fecha,
          monto: datos.monto,
          banco: datos.banco,
          numero_operacion: datos.numeroOperacion,
          comprobante_url: datos.comprobanteUrl,
          notas: datos.notas,
        })
        .eq("id", id);

      if (err) throw err;

      // 3. Ajustar monto pagado si cambió el monto
      const diferenciaMonto = datos.monto - abonoAnterior.monto;
      if (diferenciaMonto !== 0) {
        const participacionesStore = useParticipacionesStore();
        const { data: participacion } = await supabase
          .from("participaciones")
          .select("monto_pagado")
          .eq("id", abonoAnterior.participacion_id)
          .single();

        const nuevoMontoPagado =
          (participacion?.monto_pagado || 0) + diferenciaMonto;
        await participacionesStore.actualizarMontoPagado(
          abonoAnterior.participacion_id,
          nuevoMontoPagado
        );
      }

      await cargarAbonos();
    } catch (err) {
      error.value = err.message;
      console.error("Error actualizando abono:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function eliminarAbono(id) {
    try {
      loading.value = true;
      error.value = null;

      // 1. Obtener datos del abono antes de eliminar
      const { data: abono } = await supabase
        .from("abonos")
        .select("monto, participacion_id")
        .eq("id", id)
        .single();

      if (!abono) throw new Error("Abono no encontrado");

      // 2. Eliminar abono
      const { error: err } = await supabase
        .from("abonos")
        .delete()
        .eq("id", id);

      if (err) throw err;

      // 3. Actualizar monto pagado en participación
      const participacionesStore = useParticipacionesStore();
      const { data: participacion } = await supabase
        .from("participaciones")
        .select("monto_pagado")
        .eq("id", abono.participacion_id)
        .single();

      const nuevoMontoPagado = (participacion?.monto_pagado || 0) - abono.monto;
      await participacionesStore.actualizarMontoPagado(
        abono.participacion_id,
        nuevoMontoPagado
      );

      await cargarAbonos();
    } catch (err) {
      error.value = err.message;
      console.error("Error eliminando abono:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ===== SUPABASE STORAGE: Comprobantes =====
  async function subirComprobante(abonoId, file) {
    try {
      // Validar que el archivo exista
      if (!file || !file.name) {
        throw new Error("Archivo no válido");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${abonoId}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; // Solo el nombre del archivo, no la carpeta

      const { data, error: err } = await supabase.storage
        .from("comprobantes")
        .upload(filePath, file);

      if (err) throw err;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("comprobantes")
        .getPublicUrl(filePath);

      // Actualizar el abono con la URL del comprobante
      await supabase
        .from("abonos")
        .update({ comprobante_url: urlData.publicUrl })
        .eq("id", abonoId);

      await cargarAbonos();
      return urlData.publicUrl;
    } catch (err) {
      console.error("Error subiendo comprobante:", err);
      throw err;
    }
  }

  async function eliminarComprobante(url) {
    try {
      // Extraer path del URL
      const parts = url.split("/object/public/comprobantes/");
      if (parts.length < 2) return;
      const fileName = parts[1];

      const { error: err } = await supabase.storage
        .from("comprobantes")
        .remove([fileName]);

      if (err) throw err;
    } catch (err) {
      console.error("Error eliminando comprobante:", err);
    }
  }

  // ===== HELPERS =====
  function obtenerPorParticipacion(participacionId) {
    return abonos.value.filter((a) => a.participacion_id === participacionId);
  }

  function calcularTotalAbonos(participacionId) {
    const abonosParticipacion = obtenerPorParticipacion(participacionId);
    return abonosParticipacion.reduce((sum, a) => sum + (a.monto || 0), 0);
  }

  // Cargar datos al inicializar
  cargarAbonos();

  return {
    abonos,
    loading,
    error,
    totalAbonos,
    cargarAbonos,
    registrarAbono,
    actualizarAbono,
    eliminarAbono,
    subirComprobante,
    eliminarComprobante,
    obtenerPorParticipacion,
    calcularTotalAbonos,
  };
});
