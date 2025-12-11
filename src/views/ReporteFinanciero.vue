<template>
    <div class="reporte-financiero">
        <Breadcrumb :items="breadcrumbItems" />

        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">
                <i class="fas fa-chart-bar me-2"></i>Reporte Financiero
            </h2>
        </div>

        <!-- Filtros -->
        <FilterBar :show-anio="true" :show-mes="true" :show-centro="true" :centros="centrosStore.malls"
            @filter="handleFilter" />

        <!-- KPIs Principales -->
        <div class="row g-3 mb-4">
            <div class="col-md-3">
                <div class="card stat-card stat-primary">
                    <div class="card-body">
                        <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                        <div class="stat-content">
                            <div class="stat-label">Ingresos Ferias</div>
                            <div class="stat-value">${{ formatNumber(kpis.ingresosFerias) }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card stat-success">
                    <div class="card-body">
                        <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="stat-content">
                            <div class="stat-label">Pagos Recibidos</div>
                            <div class="stat-value">${{ formatNumber(kpis.pagosRecibidos) }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card stat-warning">
                    <div class="card-body">
                        <div class="stat-icon"><i class="fas fa-clock"></i></div>
                        <div class="stat-content">
                            <div class="stat-label">Deuda Pendiente</div>
                            <div class="stat-value">${{ formatNumber(kpis.deudaPendiente) }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card stat-danger">
                    <div class="card-body">
                        <div class="stat-icon"><i class="fas fa-file-invoice"></i></div>
                        <div class="stat-content">
                            <div class="stat-label">Gastos OC</div>
                            <div class="stat-value">${{ formatNumber(kpis.gastosOC) }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Balance -->
        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="card text-center">
                    <div class="card-body">
                        <h6 class="text-muted">Total Ingresos</h6>
                        <h3 class="text-success">${{ formatNumber(balance.ingresos) }}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card text-center">
                    <div class="card-body">
                        <h6 class="text-muted">Total Gastos</h6>
                        <h3 class="text-danger">${{ formatNumber(balance.gastos) }}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card text-center">
                    <div class="card-body">
                        <h6 class="text-muted">Balance Neto</h6>
                        <h3 :class="balance.neto >= 0 ? 'text-success' : 'text-danger'">
                            ${{ formatNumber(balance.neto) }}
                        </h3>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'ferias' }" @click="activeTab = 'ferias'">
                    <i class="fas fa-calendar-alt me-1"></i>Ferias
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'facturas' }" @click="activeTab = 'facturas'">
                    <i class="fas fa-file-invoice-dollar me-1"></i>Facturas
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'ordenes' }" @click="activeTab = 'ordenes'">
                    <i class="fas fa-file-invoice me-1"></i>Órdenes de Compra
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'pagos' }" @click="activeTab = 'pagos'">
                    <i class="fas fa-money-bill-wave me-1"></i>Pagos
                </a>
            </li>
        </ul>

        <!-- Tab Content -->
        <div class="card">
            <div class="card-body">
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border text-primary"></div>
                </div>
                <div v-else>
                    <!-- Tab Ferias -->
                    <div v-show="activeTab === 'ferias'">
                        <p class="text-muted">Listado de ferias con ingresos generados</p>
                    </div>

                    <!-- Tab Facturas -->
                    <div v-show="activeTab === 'facturas'">
                        <p class="text-muted">Resumen de facturas emitidas</p>
                    </div>

                    <!-- Tab Órdenes -->
                    <div v-show="activeTab === 'ordenes'">
                        <p class="text-muted">Resumen de órdenes de compra</p>
                    </div>

                    <!-- Tab Pagos -->
                    <div v-show="activeTab === 'pagos'">
                        <p class="text-muted">Resumen de pagos recibidos</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMallsStore } from '../stores/malls'
import { useFacturasStore } from '../stores/facturas'
import { useOrdenesCompraStore } from '../stores/ordenesCompra'
import { usePaymentsStore } from '../stores/payments'
import Breadcrumb from '../components/common/Breadcrumb.vue'
import FilterBar from '../components/common/FilterBar.vue'

const centrosStore = useMallsStore()
const facturasStore = useFacturasStore()
const ordenesStore = useOrdenesCompraStore()
const pagosStore = usePaymentsStore()

const loading = ref(false)
const activeTab = ref('ferias')
const filters = ref({})

const breadcrumbItems = [
    { text: 'Reportes', icon: 'fas fa-chart-bar' },
    { text: 'Financiero', icon: 'fas fa-chart-bar' }
]

const kpis = computed(() => ({
    ingresosFerias: facturasStore.totalFacturado,
    pagosRecibidos: pagosStore.totalPagado || facturasStore.totalPagado,
    deudaPendiente: facturasStore.totalPendiente,
    gastosOC: ordenesStore.totalOrdenado
}))

const balance = computed(() => ({
    ingresos: kpis.value.pagosRecibidos,
    gastos: kpis.value.gastosOC,
    neto: kpis.value.pagosRecibidos - kpis.value.gastosOC
}))

function handleFilter(newFilters) {
    filters.value = newFilters
}

function formatNumber(value) {
    return new Intl.NumberFormat('es-CL').format(value || 0)
}

onMounted(async () => {
    loading.value = true
    try {
        await Promise.all([
            centrosStore.loadMalls(),
            facturasStore.fetchFacturas(),
            ordenesStore.fetchOrdenes()
        ])
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.stat-card {
    border-left: 4px solid;
    transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.stat-card.stat-primary {
    border-left-color: #0d6efd;
}

.stat-card.stat-success {
    border-left-color: #198754;
}

.stat-card.stat-warning {
    border-left-color: #ffc107;
}

.stat-card.stat-danger {
    border-left-color: #dc3545;
}

.stat-card .card-body {
    display: flex;
    align-items: center;
    padding: 1.25rem;
}

.stat-icon {
    font-size: 2.5rem;
    opacity: 0.3;
    margin-right: 1rem;
}

.stat-content {
    flex: 1;
}

.stat-label {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #212529;
}

.nav-link {
    cursor: pointer;
}
</style>
