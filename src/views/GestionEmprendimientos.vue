<template>
    <div>
        <!-- Content Header -->
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0">Emprendimientos</h1>
                    </div>
                    <div class="col-sm-6">
                        <button @click="abrirModalNuevo" class="btn btn-primary float-right">
                            <i class="fas fa-plus mr-1"></i>
                            Nuevo Emprendimiento
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Búsqueda -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <input v-model="busqueda" type="text" class="form-control"
                            placeholder="Buscar por nombre de emprendimiento, emprendedor o RUT...">
                    </div>
                </div>
            </div>
        </div>

        <!-- Lista de Emprendimientos -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            Emprendimientos ({{ emprendimientosFiltrados.length }})
                            <span v-if="emprendimientosStore.loading"
                                class="spinner-border spinner-border-sm ml-2"></span>
                        </h3>
                    </div>
                    <div class="card-body p-0">
                        <div v-if="emprendimientosStore.error" class="alert alert-danger m-3">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            Error: {{ emprendimientosStore.error }}
                        </div>
                        <table v-else class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Emprendimiento</th>
                                    <th>Categoría</th>
                                    <th>Emprendedor</th>
                                    <th>RUT</th>
                                    <th>Contacto</th>
                                    <th>Redes</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="emp in emprendimientosFiltrados" :key="emp.id">
                                    <td @dblclick="editarCampo(emp.id, 'nombre_emprendimiento', emp.nombre_emprendimiento)">
                                        <span v-if="!editandoCelda(emp.id, 'nombre_emprendimiento')">
                                            <strong>{{ emp.nombre_emprendimiento }}</strong>
                                        </span>
                                        <input
                                            v-else
                                            v-model="valorEditando"
                                            @blur="guardarCampo(emp.id, 'nombre_emprendimiento')"
                                            @keyup.enter="guardarCampo(emp.id, 'nombre_emprendimiento')"
                                            @keyup.esc="cancelarEdicion"
                                            class="form-control form-control-sm"
                                            ref="inputEdicion"
                                        />
                                    </td>
                                    <td>
                                        <span class="badge badge-primary">{{ emp.categoria?.nombre || 'Sin categoría'
                                        }}</span>
                                    </td>
                                    <td @dblclick="editarCampo(emp.id, 'nombre_emprendedor', emp.nombre_emprendedor)">
                                        <span v-if="!editandoCelda(emp.id, 'nombre_emprendedor')">{{ emp.nombre_emprendedor }}</span>
                                        <input
                                            v-else
                                            v-model="valorEditando"
                                            @blur="guardarCampo(emp.id, 'nombre_emprendedor')"
                                            @keyup.enter="guardarCampo(emp.id, 'nombre_emprendedor')"
                                            @keyup.esc="cancelarEdicion"
                                            class="form-control form-control-sm"
                                        />
                                    </td>
                                    <td @dblclick="editarCampo(emp.id, 'rut', emp.rut)">
                                        <span v-if="!editandoCelda(emp.id, 'rut')"><code>{{ emp.rut }}</code></span>
                                        <input
                                            v-else
                                            v-model="valorEditando"
                                            @blur="guardarCampo(emp.id, 'rut')"
                                            @keyup.enter="guardarCampo(emp.id, 'rut')"
                                            @keyup.esc="cancelarEdicion"
                                            class="form-control form-control-sm"
                                        />
                                    </td>
                                    <td>
                                        <div v-if="emp.telefono"><i class="fas fa-phone mr-1"></i>{{ emp.telefono }}
                                        </div>
                                        <div v-if="emp.email" class="small text-muted">{{ emp.email }}</div>
                                    </td>
                                    <td @dblclick="editarCampo(emp.id, 'instagram', emp.instagram)">
                                        <a v-if="emp.instagram && !editandoCelda(emp.id, 'instagram')"
                                            :href="`https://instagram.com/${emp.instagram.replace('@', '')}`"
                                            target="_blank" class="text-pink">
                                            <i class="fab fa-instagram"></i> {{ emp.instagram }}
                                        </a>
                                        <input
                                            v-if="editandoCelda(emp.id, 'instagram')"
                                            v-model="valorEditando"
                                            @blur="guardarCampo(emp.id, 'instagram')"
                                            @keyup.enter="guardarCampo(emp.id, 'instagram')"
                                            @keyup.esc="cancelarEdicion"
                                            class="form-control form-control-sm"
                                            placeholder="@usuario"
                                        />
                                    </td>
                                    <td>
                                        <span :class="['badge', emp.activo ? 'badge-success' : 'badge-secondary']">
                                            {{ emp.activo ? 'Activo' : 'Inactivo' }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="btn-group">
                                            <button @click="verHistorial(emp)" class="btn btn-sm btn-info"
                                                title="Ver Historial">
                                                <i class="fas fa-history"></i>
                                            </button>
                                            <button @click="abrirModalEditar(emp)" class="btn btn-sm btn-primary"
                                                title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button @click="eliminarEmprendimiento(emp.id)"
                                                class="btn btn-sm btn-danger" title="Eliminar">
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
        </div>

        <!-- Modal Historial de Participaciones -->
        <div v-if="modalHistorial && emprendimientoSeleccionado" class="modal fade show" style="display: block;">
            <div class="modal-dialog modal-xl modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header border-bottom-0">
                        <h5 class="modal-title">
                            Historial de {{ emprendimientoSeleccionado.nombre_emprendimiento }}
                        </h5>
                        <button type="button" class="close" @click="cerrarModalHistorial">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <!-- Estado de Cuenta Detallado -->
                        <div class="alert alert-info mb-4">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <h5 class="mb-2">
                                        <i class="fas fa-file-invoice-dollar mr-2"></i>
                                        Estado de Cuenta
                                    </h5>
                                    <div class="row">
                                        <div class="col-6 col-md-3">
                                            <small class="text-muted">Deuda Total:</small><br>
                                            <strong class="text-danger">${{ formatNumber(calcularDeudaTotal()) }}</strong>
                                        </div>
                                        <div class="col-6 col-md-3">
                                            <small class="text-muted">Tasa de Pago:</small><br>
                                            <strong>{{ calcularTasaPago() }}%</strong>
                                        </div>
                                        <div class="col-6 col-md-3 mt-2 mt-md-0">
                                            <small class="text-muted">Promedio por Feria:</small><br>
                                            <strong>${{ formatNumber(calcularPromedioFeria()) }}</strong>
                                        </div>
                                        <div class="col-6 col-md-3 mt-2 mt-md-0">
                                            <small class="text-muted">Último Pago:</small><br>
                                            <strong>{{ obtenerFechaUltimoPago() }}</strong>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mt-3 mt-md-0">
                                    <div class="progress" style="height: 30px;">
                                        <div 
                                            class="progress-bar" 
                                            :class="calcularTasaPago() >= 80 ? 'bg-success' : calcularTasaPago() >= 50 ? 'bg-warning' : 'bg-danger'"
                                            :style="{ width: calcularTasaPago() + '%' }">
                                            {{ calcularTasaPago() }}% Pagado
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Resumen -->
                        <div class="row mb-4 border-bottom pb-3">
                            <div class="col-md-3">
                                <div class="text-muted small mb-1">Total Ferias</div>
                                <div class="h4 mb-0">{{ participacionesDelEmprendimiento.length }}</div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-muted small mb-1">Total Pagado</div>
                                <div class="h4 mb-0 text-success">${{ formatNumber(calcularTotalPagado()) }}</div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-muted small mb-1">Total Pendiente</div>
                                <div class="h4 mb-0 text-danger">${{ formatNumber(calcularTotalPendiente()) }}</div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-muted small mb-1">Total Abonos</div>
                                <div class="h4 mb-0">{{ calcularTotalAbonos() }}</div>
                            </div>
                        </div>

                        <!-- Lista de Participaciones -->
                        <div class="border rounded p-3 mb-3" v-for="part in participacionesDelEmprendimiento"
                            :key="part.id">
                            <div class="d-flex justify-content-between align-items-start mb-3 pb-2 border-bottom">
                                <div>
                                    <h6 class="mb-1">{{ part.feria?.nombre || 'Feria sin nombre' }}</h6>
                                    <div class="text-muted small">
                                        {{ formatDate(part.feria?.fecha_inicio) }} - {{
                                        formatDate(part.feria?.fecha_fin) }}
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="badge badge-secondary">{{ part.numero_puesto }}</span>
                                    <span :class="['badge ml-1', getBadgeEstadoPago(part.estado_pago)]">
                                        {{ part.estado_pago }}
                                    </span>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-3">
                                    <div class="text-muted small">Total</div>
                                    <div class="h5 mb-0">${{ formatNumber(part.monto_final) }}</div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-muted small">Pagado</div>
                                    <div class="h5 mb-0 text-success">${{ formatNumber(part.monto_pagado) }}</div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-muted small">Pendiente</div>
                                    <div class="h5 mb-0 text-danger">${{ formatNumber(part.monto_final -
                                        part.monto_pagado) }}</div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-muted small">Descuento</div>
                                    <div class="h5 mb-0">
                                        <span v-if="part.descuento_porcentaje > 0" class="text-info">
                                            {{ part.descuento_porcentaje }}%
                                        </span>
                                        <span v-else class="text-muted">-</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Abonos -->
                            <div v-if="obtenerAbonosPorParticipacion(part.id).length > 0" class="border-top pt-3">
                                <div class="text-muted small mb-2 font-weight-bold">Abonos realizados ({{
                                    obtenerAbonosPorParticipacion(part.id).length }})</div>
                                <table class="table table-sm table-hover mb-0">
                                    <thead class="thead-light">
                                        <tr class="small">
                                            <th width="60">#</th>
                                            <th>Fecha</th>
                                            <th>Monto</th>
                                            <th>Banco</th>
                                            <th>N° Operación</th>
                                            <th width="60">Comprobante</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="abono in obtenerAbonosPorParticipacion(part.id)" :key="abono.id"
                                            class="small">
                                            <td class="text-muted">#{{ abono.numero_abono }}</td>
                                            <td>{{ formatDate(abono.fecha) }}</td>
                                            <td class="text-success font-weight-bold">${{ formatNumber(abono.monto) }}
                                            </td>
                                            <td class="text-muted">{{ abono.banco || '-' }}</td>
                                            <td class="text-muted">{{ abono.numero_operacion || '-' }}</td>
                                            <td class="text-center">
                                                <a v-if="abono.comprobante_url" :href="abono.comprobante_url"
                                                    target="_blank" class="text-primary">
                                                    <i class="fas fa-download"></i>
                                                </a>
                                                <span v-else class="text-muted">-</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div v-else class="border-top pt-3">
                                <div class="text-muted small text-center py-2">No hay abonos registrados</div>
                            </div>
                        </div>

                        <div v-if="participacionesDelEmprendimiento.length === 0" class="text-center text-muted py-5">
                            Este emprendimiento no ha participado en ninguna feria aún.
                        </div>
                    </div>
                    <div class="modal-footer border-top-0">
                        <button type="button" class="btn btn-secondary" @click="cerrarModalHistorial">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="modalHistorial" class="modal-backdrop fade show"></div>

        <!-- Modal Formulario Emprendimiento -->
        <div v-if="mostrarModal" class="modal fade show" style="display: block;" @click.self="cerrarModal">
            <div class="modal-dialog modal-xl modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i :class="editando ? 'fas fa-edit' : 'fas fa-plus'" class="mr-2"></i>
                            {{ editando ? 'Editar' : 'Nuevo' }} Emprendimiento
                        </h5>
                        <button type="button" class="close" @click="cerrarModal">
                            <span>&times;</span>
                        </button>
                    </div>
                    <form @submit.prevent="guardarEmprendimiento">
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label required">Nombre del Emprendimiento</label>
                                        <input v-model="formulario.nombreEmprendimiento" type="text"
                                            class="form-control" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label required">Categoría</label>
                                        <select v-model="formulario.categoriaId" class="form-control" required>
                                            <option value="">Seleccionar...</option>
                                            <option v-for="cat in emprendimientosStore.categorias" :key="cat.id"
                                                :value="cat.id">
                                                {{ cat.nombre }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label required">Nombre del Emprendedor</label>
                                        <input v-model="formulario.nombreEmprendedor" type="text" class="form-control"
                                            required>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label required">RUT</label>
                                        <input v-model="formulario.rut" type="text" class="form-control" required>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label">Instagram</label>
                                        <input v-model="formulario.instagram" type="text" class="form-control"
                                            placeholder="@usuario">
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label">Correo</label>
                                        <input v-model="formulario.correo" type="email" class="form-control">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label">Teléfono</label>
                                        <input v-model="formulario.telefono" type="tel" class="form-control">
                                    </div>
                                </div>
                            </div>

                            <h5 class="mb-3 mt-3">
                                <i class="fas fa-user-tie mr-2"></i>
                                Contacto de Pagos
                            </h5>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label">Nombre</label>
                                        <input v-model="formulario.contactoPagos.nombre" type="text"
                                            class="form-control">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label">Correo</label>
                                        <input v-model="formulario.contactoPagos.correo" type="email"
                                            class="form-control">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label">Teléfono</label>
                                        <input v-model="formulario.contactoPagos.telefono" type="tel"
                                            class="form-control">
                                    </div>
                                </div>
                            </div>

                            <h5 class="mb-3 mt-4">
                                <i class="fas fa-file-invoice mr-2"></i>
                                Datos de Facturación
                            </h5>
                            <div class="row mb-3">
                                <div class="col-12">
                                    <div class="custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            class="custom-control-input"
                                            id="usarDatosDuenoModal"
                                            v-model="formulario.usarDatosDueno"
                                            @change="aplicarDatosDueno"
                                        />
                                        <label class="custom-control-label" for="usarDatosDuenoModal">
                                            <strong>Usar los mismos datos del dueño del emprendimiento</strong>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label">RUT</label>
                                        <input
                                            v-model="formulario.facturacion.rut"
                                            type="text"
                                            class="form-control"
                                            :disabled="formulario.usarDatosDueno"
                                            placeholder="12.345.678-9"
                                        >
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label">Razón Social</label>
                                        <input
                                            v-model="formulario.facturacion.razonSocial"
                                            type="text"
                                            class="form-control"
                                            :disabled="formulario.usarDatosDueno"
                                            placeholder="Nombre o razón social"
                                        >
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label">Giro Comercial</label>
                                        <input
                                            v-model="formulario.facturacion.giro"
                                            type="text"
                                            class="form-control"
                                            :disabled="formulario.usarDatosDueno"
                                            placeholder="Ej: Venta de accesorios"
                                        >
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label">Dirección</label>
                                        <input
                                            v-model="formulario.facturacion.direccion"
                                            type="text"
                                            class="form-control"
                                            :disabled="formulario.usarDatosDueno"
                                            placeholder="Calle y número"
                                        >
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label">Comuna</label>
                                        <input
                                            v-model="formulario.facturacion.comuna"
                                            type="text"
                                            class="form-control"
                                            :disabled="formulario.usarDatosDueno"
                                            placeholder="Ej: Santiago"
                                        >
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label">Teléfono</label>
                                        <input
                                            v-model="formulario.facturacion.telefono"
                                            type="tel"
                                            class="form-control"
                                            :disabled="formulario.usarDatosDueno"
                                            placeholder="+56 9 1234 5678"
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="cerrarModal">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save mr-1"></i>
                                {{ editando ? 'Actualizar' : 'Crear' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div v-if="mostrarModal" class="modal-backdrop fade show"></div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { useEmprendimientosStore } from '../stores/emprendimientos'
import { useParticipacionesStore } from '../stores/participaciones'
import { useAbonosStore } from '../stores/abonos'

const emprendimientosStore = useEmprendimientosStore()
const participacionesStore = useParticipacionesStore()
const abonosStore = useAbonosStore()

const mostrarFormulario = ref(false)
const mostrarModal = ref(false)
const editando = ref(false)
const busqueda = ref('')
const modalHistorial = ref(false)
const emprendimientoSeleccionado = ref(null)
const participacionesDelEmprendimiento = ref([])
const abonosDelEmprendimiento = ref([])

// Edición inline
const celdaEditando = ref({ id: null, campo: null })
const valorEditando = ref('')

const formulario = reactive({
    nombreEmprendimiento: '',
    categoriaId: '',
    nombreEmprendedor: '',
    rut: '',
    correo: '',
    telefono: '',
    contactoPagos: {
        nombre: '',
        correo: '',
        telefono: ''
    },
    instagram: '',
    activo: true,
    usarDatosDueno: true,
    facturacion: {
        rut: '',
        razonSocial: '',
        giro: '',
        direccion: '',
        comuna: '',
        telefono: ''
    }
})

const emprendimientosFiltrados = computed(() => {
    if (!busqueda.value) return emprendimientosStore.emprendimientos
    return emprendimientosStore.buscarPorNombre(busqueda.value)
})

function aplicarDatosDueno() {
    if (formulario.usarDatosDueno) {
        formulario.facturacion.rut = formulario.rut
        formulario.facturacion.razonSocial = formulario.nombreEmprendedor
        formulario.facturacion.telefono = formulario.telefono
    }
}

// Funciones de edición inline
function editandoCelda(id, campo) {
    return celdaEditando.value.id === id && celdaEditando.value.campo === campo
}

function editarCampo(id, campo, valorActual) {
    celdaEditando.value = { id, campo }
    valorEditando.value = valorActual || ''
    // Enfocar el input en el siguiente tick
    setTimeout(() => {
        const inputs = document.querySelectorAll('input.form-control-sm')
        if (inputs.length > 0) {
            inputs[inputs.length - 1].focus()
            inputs[inputs.length - 1].select()
        }
    }, 50)
}

async function guardarCampo(id, campo) {
    if (!valorEditando.value || valorEditando.value === '') {
        cancelarEdicion()
        return
    }

    try {
        const emp = emprendimientosStore.obtenerPorId(id)
        if (!emp) return

        // Crear objeto con todos los datos actuales
        const datosActualizados = {
            nombreEmprendimiento: emp.nombre_emprendimiento,
            categoriaId: emp.categoria_id,
            nombreEmprendedor: emp.nombre_emprendedor,
            rut: emp.rut,
            correo: emp.email,
            telefono: emp.telefono,
            instagram: emp.instagram || '',
            activo: emp.activo,
            usarDatosDueno: emp.usar_datos_dueno !== false,
            facturacion: {
                rut: emp.facturacion_rut || '',
                razonSocial: emp.facturacion_razon_social || '',
                giro: emp.facturacion_giro || '',
                direccion: emp.facturacion_direccion || '',
                comuna: emp.facturacion_comuna || '',
                telefono: emp.facturacion_telefono || ''
            }
        }

        // Actualizar el campo específico
        switch(campo) {
            case 'nombre_emprendimiento':
                datosActualizados.nombreEmprendimiento = valorEditando.value
                break
            case 'nombre_emprendedor':
                datosActualizados.nombreEmprendedor = valorEditando.value
                break
            case 'rut':
                datosActualizados.rut = valorEditando.value
                break
            case 'instagram':
                datosActualizados.instagram = valorEditando.value
                break
        }

        await emprendimientosStore.actualizarEmprendimiento(id, datosActualizados)
        cancelarEdicion()
    } catch (error) {
        console.error('Error actualizando campo:', error)
        alert('Error al actualizar: ' + error.message)
        cancelarEdicion()
    }
}

function cancelarEdicion() {
    celdaEditando.value = { id: null, campo: null }
    valorEditando.value = ''
}

// Funciones para modal
function abrirModalNuevo() {
    cancelarFormulario()
    mostrarModal.value = true
    editando.value = false
}

function abrirModalEditar(emp) {
    editarEmprendimiento(emp)
    mostrarModal.value = true
}

function cerrarModal() {
    mostrarModal.value = false
    cancelarFormulario()
}

async function guardarEmprendimiento() {
    try {
        if (editando.value) {
            await emprendimientosStore.actualizarEmprendimiento(formulario.id, formulario)
        } else {
            await emprendimientosStore.agregarEmprendimiento(formulario)
        }
        cerrarModal()
    } catch (error) {
        alert('Error al guardar: ' + error.message)
    }
}

function cancelarFormulario() {
    Object.assign(formulario, {
        nombreEmprendimiento: '',
        categoriaId: '',
        nombreEmprendedor: '',
        rut: '',
        correo: '',
        telefono: '',
        contactoPagos: {
            nombre: '',
            correo: '',
            telefono: ''
        },
        instagram: '',
        activo: true,
        usarDatosDueno: true,
        facturacion: {
            rut: '',
            razonSocial: '',
            giro: '',
            direccion: '',
            comuna: '',
            telefono: ''
        }
    })
    mostrarFormulario.value = false
    editando.value = false
}

function editarEmprendimiento(emp) {
    // Obtener contacto de pagos
    const contactoPagos = emp.contactos?.find(c => c.tipo === 'pagos') || { nombre: '', correo: '', telefono: '' }

    Object.assign(formulario, {
        id: emp.id,
        nombreEmprendimiento: emp.nombre_emprendimiento,
        categoriaId: emp.categoria_id,
        nombreEmprendedor: emp.nombre_emprendedor,
        rut: emp.rut,
        correo: emp.email,
        telefono: emp.telefono,
        contactoPagos: {
            nombre: contactoPagos.nombre || '',
            correo: contactoPagos.email || '',
            telefono: contactoPagos.telefono || ''
        },
        instagram: emp.instagram || '',
        activo: emp.activo,
        usarDatosDueno: emp.usar_datos_dueno !== false, // Default true si no existe
        facturacion: {
            rut: emp.facturacion_rut || '',
            razonSocial: emp.facturacion_razon_social || '',
            giro: emp.facturacion_giro || '',
            direccion: emp.facturacion_direccion || '',
            comuna: emp.facturacion_comuna || '',
            telefono: emp.facturacion_telefono || ''
        }
    })
    editando.value = true
    mostrarFormulario.value = true
}

async function eliminarEmprendimiento(id) {
    if (confirm('¿Estás seguro de eliminar este emprendimiento?')) {
        try {
            await emprendimientosStore.eliminarEmprendimiento(id)
        } catch (error) {
            alert('Error al eliminar: ' + error.message)
        }
    }
}

// Funciones para el historial
async function verHistorial(emp) {
    emprendimientoSeleccionado.value = emp
    modalHistorial.value = true

    try {
        // Cargar solo las participaciones de este emprendimiento
        const { data: participaciones, error: errPart } = await supabase
            .from('participaciones')
            .select(`
                *,
                feria:ferias(id, nombre, fecha_inicio, fecha_fin)
            `)
            .eq('emprendimiento_id', emp.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })

        if (errPart) throw errPart
        participacionesDelEmprendimiento.value = participaciones || []

        // Obtener IDs de participaciones
        const participacionIds = participaciones?.map(p => p.id) || []

        if (participacionIds.length > 0) {
            // Cargar solo los abonos de estas participaciones
            const { data: abonos, error: errAbon } = await supabase
                .from('abonos')
                .select('*')
                .in('participacion_id', participacionIds)
                .order('fecha', { ascending: true })

            if (errAbon) throw errAbon
            abonosDelEmprendimiento.value = abonos || []
        } else {
            abonosDelEmprendimiento.value = []
        }
    } catch (error) {
        console.error('Error cargando historial:', error)
        alert('Error al cargar el historial: ' + error.message)
    }
}

function cerrarModalHistorial() {
    modalHistorial.value = false
    emprendimientoSeleccionado.value = null
    participacionesDelEmprendimiento.value = []
    abonosDelEmprendimiento.value = []
}

function obtenerAbonosPorParticipacion(participacionId) {
    return abonosStore.obtenerPorParticipacion(participacionId)
}

function calcularTotalPagado() {
    return participacionesDelEmprendimiento.value.reduce((sum, part) =>
        sum + (part.monto_pagado || 0), 0
    )
}

function calcularTotalPendiente() {
    return participacionesDelEmprendimiento.value.reduce((sum, part) =>
        sum + ((part.monto_final || 0) - (part.monto_pagado || 0)), 0
    )
}

function calcularTotalAbonos() {
    return abonosDelEmprendimiento.value.length
}

function calcularDeudaTotal() {
    const total = participacionesDelEmprendimiento.value.reduce((sum, part) =>
        sum + (part.monto_final || 0), 0
    )
    return total
}

function calcularTasaPago() {
    const total = calcularDeudaTotal()
    const pagado = calcularTotalPagado()
    if (total === 0) return 0
    return Math.round((pagado / total) * 100)
}

function calcularPromedioFeria() {
    if (participacionesDelEmprendimiento.value.length === 0) return 0
    return calcularDeudaTotal() / participacionesDelEmprendimiento.value.length
}

function obtenerFechaUltimoPago() {
    if (abonosDelEmprendimiento.value.length === 0) return 'Sin pagos'
    const ordenados = [...abonosDelEmprendimiento.value].sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
    )
    return formatDate(ordenados[0].fecha)
}

function formatNumber(num) {
    return new Intl.NumberFormat('es-CL').format(num || 0)
}

function formatDate(date) {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-CL')
}

function getBadgeEstadoPago(estado) {
    const badges = {
        'Pendiente': 'badge-warning',
        'Parcial': 'badge-info',
        'Pagado': 'badge-success',
        'Vencido': 'badge-danger'
    }
    return badges[estado] || 'badge-secondary'
}

// Watcher para sincronizar datos de facturación con datos del dueño
watch(
    () => [formulario.rut, formulario.nombreEmprendedor, formulario.telefono],
    ([newRut, newNombre, newTelefono]) => {
        if (formulario.usarDatosDueno) {
            formulario.facturacion.rut = newRut
            formulario.facturacion.razonSocial = newNombre
            formulario.facturacion.telefono = newTelefono
        }
    }
)

</script>
