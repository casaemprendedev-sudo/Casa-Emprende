import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "../lib/supabase";

export const useCoordinadoresStore = defineStore("coordinadores", () => {
  const coordinadores = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Computed
  const coordinadoresActivos = computed(() =>
    coordinadores.value.filter((c) => c.activo && !c.deleted_at)
  );

  const totalCoordinadores = computed(
    () => coordinadores.value.filter((c) => !c.deleted_at).length
  );

  // ===== CARGAR COORDINADORES =====
  async function cargarCoordinadores() {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from("coordinadores")
        .select("*")
        .is("deleted_at", null)
        .order("nombre", { ascending: true });

      if (err) throw err;
      coordinadores.value = data || [];
    } catch (err) {
      console.error("Error cargando coordinadores:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ===== CREAR COORDINADOR =====
  async function crearCoordinador(coordinadorData) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from("coordinadores")
        .insert([
          {
            nombre: coordinadorData.nombre,
            rut: coordinadorData.rut,
            email: coordinadorData.email || null,
            telefono: coordinadorData.telefono || null,
            activo:
              coordinadorData.activo !== undefined
                ? coordinadorData.activo
                : true,
          },
        ])
        .select()
        .single();

      if (err) throw err;

      coordinadores.value.push(data);
      return data;
    } catch (err) {
      console.error("Error creando coordinador:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ===== ACTUALIZAR COORDINADOR =====
  async function actualizarCoordinador(id, coordinadorData) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from("coordinadores")
        .update({
          nombre: coordinadorData.nombre,
          rut: coordinadorData.rut,
          email: coordinadorData.email || null,
          telefono: coordinadorData.telefono || null,
          activo: coordinadorData.activo,
        })
        .eq("id", id)
        .select()
        .single();

      if (err) throw err;

      const index = coordinadores.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        coordinadores.value[index] = data;
      }

      return data;
    } catch (err) {
      console.error("Error actualizando coordinador:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ===== ELIMINAR COORDINADOR (SOFT DELETE) =====
  async function eliminarCoordinador(id) {
    loading.value = true;
    error.value = null;

    try {
      const { error: err } = await supabase
        .from("coordinadores")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (err) throw err;

      coordinadores.value = coordinadores.value.filter((c) => c.id !== id);
    } catch (err) {
      console.error("Error eliminando coordinador:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ===== OBTENER COORDINADOR POR ID =====
  function obtenerPorId(id) {
    return coordinadores.value.find((c) => c.id === id && !c.deleted_at);
  }

  // ===== VALIDAR RUT ÚNICO =====
  async function validarRutUnico(rut, idExcluir = null) {
    try {
      let query = supabase
        .from("coordinadores")
        .select("id")
        .eq("rut", rut)
        .is("deleted_at", null);

      if (idExcluir) {
        query = query.neq("id", idExcluir);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      return data.length === 0; // true si es único
    } catch (err) {
      console.error("Error validando RUT:", err);
      throw err;
    }
  }

  return {
    // State
    coordinadores,
    loading,
    error,

    // Computed
    coordinadoresActivos,
    totalCoordinadores,

    // Actions
    cargarCoordinadores,
    crearCoordinador,
    actualizarCoordinador,
    eliminarCoordinador,
    obtenerPorId,
    validarRutUnico,
  };
});
