<template>
    <div class="gestion-documentos">
        <!-- Breadcrumb -->
        <Breadcrumb :items="breadcrumbItems" />

        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">
                <i class="fas fa-folder-open me-2"></i>Gestión de Documentos Drive
            </h2>
            <button class="btn btn-primary" @click="openCreateModal">
                <i class="fas fa-plus me-2"></i>Nuevo Documento
            </button>
        </div>

        <!-- Stats por tipo -->
        <div class="row g-3 mb-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title mb-3">
                            <i class="fas fa-chart-bar me-2"></i>Documentos por Tipo
                        </h6>
                        <div class="row">
                            <div class="col-md-3" v-for="(cantidad, tipo) in documentosStore.cantidadPorTipo"
                                :key="tipo">
                                <div class="stat-item">
                                    <div class="stat-tipo">{{ tipo }}</div>
                                    <div class="stat-cantidad">{{ cantidad }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filtros -->
        <FilterBar :show-search="true" search-placeholder="Buscar por nombre de archivo..." :show-tipo-documento="true"
            :tipos-documento="['Factura', 'Orden de Compra', 'Contrato', 'Reglamento', 'Plano', 'Foto', 'Otro']"
            :show-nivel-vinculacion="true" @filter="handleFilter" />

        <!-- Tabla -->
        <div class="card">
            <div class="card-body">
                <div v-if="documentosStore.loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>

                <div v-else-if="documentosStore.error" class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error al cargar documentos: {{ documentosStore.error }}
                </div>

                <div v-else-if="documentosFiltrados.length === 0" class="text-center py-5 text-muted">
                    <i class="fas fa-inbox fa-3x mb-3"></i>
                    <p class="mb-0">No hay documentos para mostrar</p>
                </div>

                <div v-else class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th style="cursor: pointer" @click="sort('tipo_documento')">
                                    Tipo <i :class="getSortIcon('tipo_documento')"></i>
                                </th>
                                <th style="cursor: pointer" @click="sort('nombre_archivo')">
                                    Archivo <i :class="getSortIcon('nombre_archivo')"></i>
                                </th>
                                <th>Vinculación</th>
                                <th>Descripción</th>
                                <th style="cursor: pointer" @click="sort('created_at')">
                                    Fecha <i :class="getSortIcon('created_at')"></i>
                                </th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="doc in documentosOrdenados" :key="doc.id">
                                <td>
                                    <span class="badge bg-primary">{{ doc.tipo_documento }}</span>
                                </td>
                                <td>
                                    <i class="fas fa-file me-2 text-muted"></i>
                                    <a :href="doc.url_drive" target="_blank" class="text-decoration-none">
                                        {{ doc.nombre_archivo }}
                                        <i class="fas fa-external-link-alt ms-1 small"></i>
                                    </a>
                                </td>
                                <td>
                                    <div class="vinculacion-info">
                                        <small class="d-block" v-if="doc.centro">
                                            <i class="fas fa-building text-muted me-1"></i>
                                            {{ doc.centro.nombre }}
                                        </small>
                                        <small class="d-block" v-if="doc.feria">
                                            <i class="fas fa-calendar-alt text-muted me-1"></i>
                                            {{ doc.feria.nombre }}
                                        </small>
                                        <small class="d-block" v-if="doc.participacion">
                                            <i class="fas fa-store text-muted me-1"></i>
                                            Puesto {{ doc.participacion.numero_puesto }} -
                                            {{ doc.participacion.emprendimiento?.nombre_emprendimiento }}
                                        </small>
                                        <small class="d-block" v-if="doc.factura">
                                            <i class="fas fa-file-invoice text-muted me-1"></i>
                                            {{ doc.factura.numero_factura }}
                                        </small>
                                        <small class="d-block" v-if="doc.orden_compra">
                                            <i class="fas fa-file-alt text-muted me-1"></i>
                                            {{ doc.orden_compra.numero_oc }}
                                        </small>
                                    </div>
                                </td>
                                <td>
                                    <span v-if="doc.descripcion" class="text-truncate"
                                        style="max-width: 250px; display: inline-block;">
                                        {{ doc.descripcion }}
                                    </span>
                                    <span v-else class="text-muted">-</span>
                                </td>
                                <td>{{ formatDate(doc.created_at) }}</td>
                                <td class="text-center">
                                    <div class="btn-group btn-group-sm">
                                        <a :href="doc.url_drive" target="_blank" class="btn btn-outline-info"
                                            title="Abrir en Drive">
                                            <i class="fab fa-google-drive"></i>
                                        </a>
                                        <button class="btn btn-outline-primary" @click="openEditModal(doc)"
                                            title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-outline-danger" @click="confirmarEliminar(doc)"
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
                            <i class="fas fa-folder me-2"></i>
                            {{ editingDoc ? 'Editar' : 'Nuevo' }} Documento Drive
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="submitForm">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Tipo de Documento *</label>
                                    <select class="form-select" v-model="formData.tipo_documento" required>
                                        <option value="">Seleccione...</option>
                                        <option value="Factura">Factura</option>
                                        <option value="Orden de Compra">Orden de Compra</option>
                                        <option value="Contrato">Contrato</option>
                                        <option value="Reglamento">Reglamento</option>
                                        <option value="Plano">Plano</option>
                                        <option value="Foto">Foto</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Nombre del Archivo *</label>
                                    <input type="text" class="form-control" v-model="formData.nombre_archivo"
                                        required />
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">ID de Archivo Drive *</label>
                                    <input type="text" class="form-control" v-model="formData.drive_file_id" required
                                        placeholder="ID del archivo en Google Drive" />
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">URL de Drive *</label>
                                    <input type="url" class="form-control" v-model="formData.url_drive" required
                                        placeholder="https://drive.google.com/..." />
                                </div>

                                <div class="col-12">
                                    <div class="alert alert-info">
                                        <i class="fas fa-info-circle me-2"></i>
                                        Debe vincular el documento a al menos una entidad
                                    </div>
                                </div>

                                <!-- Vinculaciones -->
                                <div class="col-md-6">
                                    <label class="form-label">Centro Comercial</label>
                                    <select class="form-select" v-model="formData.centro_id">
                                        <option value="">Sin vincular</option>
                                        <option v-for="centro in centrosStore.malls" :key="centro.id"
                                            :value="centro.id">
                                            {{ centro.nombre }}
                                        </option>
                                    </select>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Feria</label>
                                    <select class="form-select" v-model="formData.feria_id">
                                        <option value="">Sin vincular</option>
                                        <option v-for="feria in feriasStore.ferias" :key="feria.id" :value="feria.id">
                                            {{ feria.nombre }}
                                        </option>
                                    </select>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Factura</label>
                                    <select class="form-select" v-model="formData.factura_id">
                                        <option value="">Sin vincular</option>
                                        <option v-for="factura in facturasStore.facturas" :key="factura.id"
                                            :value="factura.id">
                                            {{ factura.numero_factura }}
                                        </option>
                                    </select>
                                </div>

                                <div class="col-md-6">
                                    <label class="form-label">Orden de Compra</label>
                                    <select class="form-select" v-model="formData.orden_compra_id">
                                        <option value="">Sin vincular</option>
                                        <option v-for="orden in ordenesStore.ordenes" :key="orden.id" :value="orden.id">
                                            {{ orden.numero_oc }}
                                        </option>
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
                        <button type="button" class="btn btn-primary" @click="submitForm"
                            :disabled="saving || !isFormValid">
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
import { useDocumentosStore } from '../stores/documentos'
import { useMallsStore } from '../stores/malls'
import { useFeriasStore } from '../stores/ferias'
import { useFacturasStore } from '../stores/facturas'
import { useOrdenesCompraStore } from '../stores/ordenesCompra'
import { useNotifications } from '../composables/useNotifications'
import { useTableSort } from '../composables/useTableSort'
import Breadcrumb from '../components/common/Breadcrumb.vue'
import FilterBar from '../components/common/FilterBar.vue'

const documentosStore = useDocumentosStore()
const centrosStore = useMallsStore()
const feriasStore = useFeriasStore()
const facturasStore = useFacturasStore()
const ordenesStore = useOrdenesCompraStore()
const { showSuccess, showError } = useNotifications()

const formModal = ref(null)
let modalInstance = null

const editingDoc = ref(null)
const saving = ref(false)

const formData = ref({
    tipo_documento: '',
    nombre_archivo: '',
    drive_file_id: '',
    url_drive: '',
    centro_id: '',
    feria_id: '',
    participacion_id: '',
    factura_id: '',
    orden_compra_id: '',
    descripcion: ''
})

const filters = ref({
    search: '',
    tipoDocumento: '',
    nivelVinculacion: ''
})

const breadcrumbItems = [
    { text: 'Documentos', icon: 'fas fa-folder' },
    { text: 'Archivos Drive', icon: 'fas fa-folder-open' }
]

// Validación
const isFormValid = computed(() => {
    return formData.value.centro_id ||
        formData.value.feria_id ||
        formData.value.participacion_id ||
        formData.value.factura_id ||
        formData.value.orden_compra_id
})

// Filtrado
const documentosFiltrados = computed(() => {
    let resultado = documentosStore.documentos

    if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase()
        resultado = resultado.filter(d =>
            d.nombre_archivo?.toLowerCase().includes(searchLower) ||
            d.tipo_documento?.toLowerCase().includes(searchLower)
        )
    }

    if (filters.value.tipoDocumento) {
        resultado = resultado.filter(d => d.tipo_documento === filters.value.tipoDocumento)
    }

    if (filters.value.nivelVinculacion) {
        const nivel = filters.value.nivelVinculacion
        resultado = resultado.filter(d => {
            if (nivel === 'centro') return d.centro_id
            if (nivel === 'feria') return d.feria_id
            if (nivel === 'participacion') return d.participacion_id
            if (nivel === 'factura') return d.factura_id
            if (nivel === 'orden') return d.orden_compra_id
            return true
        })
    }

    return resultado
})

// Ordenamiento
const { sortedData: documentosOrdenados, sort, getSortIcon } = useTableSort(documentosFiltrados, 'created_at', 'desc')

// Funciones
function handleFilter(newFilters) {
    filters.value = newFilters
}

function formatDate(date) {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-CL')
}

function openCreateModal() {
    editingDoc.value = null
    formData.value = {
        tipo_documento: '',
        nombre_archivo: '',
        drive_file_id: '',
        url_drive: '',
        centro_id: '',
        feria_id: '',
        participacion_id: '',
        factura_id: '',
        orden_compra_id: '',
        descripcion: ''
    }
    modalInstance.show()
}

function openEditModal(doc) {
    editingDoc.value = doc
    formData.value = {
        tipo_documento: doc.tipo_documento,
        nombre_archivo: doc.nombre_archivo,
        drive_file_id: doc.drive_file_id,
        url_drive: doc.url_drive,
        centro_id: doc.centro_id || '',
        feria_id: doc.feria_id || '',
        participacion_id: doc.participacion_id || '',
        factura_id: doc.factura_id || '',
        orden_compra_id: doc.orden_compra_id || '',
        descripcion: doc.descripcion || ''
    }
    modalInstance.show()
}

async function submitForm() {
    if (!isFormValid.value) {
        showError('Debe vincular el documento a al menos una entidad')
        return
    }

    saving.value = true
    try {
        const data = {
            ...formData.value,
            centro_id: formData.value.centro_id || null,
            feria_id: formData.value.feria_id || null,
            participacion_id: formData.value.participacion_id || null,
            factura_id: formData.value.factura_id || null,
            orden_compra_id: formData.value.orden_compra_id || null
        }

        if (editingDoc.value) {
            await documentosStore.updateDocumento(editingDoc.value.id, data)
            showSuccess('Documento actualizado exitosamente')
        } else {
            await documentosStore.createDocumento(data)
            showSuccess('Documento creado exitosamente')
        }

        modalInstance.hide()
    } catch (error) {
        showError('Error al guardar el documento')
    } finally {
        saving.value = false
    }
}

async function confirmarEliminar(doc) {
    if (confirm(`¿Está seguro de eliminar el documento "${doc.nombre_archivo}"?`)) {
        try {
            await documentosStore.deleteDocumento(doc.id)
            showSuccess('Documento eliminado exitosamente')
        } catch (error) {
            showError('Error al eliminar el documento')
        }
    }
}

onMounted(async () => {
    modalInstance = new Modal(formModal.value)
    await documentosStore.fetchDocumentos()
    await centrosStore.loadMalls()
    await feriasStore.cargarFerias()
    await facturasStore.fetchFacturas()
    await ordenesStore.fetchOrdenes()
})
</script>

<style scoped>
.stat-item {
    padding: 0.75rem;
    border-left: 3px solid #0d6efd;
    background: #f8f9fa;
    margin-bottom: 0.5rem;
}

.stat-tipo {
    font-weight: 500;
    color: #495057;
    font-size: 0.9rem;
}

.stat-cantidad {
    font-size: 1.5rem;
    font-weight: 600;
    color: #0d6efd;
}

.vinculacion-info small {
    line-height: 1.6;
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
