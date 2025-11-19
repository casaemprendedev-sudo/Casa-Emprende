<script setup>
import ToastContainer from './components/common/ToastContainer.vue'

// Note: Stores are now lazy-loaded in their respective views
// No need to initialize them here
</script>

<template>
  <ToastContainer />
  <div class="wrapper">
    <!-- Navbar -->
    <nav class="main-header navbar navbar-expand navbar-white navbar-light">
      <!-- Left navbar links -->
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" data-widget="pushmenu" href="#" role="button">
            <i class="fas fa-bars"></i>
          </a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
          <span class="nav-link font-weight-bold" style="color: #1e293b;">
            <i class="fas fa-store-alt mr-2" style="color: #4f46e5;"></i>
            Casa Emprende
          </span>
        </li>
      </ul>

      <!-- Right navbar links -->
      <ul class="navbar-nav ml-auto">
        <li class="nav-item dropdown">
          <a class="nav-link" href="#" role="button" title="Auto-guardado activo">
            <i class="fas fa-cloud-upload-alt text-success mr-1"></i>
            <span class="d-none d-md-inline text-muted small">Guardado automático</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" role="button" title="Ayuda">
            <i class="fas fa-question-circle text-muted"></i>
          </a>
        </li>
      </ul>
    </nav>

    <!-- Main Sidebar -->
    <aside class="main-sidebar sidebar-dark-primary elevation-4">
      <!-- Brand Logo -->
      <a href="#" class="brand-link text-center">
        <i class="fas fa-store-alt mr-2" style="font-size: 1.5rem;"></i>
        <span class="brand-text">Casa Emprende</span>
      </a>

      <!-- Sidebar -->
      <div class="sidebar">
        <!-- User Panel (opcional) -->
        <div class="user-panel mt-3 pb-3 mb-3 d-flex" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div class="info" style="margin-left: 0; width: 100%; text-align: center;">
            <a href="#" class="d-block" style="color: rgba(255,255,255,0.8); font-size: 0.9rem;">
              <i class="fas fa-user-circle mr-2"></i>Sistema de Gestión
            </a>
          </div>
        </div>

        <!-- Sidebar Menu -->
        <nav class="mt-2">
          <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
            <li class="nav-item">
              <router-link to="/" class="nav-link">
                <i class="nav-icon fas fa-chart-line"></i>
                <p>Dashboard</p>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/centros" class="nav-link">
                <i class="nav-icon fas fa-building"></i>
                <p>Centros Comerciales</p>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/emprendimientos" class="nav-link">
                <i class="nav-icon fas fa-briefcase"></i>
                <p>Emprendimientos</p>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/ferias" class="nav-link">
                <i class="nav-icon fas fa-calendar-check"></i>
                <p>Ferias</p>
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/coordinadores" class="nav-link">
                <i class="nav-icon fas fa-user-tie"></i>
                <p>Coordinadores</p>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>

    <!-- Content Wrapper -->
    <div class="content-wrapper">
      <!-- Main content -->
      <section class="content">
        <div class="container-fluid">
          <router-view />
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer class="main-footer">
      <div class="float-right d-none d-sm-inline-block">
        <strong>v1.0.0</strong>
      </div>
      <strong>
        <i class="fas fa-copyright mr-1"></i>
        {{ new Date().getFullYear() }} Casa Emprende
      </strong>
      <span class="text-muted ml-2">· Sistema de Gestión de Ferias</span>
    </footer>
  </div>
</template>

<style>
/* AdminLTE ya está cargado via CDN en index.html */
.router-link-active {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
