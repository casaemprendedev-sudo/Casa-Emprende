import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Exporta datos a Excel
 * @param {Array} data - Array de objetos con los datos
 * @param {String} filename - Nombre del archivo sin extensión
 * @param {String} sheetName - Nombre de la hoja
 */
export function exportToExcel(data, filename = "export", sheetName = "Datos") {
  try {
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // Convertir datos a hoja
    const ws = XLSX.utils.json_to_sheet(data);

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generar archivo
    XLSX.writeFile(wb, `${filename}.xlsx`);

    return { success: true };
  } catch (error) {
    console.error("Error al exportar a Excel:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Exporta datos a PDF
 * @param {Array} columns - Array de nombres de columnas
 * @param {Array} data - Array de arrays con los datos
 * @param {String} filename - Nombre del archivo sin extensión
 * @param {String} title - Título del documento
 */
export function exportToPDF(
  columns,
  data,
  filename = "export",
  title = "Reporte"
) {
  try {
    const doc = new jsPDF();

    // Agregar título
    doc.setFontSize(16);
    doc.text(title, 14, 20);

    // Agregar fecha
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-CL")}`, 14, 28);

    // Agregar tabla
    doc.autoTable({
      head: [columns],
      body: data,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 58, 64] },
    });

    // Guardar PDF
    doc.save(`${filename}.pdf`);

    return { success: true };
  } catch (error) {
    console.error("Error al exportar a PDF:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Exporta estado de cuenta a Excel
 */
export function exportEstadoCuentaToExcel(data, totales) {
  try {
    const dataForExport = data.map((item) => ({
      Emprendimiento: item.nombreEmprendimiento,
      Emprendedor: item.nombreEmprendedor,
      RUT: item.rut,
      "Total Deuda": item.totalDeuda,
      "Total Pagado": item.totalPagado,
      "Saldo Pendiente": item.saldoPendiente,
      "% Pagado": item.porcentajePagado,
      "Total Ferias": item.totalFerias,
    }));

    // Agregar fila de totales
    dataForExport.push({
      Emprendimiento: "TOTALES",
      Emprendedor: "",
      RUT: "",
      "Total Deuda": totales.totalDeuda,
      "Total Pagado": totales.totalPagado,
      "Saldo Pendiente": totales.saldoPendiente,
      "% Pagado": totales.porcentajePagado,
      "Total Ferias": totales.totalFerias,
    });

    return exportToExcel(
      dataForExport,
      `estado-cuenta-${new Date().toISOString().split("T")[0]}`,
      "Estado de Cuenta"
    );
  } catch (error) {
    console.error("Error al exportar estado de cuenta:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Exporta facturas a Excel
 */
export function exportFacturasToExcel(facturas) {
  try {
    const dataForExport = facturas.map((f) => ({
      "N° Factura": f.numero_factura,
      Emprendimiento: f.emprendimiento?.nombre_emprendimiento,
      RUT: f.emprendimiento?.rut,
      Feria: f.feria?.nombre || "-",
      Monto: f.monto,
      Fecha: f.fecha_factura,
      Estado: f.estado,
      Descripción: f.descripcion || "-",
    }));

    return exportToExcel(
      dataForExport,
      `facturas-${new Date().toISOString().split("T")[0]}`,
      "Facturas"
    );
  } catch (error) {
    console.error("Error al exportar facturas:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Exporta órdenes de compra a Excel
 */
export function exportOrdenesCompraToExcel(ordenes) {
  try {
    const dataForExport = ordenes.map((o) => ({
      "N° OC": o.numero_oc,
      Feria: o.feria?.nombre,
      "Centro Comercial": o.centro?.nombre,
      Proveedor: o.proveedor || "-",
      Monto: o.monto,
      Fecha: o.fecha_oc,
      Estado: o.estado,
      Descripción: o.descripcion || "-",
    }));

    return exportToExcel(
      dataForExport,
      `ordenes-compra-${new Date().toISOString().split("T")[0]}`,
      "Órdenes de Compra"
    );
  } catch (error) {
    console.error("Error al exportar órdenes de compra:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Exporta ferias a Excel
 */
export function exportFeriasToExcel(ferias) {
  try {
    const dataForExport = ferias.map((f) => ({
      Nombre: f.nombre,
      "Centro Comercial": f.centro_comercial?.nombre,
      "Fecha Inicio": f.fecha_inicio,
      "Fecha Fin": f.fecha_fin,
      "Stands Totales": f.stands_totales,
      "Stands Ocupados": f.stands_ocupados,
      "Precio Base": f.precio_base_puesto,
      Estado: f.estado,
    }));

    return exportToExcel(
      dataForExport,
      `ferias-${new Date().toISOString().split("T")[0]}`,
      "Ferias"
    );
  } catch (error) {
    console.error("Error al exportar ferias:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Exporta emprendimientos a Excel
 */
export function exportEmprendimientosToExcel(emprendimientos) {
  try {
    const dataForExport = emprendimientos.map((e) => ({
      Emprendimiento: e.nombre_emprendimiento,
      Emprendedor: e.nombre_emprendedor,
      RUT: e.rut,
      Email: e.email || "-",
      Teléfono: e.telefono || "-",
      Categoría: e.categoria?.nombre || "-",
      Activo: e.activo ? "Sí" : "No",
    }));

    return exportToExcel(
      dataForExport,
      `emprendimientos-${new Date().toISOString().split("T")[0]}`,
      "Emprendimientos"
    );
  } catch (error) {
    console.error("Error al exportar emprendimientos:", error);
    return { success: false, error: error.message };
  }
}
