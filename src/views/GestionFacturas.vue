<template>
    <div class="gestion-facturas">
        <!-- Breadcrumb -->
        <Breadcrumb :items="breadcrumbItems" />

        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">
                <i class="fas fa-file-invoice-dollar me-2"></i>Gestión de Facturas
            </h2>
            <button class="btn btn-primary" @click="openCreateModal">
                <i class="fas fa-plus me-2"></i>Nueva Factura
            </button>
        </div>

        <!-- KPIs -->
        <div class="row g-3 mb-4">
            <div class="col-md-3">
                <div class="card stat-card stat-primary">
                    <div class="card-body">
                        <div class="stat-icon">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Total Facturado</div>
                            <div class="stat-value">${{ formatNumber(facturasStore.totalFacturado) }}</div>
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
                            <div class="stat-label">Total Pagado</div>
                            <div class="stat-value">${{ formatNumber(facturasStore.totalPagado) }}</div>
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
                            <div class="stat-value">${{ formatNumber(facturasStore.totalPendiente) }}</div>
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
                            <div class="stat-value">{{ facturasStore.cantidadFacturas }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filtros -->
        <FilterBar :show-search="true" search-placeholder="Buscar por número, emprendimiento..." :show-date-range="true"
            :show-estado="true" :estados="['Pendiente', 'Pagada', 'Anulada']" @filter="handleFilter" />

        <!-- Acciones -->
        <div class="d-flex justify-content-end mb-3">
            <button class="btn btn-success" @click="exportarExcel" :disabled="facturasFiltradas.length === 0">
                <i class="fas fa-file-excel me-2"></i>Exportar a Excel
            </button>
        </div>

        <!-- Tabla -->
        <div class="card">
            <div class="card-body">
                <div v-if="facturasStore.loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>

                <div v-else-if="facturasStore.error" class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error al cargar facturas: {{ facturasStore.error }}
                </div>

                <div v-else-if="facturasFiltradas.length === 0" class="text-center py-5 text-muted">
                    <i class="fas fa-inbox fa-3x mb-3"></i>
                    <p class="mb-0">No hay facturas para mostrar</p>
                </div>

                <div v-else class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th style="cursor: pointer" @click="sort('numero_factura')">
                                    N° Factura <i :class="getSortIcon('numero_factura')"></i>
                                </th>
                                <th style="cursor: pointer" @click="sort('emprendimiento.nombre_emprendimiento')">
                                    Emprendimiento <i :class="getSortIcon('emprendimiento.nombre_emprendimiento')"></i>
                                </th>
                                <th style="cursor: pointer" @click="sort('feria.nombre')">
                                    Feria <i :class="getSortIcon('feria.nombre')"></i>
                                </th>
                                <th style="cursor: pointer" @click="sort('monto')">
                                    Monto <i :class="getSortIcon('monto')"></i>
                                </th>
                                <th style="cursor: pointer" @click="sort('fecha_factura')">
                                    Fecha <i :class="getSortIcon('fecha_factura')"></i>
                                </th>
                                <th style="cursor: pointer" @click="sort('estado')">
                                    Estado <i :class="getSortIcon('estado')"></i>
                                </th>
                                <th>Descripción</th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="factura in facturasOrdenadas" :key="factura.id">
                                <td><strong>{{ factura.numero_factura }}</strong></td>
                                <td>
                                    {{ factura.emprendimiento?.nombre_emprendimiento }}<br />
                                    <small class="text-muted">{{ factura.emprendimiento?.rut }}</small>
                                </td>
                                <td>
                                    <span v-if="factura.feria">
                                        {{ factura.feria.nombre }}<br />
                                        <small class="text-muted">{{ factura.feria.centro_comercial?.nombre }}</small>
                                    </span>
                                    <span v-else class="text-muted">-</span>
                                </td>
                                <td><strong>${{ formatNumber(factura.monto) }}</strong></td>
                                <td>{{ formatDate(factura.fecha_factura) }}</td>
                                <td>
                                    <span class="badge" :class="getEstadoBadgeClass(factura.estado)">
                                        {{ factura.estado }}
                                    </span>
                                </td>
                                <td>
                                    <span v-if="factura.descripcion" class="text-truncate"
                                        style="max-width: 200px; display: inline-block;">
                                        {{ factura.descripcion }}
                                    </span>
                                    <span v-else class="text-muted">-</span>
                                </td>
                                <td class="text-center">
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary" @click="openEditModal(factura)"
                                            title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-outline-danger" @click="confirmarEliminar(factura)"
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
                            {{ editingFactura ? 'Editar' : 'Nueva' }} Factura
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="submitForm">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Número de Factura *</label>
                                    <input type="text" class="form-control" v-model="formData.numero_factura"
                                        required />
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Emprendimiento *</label>
                                    <select class="form-select" v-model="formData.emprendimiento_id" required>
                                        <option value="">Seleccione...</option>
                                        <option v-for="emp in emprendimientosStore.businesses" :key="emp.id"
                                            :value="emp.id">
                                            {{ emp.nombre_emprendimiento }} - {{ emp.rut }}
                                        </option>
                                    </select>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Feria</label>
                                    <select class="form-select" v-model="formData.feria_id">
                                        <option value="">Sin feria</option>
                                        <option v-for="feria in feriasStore.ferias" :key="feria.id" :value="feria.id">
                                            {{ feria.nombre }}
                                        </option>
                                    </select>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Monto *</label>
                                    <input type="number" step="0.01" class="form-control" v-model="formData.monto"
                                        required />
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Fecha Factura *</label>
                                    <input type="date" class="form-control" v-model="formData.fecha_factura" required />
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Estado *</label>
                                    <select class="form-select" v-model="formData.estado" required>
                                        <option value="Pendiente">Pendiente</option>
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
import { useFacturasStore } from '../stores/facturas'
import { useBusinessesStore } from '../stores/businesses'
import { useFeriasStore } from '../stores/ferias'
import { useNotifications } from '../composables/useNotifications'
import { useTableSort } from '../composables/useTableSort'
import { exportFacturasToExcel } from '../services/exportService'
import Breadcrumb from '../components/common/Breadcrumb.vue'
import FilterBar from '../components/common/FilterBar.vue'

const facturasStore = useFacturasStore()
const emprendimientosStore = useBusinessesStore()
const feriasStore = useFeriasStore()
const { showSuccess, showError } = useNotifications()

const formModal = ref(null)
let modalInstance = null

const editingFactura = ref(null)
const saving = ref(false)

const formData = ref({
    numero_factura: '',
    emprendimiento_id: '',
    feria_id: '',
    participacion_id: '',
    monto: 0,
    fecha_factura: new Date().toISOString().split('T')[0],
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
    { text: 'Facturas', icon: 'fas fa-file-invoice-dollar' }
]

// Filtrado
const facturasFiltradas = computed(() => {
    let resultado = facturasStore.facturas

    if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase()
        resultado = resultado.filter(f =>
            f.numero_factura?.toLowerCase().includes(searchLower) ||
            f.emprendimiento?.nombre_emprendimiento?.toLowerCase().includes(searchLower) ||
            f.emprendimiento?.rut?.toLowerCase().includes(searchLower)
        )
    }

    if (filters.value.fechaDesde) {
        resultado = resultado.filter(f => f.fecha_factura >= filters.value.fechaDesde)
    }

    if (filters.value.fechaHasta) {
        resultado = resultado.filter(f => f.fecha_factura <= filters.value.fechaHasta)
    }

    if (filters.value.estado) {
        resultado = resultado.filter(f => f.estado === filters.value.estado)
    }

    return resultado
})

// Ordenamiento
const { sortedData: facturasOrdenadas, sort, getSortIcon } = useTableSort(facturasFiltradas, 'fecha_factura', 'desc')

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
        'Pagada': 'bg-success',
        'Anulada': 'bg-danger'
    }
    return classes[estado] || 'bg-secondary'
}

function openCreateModal() {
    editingFactura.value = null
    formData.value = {
        numero_factura: '',
        emprendimiento_id: '',
        feria_id: '',
        participacion_id: '',
        monto: 0,
        fecha_factura: new Date().toISOString().split('T')[0],
        estado: 'Pendiente',
        descripcion: ''
    }
    modalInstance.show()
}

function openEditModal(factura) {
    editingFactura.value = factura
    formData.value = {
        numero_factura: factura.numero_factura,
        emprendimiento_id: factura.emprendimiento_id,
        feria_id: factura.feria_id || '',
        participacion_id: factura.participacion_id || '',
        monto: factura.monto,
        fecha_factura: factura.fecha_factura,
        estado: factura.estado,
        descripcion: factura.descripcion || ''
    }
    modalInstance.show()
}

async function submitForm() {
    saving.value = true
    try {
        const data = {
            ...formData.value,
            feria_id: formData.value.feria_id || null,
            participacion_id: formData.value.participacion_id || null
        }

        if (editingFactura.value) {
            await facturasStore.updateFactura(editingFactura.value.id, data)
            showSuccess('Factura actualizada exitosamente')
        } else {
            await facturasStore.createFactura(data)
            showSuccess('Factura creada exitosamente')
        }

        modalInstance.hide()
    } catch (error) {
        showError('Error al guardar la factura')
    } finally {
        saving.value = false
    }
}

async function confirmarEliminar(factura) {
    if (confirm(`¿Está seguro de eliminar la factura ${factura.numero_factura}?`)) {
        try {
            await facturasStore.deleteFactura(factura.id)
            showSuccess('Factura eliminada exitosamente')
        } catch (error) {
            showError('Error al eliminar la factura')
        }
    }
}

function exportarExcel() {
    exportFacturasToExcel(facturasFiltradas.value)
    showSuccess('Facturas exportadas a Excel')
}

onMounted(async () => {
    modalInstance = new Modal(formModal.value)
    await facturasStore.fetchFacturas()
    await emprendimientosStore.loadBusinesses()
    await feriasStore.cargarFerias()
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

.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
