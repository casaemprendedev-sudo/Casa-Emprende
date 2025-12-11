import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: () => import("../views/Dashboard.vue"),
  },
  {
    path: "/centros",
    name: "MallsManagement",
    component: () => import("../views/GestionCentros.vue"),
  },
  {
    path: "/emprendimientos",
    name: "BusinessesManagement",
    component: () => import("../views/GestionEmprendimientos.vue"),
  },
  {
    path: "/ferias",
    name: "FairsManagement",
    component: () => import("../views/GestionFeriasNuevo.vue"),
  },
  {
    path: "/coordinadores",
    name: "CoordinatorsManagement",
    component: () => import("../views/GestionCoordinadores.vue"),
  },
  {
    path: "/facturas",
    name: "FacturasManagement",
    component: () => import("../views/GestionFacturas.vue"),
  },
  {
    path: "/ordenes-compra",
    name: "OrdenesCompraManagement",
    component: () => import("../views/GestionOrdenesCompra.vue"),
  },
  {
    path: "/documentos",
    name: "DocumentosManagement",
    component: () => import("../views/GestionDocumentos.vue"),
  },
  {
    path: "/reporte-financiero",
    name: "ReporteFinanciero",
    component: () => import("../views/ReporteFinanciero.vue"),
  },
  {
    path: "/reporte-participaciones",
    name: "ReporteParticipaciones",
    component: () => import("../views/ReporteParticipaciones.vue"),
  },
  {
    path: "/reporte-centros",
    name: "ReporteCentros",
    component: () => import("../views/ReporteCentros.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
