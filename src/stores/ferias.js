import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "../lib/supabase";

export const ESTADOS_FERIA = [
  "Planificada",
  "Montada",
  "En Curso",
  "Desmontada",
  "Cancelada",
];

export const TIPOS_FERIA = {
  FIJA: "fija",
  ITINERANTE: "itinerante",
};

export const useFeriasStore = defineStore("ferias", () => {
  const ferias = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Computed
  const totalFerias = computed(
    () => ferias.value.filter((f) => !f.deleted_at).length
  );

  const feriasActivas = computed(() => {
    return ferias.value.filter(
      (f) =>
        !f.deleted_at && (f.estado === "En Curso" || f.estado === "Montada")
    );
  });

  // Ferias por tipo
  const feriasFijas = computed(() => {
    return ferias.value.filter(
      (f) => !f.deleted_at && f.tipo_feria === TIPOS_FERIA.FIJA
    );
  });

  const feriasItinerantes = computed(() => {
    return ferias.value.filter(
      (f) => !f.deleted_at && f.tipo_feria === TIPOS_FERIA.ITINERANTE
    );
  });

  const feriasFijasActivas = computed(() => {
    return feriasFijas.value.filter(
      (f) => f.estado === "En Curso" || f.estado === "Montada"
    );
  });

  const feriasItinerantesActivas = computed(() => {
    return feriasItinerantes.value.filter(
      (f) => f.estado === "En Curso" || f.estado === "Montada"
    );
  });

  // ===== FERIAS =====
  async function cargarFerias() {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: err } = await supabase
        .from("ferias")
        .select(
          `
          *,
          centro:centros_comerciales(id, nombre),
          zona:zonas(id, nombre),
          coordinador:coordinadores(id, nombre, rut, telefono, email),
          gastos:gastos_feria(*)
        `
        )
        .is("deleted_at", null)
        .order("fecha_inicio", { ascending: false });

      if (err) throw err;
      ferias.value = data || [];
    } catch (err) {
      error.value = err.message;
      console.error("Error cargando ferias:", err);
    } finally {
      loading.value = false;
    }
  }

  async function agregarFeria(datos) {
    try {
      loading.value = true;
      error.value = null;

      // 1. Crear feria
      const { data: feria, error: err } = await supabase
        .from("ferias")
        .insert({
          nombre: datos.nombre,
          tipo_feria: datos.tipoFeria || TIPOS_FERIA.ITINERANTE,
          fecha_inicio: datos.fechaInicio,
          fecha_fin: datos.fechaFin,
          centro_comercial_id: datos.centroComercialId,
          zona_id: datos.zonaId,
          coordinador_id: datos.coordinadorId || null,
          limite_puestos: datos.limitePuestos,
          precio_base_puesto: datos.precioBasePuesto || 0,
          moneda: datos.moneda || "CLP",
          valor_uf: datos.valorUF || null,
          estado: "Planificada",
          notas: datos.notas || null,
        })
        .select(
          `
          *,
          centro:centros_comerciales(id, nombre),
          zona:zonas(id, nombre),
          coordinador:coordinadores(id, nombre, rut, telefono, email)
        `
        )
        .single();

      if (err) throw err;

      // 2. Crear gastos iniciales si se proporcionaron
      if (datos.gastos) {
        const gastosArray = [];
        if (datos.gastos.coordinadores > 0) {
          gastosArray.push({
            feria_id: feria.id,
            categoria: "coordinadores",
            monto: datos.gastos.coordinadores,
            descripcion: "Gastos de coordinadores",
          });
        }
        if (datos.gastos.montaje > 0) {
          gastosArray.push({
            feria_id: feria.id,
            categoria: "montaje",
            monto: datos.gastos.montaje,
            descripcion: "Gastos de montaje",
          });
        }
        if (datos.gastos.flete > 0) {
          gastosArray.push({
            feria_id: feria.id,
            categoria: "flete",
            monto: datos.gastos.flete,
            descripcion: "Gastos de flete",
          });
        }
        if (datos.gastos.otros > 0) {
          gastosArray.push({
            feria_id: feria.id,
            categoria: "otros",
            monto: datos.gastos.otros,
            descripcion: "Otros gastos",
          });
        }

        if (gastosArray.length > 0) {
          await supabase.from("gastos_feria").insert(gastosArray);
        }
      }

      await cargarFerias();
      return feria;
    } catch (err) {
      error.value = err.message;
      console.error("Error agregando feria:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function actualizarFeria(id, datos) {
    try {
      loading.value = true;
      error.value = null;

      const { error: err } = await supabase
        .from("ferias")
        .update({
          nombre: datos.nombre,
          fecha_inicio: datos.fechaInicio,
          fecha_fin: datos.fechaFin,
          centro_comercial_id: datos.centroComercialId,
          zona_id: datos.zonaId,
          coordinador_id: datos.coordinadorId || null,
          limite_puestos: datos.limitePuestos,
          precio_base_puesto: datos.precioBasePuesto,
          moneda: datos.moneda,
          valor_uf: datos.valorUF,
          notas: datos.notas,
        })
        .eq("id", id);

      if (err) throw err;

      await cargarFerias();
    } catch (err) {
      error.value = err.message;
      console.error("Error actualizando feria:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function cambiarEstado(id, nuevoEstado) {
    try {
      if (!ESTADOS_FERIA.includes(nuevoEstado)) {
        throw new Error("Estado inválido");
      }

      loading.value = true;
      error.value = null;

      // El trigger registrar_cambio_estado_feria automáticamente
      // insertará en historial_estados_feria
      const { error: err } = await supabase
        .from("ferias")
        .update({ estado: nuevoEstado })
        .eq("id", id);

      if (err) throw err;

      await cargarFerias();
    } catch (err) {
      error.value = err.message;
      console.error("Error cambiando estado:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function eliminarFeria(id) {
    try {
      loading.value = true;
      error.value = null;

      // Soft delete
      const { error: err } = await supabase
        .from("ferias")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (err) throw err;

      await cargarFerias();
    } catch (err) {
      error.value = err.message;
      console.error("Error eliminando feria:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ===== GASTOS =====
  async function agregarGasto(feriaId, gasto) {
    try {
      loading.value = true;
      error.value = null;

      const { error: err } = await supabase.from("gastos_feria").insert({
        feria_id: feriaId,
        categoria: gasto.categoria,
        descripcion: gasto.descripcion,
        monto: gasto.monto,
        fecha: gasto.fecha || new Date().toISOString().split("T")[0],
        comprobante_url: gasto.comprobanteUrl || null,
      });

      if (err) throw err;

      await cargarFerias();
    } catch (err) {
      error.value = err.message;
      console.error("Error agregando gasto:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function actualizarGasto(gastoId, datos) {
    try {
      loading.value = true;
      error.value = null;

      const { error: err } = await supabase
        .from("gastos_feria")
        .update({
          categoria: datos.categoria,
          descripcion: datos.descripcion,
          monto: datos.monto,
          fecha: datos.fecha,
          comprobante_url: datos.comprobanteUrl,
        })
        .eq("id", gastoId);

      if (err) throw err;

      await cargarFerias();
    } catch (err) {
      error.value = err.message;
      console.error("Error actualizando gasto:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function eliminarGasto(gastoId) {
    try {
      loading.value = true;
      error.value = null;

      const { error: err } = await supabase
        .from("gastos_feria")
        .delete()
        .eq("id", gastoId);

      if (err) throw err;

      await cargarFerias();
    } catch (err) {
      error.value = err.message;
      console.error("Error eliminando gasto:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ===== HISTÓRICO DE ESTADOS =====
  async function obtenerHistorialEstados(feriaId) {
    try {
      const { data, error: err } = await supabase
        .from("historial_estados_feria")
        .select("*")
        .eq("feria_id", feriaId)
        .order("fecha_cambio", { ascending: false });

      if (err) throw err;
      return data || [];
    } catch (err) {
      console.error("Error obteniendo histórico de estados:", err);
      return [];
    }
  }

  // ===== HELPERS =====
  function obtenerPorId(id) {
    return ferias.value.find((f) => f.id === id);
  }

  function calcularTotalGastos(feria) {
    if (!feria.gastos || feria.gastos.length === 0) return 0;
    return feria.gastos.reduce((total, gasto) => total + (gasto.monto || 0), 0);
  }

  // ===== ASISTENCIA DE COORDINADORES =====
  async function cargarAsistencias(feriaId) {
    try {
      const { data, error: err } = await supabase
        .from("asistencia_coordinadores")
        .select("*")
        .eq("feria_id", feriaId)
        .order("fecha", { ascending: true });

      if (err) throw err;
      return data || [];
    } catch (err) {
      console.error("Error cargando asistencias:", err);
      throw err;
    }
  }

  async function guardarAsistencia(
    feriaId,
    coordinadorId,
    fecha,
    asistio,
    observaciones = null
  ) {
    try {
      // Intentar actualizar primero
      const { data: existing } = await supabase
        .from("asistencia_coordinadores")
        .select("id")
        .eq("feria_id", feriaId)
        .eq("coordinador_id", coordinadorId)
        .eq("fecha", fecha)
        .single();

      if (existing) {
        // Actualizar existente
        const { error: err } = await supabase
          .from("asistencia_coordinadores")
          .update({
            asistio,
            observaciones,
          })
          .eq("id", existing.id);

        if (err) throw err;
      } else {
        // Crear nuevo
        const { error: err } = await supabase
          .from("asistencia_coordinadores")
          .insert({
            feria_id: feriaId,
            coordinador_id: coordinadorId,
            fecha,
            asistio,
            observaciones,
          });

        if (err) throw err;
      }
    } catch (err) {
      console.error("Error guardando asistencia:", err);
      throw err;
    }
  }

  async function guardarAsistenciasMultiples(asistencias) {
    try {
      // Usar upsert para insertar o actualizar
      const { error: err } = await supabase
        .from("asistencia_coordinadores")
        .upsert(
          asistencias.map((a) => ({
            feria_id: a.feria_id,
            coordinador_id: a.coordinador_id,
            fecha: a.fecha,
            asistio: a.asistio,
            observaciones: a.observaciones || null,
          })),
          {
            onConflict: "feria_id,coordinador_id,fecha",
          }
        );

      if (err) throw err;
    } catch (err) {
      console.error("Error guardando asistencias múltiples:", err);
      throw err;
    }
  }

  // ===== FUNCIONES DE ASISTENCIA DE EMPRENDEDORES =====
  async function cargarAsistenciasEmprendedores(feriaId, fecha = null) {
    try {
      // Primero obtener las participaciones de la feria
      const { data: participaciones, error: errPart } = await supabase
        .from("participaciones")
        .select("id")
        .eq("feria_id", feriaId);

      if (errPart) throw errPart;

      if (!participaciones || participaciones.length === 0) {
        return [];
      }

      const participacionIds = participaciones.map((p) => p.id);

      // Luego obtener las asistencias de esas participaciones
      let query = supabase
        .from("asistencia_emprendedores")
        .select("*")
        .in("participacion_id", participacionIds);

      if (fecha) {
        query = query.eq("fecha", fecha);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      return data || [];
    } catch (err) {
      console.error("Error cargando asistencias de emprendedores:", err);
      throw err;
    }
  }

  async function guardarAsistenciasEmprendedores(asistencias) {
    try {
      const { error: err } = await supabase
        .from("asistencia_emprendedores")
        .upsert(
          asistencias.map((a) => ({
            participacion_id: a.participacion_id,
            fecha: a.fecha,
            llego_a_tiempo: a.llego_a_tiempo,
            observaciones: a.observaciones || null,
          })),
          {
            onConflict: "participacion_id,fecha",
          }
        );

      if (err) throw err;
    } catch (err) {
      console.error("Error guardando asistencias múltiples:", err);
      throw err;
    }
  }

  // Cargar datos al inicializar
  cargarFerias();

  return {
    ferias,
    loading,
    error,
    totalFerias,
    feriasActivas,
    feriasFijas,
    feriasItinerantes,
    feriasFijasActivas,
    feriasItinerantesActivas,
    cargarFerias,
    agregarFeria,
    actualizarFeria,
    cambiarEstado,
    eliminarFeria,
    agregarGasto,
    actualizarGasto,
    eliminarGasto,
    obtenerHistorialEstados,
    obtenerPorId,
    calcularTotalGastos,
    cargarAsistencias,
    guardarAsistencia,
    guardarAsistenciasMultiples,
    cargarAsistenciasEmprendedores,
    guardarAsistenciasEmprendedores,
    ESTADOS_FERIA,
    TIPOS_FERIA,
  };
});
