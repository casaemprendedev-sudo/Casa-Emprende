<template>
    <div>
        <!-- Content Header -->
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0">Centros Comerciales</h1>
                    </div>
                    <div class="col-sm-6">
                        <button @click="mostrarFormulario = true" class="btn btn-primary float-right">
                            <i class="fas fa-plus mr-1"></i>
                            Nuevo Centro Comercial
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Formulario Nuevo Centro -->
        <div class="row" v-if="mostrarFormulario">
            <div class="col-12">
                <div class="card card-primary">
                    <div class="card-header">
                        <h3 class="card-title">{{ editando ? 'Editar' : 'Nuevo' }} Centro Comercial</h3>
                    </div>
                    <form @submit.prevent="guardarCentro">
                        <div class="card-body">
                            <div class="form-group">
                                <label>Nombre del Centro Comercial <span class="text-danger">*</span></label>
                                <input v-model="formulario.nombre" type="text" class="form-control" required
                                    placeholder="Ej: Mall Arauco Maipú">
                            </div>

                            <h5 class="mt-3">Información de Contacto</h5>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label>Dirección</label>
                                        <input v-model="formulario.direccion" type="text" class="form-control"
                                            placeholder="Dirección del centro">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label>Teléfono</label>
                                        <input v-model="formulario.telefono" type="tel" class="form-control"
                                            placeholder="Teléfono de contacto">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label>Correo Electrónico</label>
                                        <input v-model="formulario.email" type="email" class="form-control"
                                            placeholder="Email de contacto">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-save mr-1"></i>
                                {{ editando ? 'Actualizar' : 'Crear' }} Centro
                            </button>
                            <button type="button" @click="cancelarFormulario" class="btn btn-secondary ml-2">
                                <i class="fas fa-times mr-1"></i>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Lista de Centros -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Centros Comerciales ({{ centrosStore.totalCentros }})</h3>
                    </div>
                    <div class="card-body p-0">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Centro Comercial</th>
                                    <th>Email</th>
                                    <th>Contacto</th>
                                    <th>Zonas</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="centro in centrosStore.centros" :key="centro.id">
                                    <td>
                                        <strong>{{ centro.nombre }}</strong>
                                        <div v-if="centro.direccion" class="text-muted small">
                                            <i class="fas fa-map-marker-alt mr-1"></i>{{ centro.direccion }}
                                        </div>
                                    </td>
                                    <td>
                                        {{ centro.email || '-' }}
                                    </td>
                                    <td>
                                        <div v-if="centro.telefono">
                                            <i class="fas fa-phone mr-1"></i>{{ centro.telefono }}
                                        </div>
                                        <div v-else class="text-muted">-</div>
                                    </td>
                                    <td>
                                        <span class="badge badge-info">{{ obtenerCantidadZonas(centro.id) }}
                                            zona(s)</span>
                                    </td>
                                    <td>
                                        <div class="btn-group">
                                            <button @click="gestionarZonas(centro)" class="btn btn-sm btn-success"
                                                title="Gestionar Zonas">
                                                <i class="fas fa-th"></i>
                                            </button>
                                            <button @click="editarCentro(centro)" class="btn btn-sm btn-primary"
                                                title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button @click="eliminarCentro(centro.id)" class="btn btn-sm btn-danger"
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
        </div>
    </div>

    <!-- Modal Gestión de Zonas -->
    <div v-if="modalZonas" class="modal fade show" style="display: block;" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header border-bottom-0">
                    <h5 class="modal-title">Zonas de {{ centroSeleccionado?.nombre }}</h5>
                    <button type="button" class="close" @click="cerrarModalZonas">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <!-- Formulario Nueva Zona -->
                    <form @submit.prevent="agregarZona" class="mb-3">
                        <div class="row">
                            <div class="col">
                                <input v-model="formularioZona.nombre" type="text" class="form-control"
                                    placeholder="Nombre de la zona" required>
                            </div>
                            <div class="col-auto">
                                <input v-model.number="formularioZona.capacidadMaxima" type="number"
                                    class="form-control" placeholder="Capacidad (opcional)" min="1">
                            </div>
                            <div class="col-auto">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-plus"></i>
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </form>

                    <!-- Lista de Zonas -->
                    <div class="list-group">
                        <div v-for="zona in zonasDelCentro" :key="zona.id"
                            class="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{{ zona.nombre }}</strong>
                                <span v-if="zona.capacidad_maxima" class="text-muted ml-2">
                                    (Capacidad: {{ zona.capacidad_maxima }})
                                </span>
                                <div v-if="zona.descripcion" class="text-muted small">
                                    {{ zona.descripcion }}
                                </div>
                            </div>
                            <button @click="eliminarZona(zona.id)" class="btn btn-sm btn-danger">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <div v-if="!zonasDelCentro.length" class="text-muted text-center py-3">
                            No hay zonas registradas
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-top-0">
                    <button type="button" class="btn btn-secondary" @click="cerrarModalZonas">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
    <div v-if="modalZonas" class="modal-backdrop fade show" @click="cerrarModalZonas"></div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useCentrosStore } from '../stores/centros'

const centrosStore = useCentrosStore()

const mostrarFormulario = ref(false)
const editando = ref(false)
const modalZonas = ref(false)
const centroSeleccionado = ref(null)

const formulario = reactive({
    nombre: '',
    direccion: '',
    telefono: '',
    email: ''
})

const formularioZona = reactive({
    nombre: '',
    capacidadMaxima: null
})

const zonasDelCentro = computed(() => {
    if (!centroSeleccionado.value) return []
    return centrosStore.obtenerZonasPorCentro(centroSeleccionado.value.id)
})

function obtenerCantidadZonas(centroId) {
    return centrosStore.obtenerZonasPorCentro(centroId).length
}

function guardarCentro() {
    if (editando.value) {
        centrosStore.actualizarCentro(formulario.id, formulario)
    } else {
        centrosStore.agregarCentro(formulario)
    }
    cancelarFormulario()
}

function cancelarFormulario() {
    Object.assign(formulario, {
        nombre: '',
        direccion: '',
        telefono: '',
        email: ''
    })
    mostrarFormulario.value = false
    editando.value = false
}

function editarCentro(centro) {
    Object.assign(formulario, {
        id: centro.id,
        nombre: centro.nombre,
        direccion: centro.direccion || '',
        telefono: centro.telefono || '',
        email: centro.email || ''
    })
    editando.value = true
    mostrarFormulario.value = true
}

function eliminarCentro(id) {
    if (confirm('¿Estás seguro de eliminar este centro comercial?')) {
        centrosStore.eliminarCentro(id)
    }
}

async function gestionarZonas(centro) {
    centroSeleccionado.value = centro
    // Cargar zonas desde la BD
    await centrosStore.cargarZonas()
    modalZonas.value = true
}

function cerrarModalZonas() {
    modalZonas.value = false
    centroSeleccionado.value = null
    formularioZona.nombre = ''
    formularioZona.capacidadMaxima = null
}

function agregarZona() {
    if (centroSeleccionado.value) {
        centrosStore.agregarZona(centroSeleccionado.value.id, {
            nombre: formularioZona.nombre,
            capacidadMaxima: formularioZona.capacidadMaxima
        })
        formularioZona.nombre = ''
        formularioZona.capacidadMaxima = null
    }
}

function eliminarZona(zonaId) {
    if (confirm('¿Estás seguro de eliminar esta zona?')) {
        centrosStore.eliminarZona(centroSeleccionado.value.id, zonaId)
    }
}
</script>
