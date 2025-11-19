import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "../lib/supabase";

export const useParticipacionesStore = defineStore("participaciones", () => {
  const participaciones = ref([]);
  const itemsMobiliario = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Computed
  const totalParticipaciones = computed(
    () => participaciones.value.filter((p) => !p.deleted_at).length
  );

  // ===== ITEMS DE MOBILIARIO =====
  async function cargarItemsMobiliario() {
    try {
      const { data, error: err } = await supabase
        .from("items_mobiliario")
        .select("*")
        .eq("activo", true)
        .order("nombre", { ascending: true });

      if (err) throw err;
      itemsMobiliario.value = data || [];
    } catch (err) {
      console.error("Error cargando items de mobiliario:", err);
    }
  }

  // ===== PARTICIPACIONES =====
  async function cargarParticipaciones() {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: err } = await supabase
        .from("participaciones")
        .select(
          `
          *,
          feria:ferias(id, nombre, fecha_inicio, fecha_fin),
          emprendimiento:emprendimientos(id, nombre_emprendimiento, nombre_emprendedor),
          mobiliario:participacion_mobiliario(
            id,
            cantidad,
            item:items_mobiliario(id, nombre, precio)
          )
        `
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (err) throw err;
      participaciones.value = data || [];
    } catch (err) {
      error.value = err.message;
      console.error("Error cargando participaciones:", err);
    } finally {
      loading.value = false;
    }
  }

  async function agregarParticipacion(datos) {
    try {
      loading.value = true;
      error.value = null;

      // 1. Crear participación
      const { data: participacion, error: err } = await supabase
        .from("participaciones")
        .insert({
          feria_id: datos.feriaId,
          emprendimiento_id: datos.emprendimientoId,
          numero_puesto: datos.numeroPuesto,
          precio_base: datos.precioBase || 0,
          descuento_porcentaje: datos.descuento || 0,
          descuento_monto: datos.descuentoMonto || 0,
          subtotal: datos.subtotal || 0,
          cargo_mobiliario: datos.cargoMobiliario || 0,
          precio_neto: datos.precioNeto || 0,
          iva: datos.iva || 0,
          total: datos.total || 0,
          monto_final: datos.montoFinal || 0,
          monto_pagado: 0,
          estado_pago: "Pendiente",
          mobiliario_extra: datos.mobiliarioExtra || null,
          observaciones: datos.observaciones || null,
        })
        .select()
        .single();

      if (err) throw err;

      // 2. Asociar mobiliario seleccionado
      if (datos.mobiliarioItems && datos.mobiliarioItems.length > 0) {
        const mobiliarioInserts = datos.mobiliarioItems.map((item) => ({
          participacion_id: participacion.id,
          item_mobiliario_id: item.itemId,
          cantidad: item.cantidad || 1,
        }));

        const { error: errMob } = await supabase
          .from("participacion_mobiliario")
          .insert(mobiliarioInserts);

        if (errMob) throw errMob;
      }

      await cargarParticipaciones();
      return participacion;
    } catch (err) {
      error.value = err.message;
      console.error("Error agregando participación:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function actualizarParticipacion(id, datos) {
    try {
      loading.value = true;
      error.value = null;

      const { error: err } = await supabase
        .from("participaciones")
        .update({
          numero_puesto: datos.numeroPuesto,
          precio_base: datos.precioBase,
          descuento_porcentaje: datos.descuento,
          descuento_monto: datos.descuentoMonto,
          subtotal: datos.subtotal,
          cargo_mobiliario: datos.cargoMobiliario,
          precio_neto: datos.precioNeto,
          iva: datos.iva,
          total: datos.total,
          monto_final: datos.montoFinal,
          mobiliario_extra: datos.mobiliarioExtra,
          observaciones: datos.observaciones,
        })
        .eq("id", id);

      if (err) throw err;

      // Actualizar mobiliario si se proporciona
      if (datos.mobiliarioItems !== undefined) {
        // Eliminar mobiliario existente
        await supabase
          .from("participacion_mobiliario")
          .delete()
          .eq("participacion_id", id);

        // Insertar nuevo mobiliario
        if (datos.mobiliarioItems.length > 0) {
          const mobiliarioInserts = datos.mobiliarioItems.map((item) => ({
            participacion_id: id,
            item_mobiliario_id: item.itemId,
            cantidad: item.cantidad || 1,
          }));

          await supabase
            .from("participacion_mobiliario")
            .insert(mobiliarioInserts);
        }
      }

      await cargarParticipaciones();
    } catch (err) {
      error.value = err.message;
      console.error("Error actualizando participación:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function eliminarParticipacion(id) {
    try {
      loading.value = true;
      error.value = null;

      // Soft delete
      const { error: err } = await supabase
        .from("participaciones")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (err) throw err;

      await cargarParticipaciones();
    } catch (err) {
      error.value = err.message;
      console.error("Error eliminando participación:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function actualizarMontoPagado(participacionId, nuevoMonto) {
    try {
      loading.value = true;
      error.value = null;

      const participacion = participaciones.value.find(
        (p) => p.id === participacionId
      );
      if (!participacion) throw new Error("Participación no encontrada");

      let estadoPago = "Pendiente";
      if (nuevoMonto >= participacion.monto_final) {
        estadoPago = "Completo";
      } else if (nuevoMonto > 0) {
        estadoPago = "Parcial";
      }

      const { error: err } = await supabase
        .from("participaciones")
        .update({
          monto_pagado: nuevoMonto,
          estado_pago: estadoPago,
        })
        .eq("id", participacionId);

      if (err) throw err;

      await cargarParticipaciones();
    } catch (err) {
      error.value = err.message;
      console.error("Error actualizando monto pagado:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ===== HELPERS =====
  function obtenerPorId(id) {
    return participaciones.value.find((p) => p.id === id);
  }

  function obtenerPorFeria(feriaId) {
    return participaciones.value.filter(
      (p) => !p.deleted_at && p.feria_id === feriaId
    );
  }

  function obtenerPorEmprendimiento(emprendimientoId) {
    return participaciones.value.filter(
      (p) => !p.deleted_at && p.emprendimiento_id === emprendimientoId
    );
  }

  function calcularIngresosFeria(feriaId) {
    const participacionesFeria = obtenerPorFeria(feriaId);
    return participacionesFeria.reduce(
      (sum, p) => sum + (p.monto_pagado || 0),
      0
    );
  }

  function calcularIngresosEsperados(feriaId) {
    const participacionesFeria = obtenerPorFeria(feriaId);
    return participacionesFeria.reduce(
      (sum, p) => sum + (p.monto_final || 0),
      0
    );
  }

  function calcularPrecios(
    precioBase,
    descuentoPorcentaje,
    cargoMobiliario = 0
  ) {
    const descuentoMonto = (precioBase * descuentoPorcentaje) / 100;
    const subtotal = precioBase - descuentoMonto;
    const precioNeto = subtotal + cargoMobiliario;
    const iva = precioNeto * 0.19;
    const total = precioNeto + iva;

    return {
      precioBase,
      descuentoPorcentaje,
      descuentoMonto: Math.round(descuentoMonto),
      subtotal: Math.round(subtotal),
      cargoMobiliario,
      precioNeto: Math.round(precioNeto),
      iva: Math.round(iva),
      total: Math.round(total),
      montoFinal: Math.round(total),
    };
  }

  // Cargar datos al inicializar
  cargarItemsMobiliario();
  cargarParticipaciones();

  return {
    participaciones,
    itemsMobiliario,
    loading,
    error,
    totalParticipaciones,
    cargarItemsMobiliario,
    cargarParticipaciones,
    agregarParticipacion,
    actualizarParticipacion,
    eliminarParticipacion,
    actualizarMontoPagado,
    obtenerPorId,
    obtenerPorFeria,
    obtenerPorEmprendimiento,
    calcularIngresosFeria,
    calcularIngresosEsperados,
    calcularPrecios,
  };
});
