import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
  },
  {
    path: '/centros',
    name: 'MallsManagement',
    component: () => import('../views/GestionCentros.vue'),
  },
  {
    path: '/emprendimientos',
    name: 'BusinessesManagement',
    component: () => import('../views/GestionEmprendimientos.vue'),
  },
  {
    path: '/ferias',
    name: 'FairsManagement',
    component: () => import('../views/GestionFerias.vue'),
  },
  {
    path: '/coordinadores',
    name: 'CoordinatorsManagement',
    component: () => import('../views/GestionCoordinadores.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
