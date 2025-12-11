<template>
    <div class="gestion-ordenes">
        <!-- Breadcrumb -->
        <Breadcrumb :items="breadcrumbItems" />

        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">
                <i class="fas fa-file-invoice me-2"></i>Gestión de Órdenes de Compra
            </h2>
            <button class="btn btn-primary" @click="openCreateModal">
                <i class="fas fa-plus me-2"></i>Nueva Orden de Compra
            </button>
        </div>

        <!-- KPIs -->
        <div class="row g-3 mb-4">
            <div class="col-md-3">
                <div class="card stat-card stat-primary">
                    <div class="card-body">
                        <div class="stat-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Total Ordenado</div>
                            <div class="stat-value">${{ formatNumber(ordenesStore.totalOrdenado) }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card stat-success">
                    <div class="card-body">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Total Aprobado</div>
                            <div class="stat-value">${{ formatNumber(ordenesStore.totalAprobado) }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card stat-warning">
                    <div class="card-body">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Pendiente</div>
                            <div class="stat-value">${{ formatNumber(ordenesStore.totalPendiente) }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card stat-info">
                    <div class="card-body">
                        <div class="stat-icon">
                            <i class="fas fa-hashtag"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Cantidad</div>
                            <div class="stat-value">{{ ordenesStore.cantidadOrdenes }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filtros -->
        <FilterBar :show-search="true" search-placeholder="Buscar por número, proveedor..." :show-date-range="true"
            :show-estado="true" :estados="['Pendiente', 'Aprobada', 'Rechazada', 'Pagada', 'Anulada']"
            @filter="handleFilter" />

        <!-- Acciones -->
        <div class="d-flex justify-content-end mb-3">
            <button class="btn btn-success" @click="exportarExcel" :disabled="ordenesFiltradas.length === 0">
                <i class="fas fa-file-excel me-2"></i>Exportar a Excel
            </button>
        </div>

        <!-- Tabla -->
        <div class="card">
            <div class="card-body">
                <div v-if="ordenesStore.loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>

                <div v-else-if="ordenesStore.error" class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error al cargar órdenes: {{ ordenesStore.error }}
                </div>

                <div v-else-if="ordenesFiltradas.length === 0" class="text-center py-5 text-muted">
                    <i class="fas fa-inbox fa-3x mb-3"></i>
                    <p class="mb-0">No hay órdenes de compra para mostrar</p>
                </div>

                <div v-else class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th style="cursor: pointer" @click="sort('numero_oc')">
                                    N° OC <i :class="getSortIcon('numero_oc')"></i>
                                </th>
                                <th style="cursor: pointer" @click="sort('feria.nombre')">
                                    Feria <i :class="getSortIcon('feria.nombre')"></i>
                                </th>
                                <th style="cursor: pointer" @click="sort('centro.nombre')">
                                    Centro <i :class="getSortIcon('centro.nombre')"></i>
                                </th>
                                <th style="cursor: pointer" @click="sort('proveedor')">
                                    Proveedor <i :class="getSortIcon('proveedor')"></i>
                                </th>
                                <th style="cursor: pointer" @click="sort('monto')">
                                    Monto <i :class="getSortIcon('monto')"></i>
                                </th>
                                <th style="cursor: pointer" @click="sort('fecha_oc')">
                                    Fecha <i :class="getSortIcon('fecha_oc')"></i>
                                </th>
                                <th style="cursor: pointer" @click="sort('estado')">
                                    Estado <i :class="getSortIcon('estado')"></i>
                                </th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="orden in ordenesOrdenadas" :key="orden.id">
                                <td><strong>{{ orden.numero_oc }}</strong></td>
                                <td>{{ orden.feria?.nombre }}</td>
                                <td>{{ orden.centro?.nombre }}</td>
                                <td>{{ orden.proveedor || '-' }}</td>
                                <td><strong>${{ formatNumber(orden.monto) }}</strong></td>
                                <td>{{ formatDate(orden.fecha_oc) }}</td>
                                <td>
                                    <span class="badge" :class="getEstadoBadgeClass(orden.estado)">
                                        {{ orden.estado }}
                                    </span>
                                </td>
                                <td class="text-center">
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary" @click="openEditModal(orden)"
                                            title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-outline-danger" @click="confirmarEliminar(orden)"
                                            title="Eliminar">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal Crear/Editar -->
        <div class="modal fade" ref="formModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-file-invoice me-2"></i>
                            {{ editingOrden ? 'Editar' : 'Nueva' }} Orden de Compra
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="submitForm">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Número de OC *</label>
                                    <input type="text" class="form-control" v-model="formData.numero_oc" required />
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Feria *</label>
                                    <select class="form-select" v-model="formData.feria_id" @change="onFeriaChange"
                                        required>
                                        <option value="">Seleccione...</option>
                                        <option v-for="feria in feriasStore.ferias" :key="feria.id" :value="feria.id">
                                            {{ feria.nombre }}
                                        </option>
                                    </select>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Centro Comercial *</label>
                                    <select class="form-select" v-model="formData.centro_id" required>
                                        <option value="">Seleccione...</option>
                                        <option v-for="centro in centrosStore.malls" :key="centro.id"
                                            :value="centro.id">
                                            {{ centro.nombre }}
                                        </option>
                                    </select>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Proveedor</label>
                                    <input type="text" class="form-control" v-model="formData.proveedor" />
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Monto *</label>
                                    <input type="number" step="0.01" class="form-control" v-model="formData.monto"
                                        required />
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Fecha OC *</label>
                                    <input type="date" class="form-control" v-model="formData.fecha_oc" required />
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Estado *</label>
                                    <select class="form-select" v-model="formData.estado" required>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Aprobada">Aprobada</option>
                                        <option value="Rechazada">Rechazada</option>
                                        <option value="Pagada">Pagada</option>
                                        <option value="Anulada">Anulada</option>
                                    </select>
                                </div>

                                <div class="col-12">
                                    <label class="form-label">Descripción</label>
                                    <textarea class="form-control" rows="3" v-model="formData.descripcion"></textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-primary" @click="submitForm" :disabled="saving">
                            <span v-if="saving">
                                <span class="spinner-border spinner-border-sm me-2"></span>
                                Guardando...
                            </span>
                            <span v-else>
                                <i class="fas fa-save me-2"></i>Guardar
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { useOrdenesCompraStore } from '../stores/ordenesCompra'
import { useFeriasStore } from '../stores/ferias'
import { useMallsStore } from '../stores/malls'
import { useNotifications } from '../composables/useNotifications'
import { useTableSort } from '../composables/useTableSort'
import { exportOrdenesCompraToExcel } from '../services/exportService'
import Breadcrumb from '../components/common/Breadcrumb.vue'
import FilterBar from '../components/common/FilterBar.vue'

const ordenesStore = useOrdenesCompraStore()
const feriasStore = useFeriasStore()
const centrosStore = useMallsStore()
const { showSuccess, showError } = useNotifications()

const formModal = ref(null)
let modalInstance = null

const editingOrden = ref(null)
const saving = ref(false)

const formData = ref({
    numero_oc: '',
    feria_id: '',
    centro_id: '',
    proveedor: '',
    monto: 0,
    fecha_oc: new Date().toISOString().split('T')[0],
    estado: 'Pendiente',
    descripcion: ''
})

const filters = ref({
    search: '',
    fechaDesde: '',
    fechaHasta: '',
    estado: ''
})

const breadcrumbItems = [
    { text: 'Documentos', icon: 'fas fa-folder' },
    { text: 'Órdenes de Compra', icon: 'fas fa-file-invoice' }
]

// Filtrado
const ordenesFiltradas = computed(() => {
    let resultado = ordenesStore.ordenes

    if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase()
        resultado = resultado.filter(o =>
            o.numero_oc?.toLowerCase().includes(searchLower) ||
            o.proveedor?.toLowerCase().includes(searchLower) ||
            o.feria?.nombre?.toLowerCase().includes(searchLower)
        )
    }

    if (filters.value.fechaDesde) {
        resultado = resultado.filter(o => o.fecha_oc >= filters.value.fechaDesde)
    }

    if (filters.value.fechaHasta) {
        resultado = resultado.filter(o => o.fecha_oc <= filters.value.fechaHasta)
    }

    if (filters.value.estado) {
        resultado = resultado.filter(o => o.estado === filters.value.estado)
    }

    return resultado
})

// Ordenamiento
const { sortedData: ordenesOrdenadas, sort, getSortIcon } = useTableSort(ordenesFiltradas, 'fecha_oc', 'desc')

// Funciones
function handleFilter(newFilters) {
    filters.value = newFilters
}

function formatNumber(value) {
    return new Intl.NumberFormat('es-CL').format(value || 0)
}

function formatDate(date) {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-CL')
}

function getEstadoBadgeClass(estado) {
    const classes = {
        'Pendiente': 'bg-warning text-dark',
        'Aprobada': 'bg-info',
        'Rechazada': 'bg-danger',
        'Pagada': 'bg-success',
        'Anulada': 'bg-secondary'
    }
    return classes[estado] || 'bg-secondary'
}

function onFeriaChange() {
    // Auto-seleccionar centro comercial de la feria
    const feria = feriasStore.ferias.find(f => f.id === formData.value.feria_id)
    if (feria && feria.centro_id) {
        formData.value.centro_id = feria.centro_id
    }
}

function openCreateModal() {
    editingOrden.value = null
    formData.value = {
        numero_oc: '',
        feria_id: '',
        centro_id: '',
        proveedor: '',
        monto: 0,
        fecha_oc: new Date().toISOString().split('T')[0],
        estado: 'Pendiente',
        descripcion: ''
    }
    modalInstance.show()
}

function openEditModal(orden) {
    editingOrden.value = orden
    formData.value = {
        numero_oc: orden.numero_oc,
        feria_id: orden.feria_id,
        centro_id: orden.centro_id,
        proveedor: orden.proveedor || '',
        monto: orden.monto,
        fecha_oc: orden.fecha_oc,
        estado: orden.estado,
        descripcion: orden.descripcion || ''
    }
    modalInstance.show()
}

async function submitForm() {
    saving.value = true
    try {
        const data = { ...formData.value }

        if (editingOrden.value) {
            await ordenesStore.updateOrden(editingOrden.value.id, data)
            showSuccess('Orden de compra actualizada exitosamente')
        } else {
            await ordenesStore.createOrden(data)
            showSuccess('Orden de compra creada exitosamente')
        }

        modalInstance.hide()
    } catch (error) {
        showError('Error al guardar la orden de compra')
    } finally {
        saving.value = false
    }
}

async function confirmarEliminar(orden) {
    if (confirm(`¿Está seguro de eliminar la orden ${orden.numero_oc}?`)) {
        try {
            await ordenesStore.deleteOrden(orden.id)
            showSuccess('Orden de compra eliminada exitosamente')
        } catch (error) {
            showError('Error al eliminar la orden de compra')
        }
    }
}

function exportarExcel() {
    exportOrdenesCompraToExcel(ordenesFiltradas.value)
    showSuccess('Órdenes de compra exportadas a Excel')
}

onMounted(async () => {
    modalInstance = new Modal(formModal.value)
    await ordenesStore.fetchOrdenes()
    await feriasStore.cargarFerias()
    await centrosStore.loadMalls()
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

.stat-card.stat-info {
    border-left-color: #0dcaf0;
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

.table th {
    font-weight: 600;
    font-size: 0.9rem;
    white-space: nowrap;
}

.table td {
    font-size: 0.9rem;
}
</style>
