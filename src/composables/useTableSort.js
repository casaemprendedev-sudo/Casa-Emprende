import { ref, computed } from "vue";

/**
 * Composable para ordenamiento de tablas
 * @param {Ref} data - Ref con array de datos a ordenar
 * @param {String} initialSortKey - Clave inicial para ordenar
 * @param {String} initialSortOrder - Orden inicial ('asc' o 'desc')
 */
export function useTableSort(
  data,
  initialSortKey = null,
  initialSortOrder = "asc"
) {
  const sortKey = ref(initialSortKey);
  const sortOrder = ref(initialSortOrder);

  const sortedData = computed(() => {
    if (!sortKey.value) return data.value;

    return [...data.value].sort((a, b) => {
      let aVal = getNestedValue(a, sortKey.value);
      let bVal = getNestedValue(b, sortKey.value);

      // Manejar valores null/undefined
      if (aVal == null) return sortOrder.value === "asc" ? 1 : -1;
      if (bVal == null) return sortOrder.value === "asc" ? -1 : 1;

      // Comparación numérica
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder.value === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Comparación de fechas (ISO string)
      if (isISODate(aVal) && isISODate(bVal)) {
        const dateA = new Date(aVal);
        const dateB = new Date(bVal);
        return sortOrder.value === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Comparación de strings (case insensitive)
      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();

      if (sortOrder.value === "asc") {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
  });

  function sort(key) {
    if (sortKey.value === key) {
      // Toggle order si es la misma columna
      sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
      // Nueva columna, orden ascendente por defecto
      sortKey.value = key;
      sortOrder.value = "asc";
    }
  }

  function getSortIcon(key) {
    if (sortKey.value !== key) return "fas fa-sort";
    return sortOrder.value === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
  }

  function resetSort() {
    sortKey.value = initialSortKey;
    sortOrder.value = initialSortOrder;
  }

  // Helper para obtener valores anidados (e.g., 'emprendimiento.nombre')
  function getNestedValue(obj, path) {
    return path.split(".").reduce((current, prop) => current?.[prop], obj);
  }

  // Helper para detectar fechas ISO
  function isISODate(str) {
    if (typeof str !== "string") return false;
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}/;
    return isoDateRegex.test(str);
  }

  return {
    sortedData,
    sortKey,
    sortOrder,
    sort,
    getSortIcon,
    resetSort,
  };
}
