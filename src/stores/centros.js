import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "../lib/supabase";

export const useCentrosStore = defineStore("centros", () => {
  const centros = ref([]);
  const zonas = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Computed
  const totalCentros = computed(() => centros.value.length);
  const centrosActivos = computed(() =>
    centros.value.filter((c) => c.activo !== false)
  );

  // Cargar centros desde Supabase
  async function cargarCentros() {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from("centros_comerciales")
        .select("*")
        .is("deleted_at", null)
        .order("nombre");

      if (err) throw err;
      centros.value = data || [];
    } catch (err) {
      error.value = err.message;
      console.error("Error cargando centros:", err);
    } finally {
      loading.value = false;
    }
  }

  // Cargar zonas desde Supabase
  async function cargarZonas() {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from("zonas")
        .select("*")
        .is("deleted_at", null)
        .order("nombre");

      if (err) throw err;
      zonas.value = data || [];
    } catch (err) {
      error.value = err.message;
      console.error("Error cargando zonas:", err);
    } finally {
      loading.value = false;
    }
  }

  // Funciones
  async function agregarCentro(datos) {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from("centros_comerciales")
        .insert([
          {
            nombre: datos.nombre,
            direccion: datos.direccion || null,
            telefono: datos.telefono || null,
            email: datos.email || null,
          },
        ])
        .select()
        .single();

      if (err) throw err;
      centros.value.push(data);
      return data;
    } catch (err) {
      error.value = err.message;
      console.error("Error agregando centro:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function agregarZona(centroId, datosZona) {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from("zonas")
        .insert([
          {
            centro_comercial_id: centroId,
            nombre: datosZona.nombre,
            capacidad_maxima: datosZona.capacidadMaxima || null,
            descripcion: datosZona.descripcion || null,
          },
        ])
        .select()
        .single();

      if (err) throw err;
      zonas.value.push(data);
      return data;
    } catch (err) {
      error.value = err.message;
      console.error("Error agregando zona:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function actualizarCentro(id, datos) {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from("centros_comerciales")
        .update({
          nombre: datos.nombre,
          direccion: datos.direccion,
          telefono: datos.telefono,
          email: datos.email,
        })
        .eq("id", id)
        .select()
        .single();

      if (err) throw err;

      const index = centros.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        centros.value[index] = data;
      }
      return data;
    } catch (err) {
      error.value = err.message;
      console.error("Error actualizando centro:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function actualizarZona(centroId, zonaId, datos) {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from("zonas")
        .update({
          nombre: datos.nombre,
          capacidad_maxima: datos.capacidadMaxima,
          descripcion: datos.descripcion,
        })
        .eq("id", zonaId)
        .select()
        .single();

      if (err) throw err;

      const index = zonas.value.findIndex((z) => z.id === zonaId);
      if (index !== -1) {
        zonas.value[index] = data;
      }
      return data;
    } catch (err) {
      error.value = err.message;
      console.error("Error actualizando zona:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function eliminarCentro(id) {
    loading.value = true;
    error.value = null;
    try {
      const { error: err } = await supabase
        .from("centros_comerciales")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (err) throw err;

      const index = centros.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        centros.value.splice(index, 1);
      }
      return true;
    } catch (err) {
      error.value = err.message;
      console.error("Error eliminando centro:", err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function eliminarZona(centroId, zonaId) {
    loading.value = true;
    error.value = null;
    try {
      const { error: err } = await supabase
        .from("zonas")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", zonaId);

      if (err) throw err;

      const index = zonas.value.findIndex((z) => z.id === zonaId);
      if (index !== -1) {
        zonas.value.splice(index, 1);
      }
      return true;
    } catch (err) {
      error.value = err.message;
      console.error("Error eliminando zona:", err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  function obtenerPorId(id) {
    return centros.value.find((c) => c.id === id);
  }

  function obtenerZonasPorCentro(centroId) {
    return zonas.value.filter((z) => z.centro_comercial_id === centroId);
  }

  // Inicializar: cargar datos al crear el store
  cargarCentros();
  cargarZonas();

  return {
    centros,
    zonas,
    loading,
    error,
    totalCentros,
    centrosActivos,
    agregarCentro,
    agregarZona,
    actualizarCentro,
    actualizarZona,
    eliminarCentro,
    eliminarZona,
    obtenerPorId,
    obtenerZonasPorCentro,
    cargarCentros,
    cargarZonas,
  };
});
