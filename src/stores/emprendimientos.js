import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "../lib/supabase";

export const useEmprendimientosStore = defineStore("emprendimientos", () => {
  const emprendimientos = ref([]);
  const categorias = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Computed
  const totalEmprendimientos = computed(
    () => emprendimientos.value.filter((e) => !e.deleted_at && e.activo).length
  );

  const emprendimientosPorCategoria = computed(() => {
    return emprendimientos.value
      .filter((e) => !e.deleted_at && e.activo)
      .reduce((acc, emp) => {
        const catNombre = emp.categoria?.nombre || "Sin Categoría";
        if (!acc[catNombre]) acc[catNombre] = [];
        acc[catNombre].push(emp);
        return acc;
      }, {});
  });

  // ===== CATEGORÍAS =====
  async function cargarCategorias() {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: err } = await supabase
        .from("categorias_emprendimiento")
        .select("*")
        .eq("activo", true)
        .order("orden", { ascending: true });

      if (err) throw err;
      categorias.value = data || [];
    } catch (err) {
      error.value = err.message;
      console.error("Error cargando categorías:", err);
    } finally {
      loading.value = false;
    }
  }

  // ===== EMPRENDIMIENTOS =====
  async function cargarEmprendimientos() {
    try {
      loading.value = true;
      error.value = null;

      // Cargar emprendimientos con categoría y contactos
      const { data, error: err } = await supabase
        .from("emprendimientos")
        .select(
          `
          *,
          categoria:categorias_emprendimiento(id, nombre),
          contactos(*)
        `
        )
        .is("deleted_at", null)
        .order("nombre_emprendimiento", { ascending: true });

      if (err) throw err;
      emprendimientos.value = data || [];
    } catch (err) {
      error.value = err.message;
      console.error("Error cargando emprendimientos:", err);
    } finally {
      loading.value = false;
    }
  }

  async function agregarEmprendimiento(datos) {
    try {
      loading.value = true;
      error.value = null;

      // 1. Crear emprendimiento
      const { data: emprendimiento, error: err } = await supabase
        .from("emprendimientos")
        .insert({
          nombre_emprendedor: datos.nombreEmprendedor,
          rut: datos.rut,
          email: datos.correo,
          telefono: datos.telefono,
          nombre_emprendimiento: datos.nombreEmprendimiento,
          categoria_id: datos.categoriaId,
          descripcion: datos.descripcion || null,
          instagram: datos.instagram || null,
          activo: true,
          usar_datos_dueno: datos.usarDatosDueno !== false,
          facturacion_rut: datos.facturacion?.rut || null,
          facturacion_razon_social: datos.facturacion?.razonSocial || null,
          facturacion_giro: datos.facturacion?.giro || null,
          facturacion_direccion: datos.facturacion?.direccion || null,
          facturacion_comuna: datos.facturacion?.comuna || null,
          facturacion_telefono: datos.facturacion?.telefono || null,
        })
        .select(
          `
          *,
          categoria:categorias_emprendimiento(id, nombre)
        `
        )
        .single();

      if (err) throw err;

      // 2. Crear contacto principal (datos del emprendedor)
      const { error: errContactoPrincipal } = await supabase
        .from("contactos")
        .insert({
          emprendimiento_id: emprendimiento.id,
          tipo: "principal",
          nombre: datos.nombreEmprendedor,
          telefono: datos.telefono,
          email: datos.correo,
          es_principal: true,
        });

      if (errContactoPrincipal) throw errContactoPrincipal;

      // 3. Crear contacto de pagos (si es diferente)
      if (datos.contactoPagos?.nombre) {
        const { error: errContactoPagos } = await supabase
          .from("contactos")
          .insert({
            emprendimiento_id: emprendimiento.id,
            tipo: "pagos",
            nombre: datos.contactoPagos.nombre,
            telefono: datos.contactoPagos.telefono || null,
            email: datos.contactoPagos.correo || null,
            es_principal: false,
          });

        if (errContactoPagos) throw errContactoPagos;
      }

      // Recargar lista completa con contactos
      await cargarEmprendimientos();
      return emprendimiento;
    } catch (err) {
      error.value = err.message;
      console.error("Error agregando emprendimiento:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function actualizarEmprendimiento(id, datos) {
    try {
      loading.value = true;
      error.value = null;

      // 1. Actualizar emprendimiento
      const { error: err } = await supabase
        .from("emprendimientos")
        .update({
          nombre_emprendedor: datos.nombreEmprendedor,
          rut: datos.rut,
          email: datos.correo,
          telefono: datos.telefono,
          nombre_emprendimiento: datos.nombreEmprendimiento,
          categoria_id: datos.categoriaId,
          descripcion: datos.descripcion,
          instagram: datos.instagram,
          activo: datos.activo,
          usar_datos_dueno: datos.usarDatosDueno !== false,
          facturacion_rut: datos.facturacion?.rut || null,
          facturacion_razon_social: datos.facturacion?.razonSocial || null,
          facturacion_giro: datos.facturacion?.giro || null,
          facturacion_direccion: datos.facturacion?.direccion || null,
          facturacion_comuna: datos.facturacion?.comuna || null,
          facturacion_telefono: datos.facturacion?.telefono || null,
        })
        .eq("id", id);

      if (err) throw err;

      // 2. Actualizar contacto principal
      const { error: errContactoPrincipal } = await supabase
        .from("contactos")
        .update({
          nombre: datos.nombreEmprendedor,
          telefono: datos.telefono,
          email: datos.correo,
        })
        .eq("emprendimiento_id", id)
        .eq("tipo", "principal");

      if (errContactoPrincipal) throw errContactoPrincipal;

      // 3. Actualizar o crear contacto de pagos
      if (datos.contactoPagos?.nombre) {
        const { data: existente } = await supabase
          .from("contactos")
          .select("id")
          .eq("emprendimiento_id", id)
          .eq("tipo", "pagos")
          .single();

        if (existente) {
          // Actualizar existente
          await supabase
            .from("contactos")
            .update({
              nombre: datos.contactoPagos.nombre,
              telefono: datos.contactoPagos.telefono,
              email: datos.contactoPagos.correo,
            })
            .eq("id", existente.id);
        } else {
          // Crear nuevo
          await supabase.from("contactos").insert({
            emprendimiento_id: id,
            tipo: "pagos",
            nombre: datos.contactoPagos.nombre,
            telefono: datos.contactoPagos.telefono,
            email: datos.contactoPagos.correo,
            es_principal: false,
          });
        }
      }

      await cargarEmprendimientos();
    } catch (err) {
      error.value = err.message;
      console.error("Error actualizando emprendimiento:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function eliminarEmprendimiento(id) {
    try {
      loading.value = true;
      error.value = null;

      // Soft delete
      const { error: err } = await supabase
        .from("emprendimientos")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (err) throw err;

      await cargarEmprendimientos();
    } catch (err) {
      error.value = err.message;
      console.error("Error eliminando emprendimiento:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function obtenerPorId(id) {
    return emprendimientos.value.find((e) => e.id === id);
  }

  function buscarPorNombre(texto) {
    const busqueda = texto.toLowerCase();
    return emprendimientos.value.filter(
      (e) =>
        !e.deleted_at &&
        (e.nombre_emprendimiento?.toLowerCase().includes(busqueda) ||
          e.nombre_emprendedor?.toLowerCase().includes(busqueda) ||
          e.rut?.toLowerCase().includes(busqueda))
    );
  }

  // Cargar datos al inicializar
  cargarCategorias();
  cargarEmprendimientos();

  return {
    emprendimientos,
    categorias,
    loading,
    error,
    totalEmprendimientos,
    emprendimientosPorCategoria,
    cargarCategorias,
    cargarEmprendimientos,
    agregarEmprendimiento,
    actualizarEmprendimiento,
    eliminarEmprendimiento,
    obtenerPorId,
    buscarPorNombre,
  };
});
