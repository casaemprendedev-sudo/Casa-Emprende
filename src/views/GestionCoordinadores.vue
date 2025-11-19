<template>
    <div>
        <!-- Content Header -->
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0">Coordinadores</h1>
                    </div>
                    <div class="col-sm-6">
                        <button @click="abrirFormularioNuevo" class="btn btn-primary float-right">
                            <i class="fas fa-plus mr-1"></i>
                            Nuevo Coordinador
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main content -->
        <section class="content">
            <div class="container-fluid">
                <!-- Búsqueda y Filtros -->
                <div class="card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <input v-model="busqueda" type="text" class="form-control"
                                    placeholder="Buscar por nombre o RUT...">
                            </div>
                            <div class="col-md-3">
                                <select v-model="filtroActivo" class="form-control">
                                    <option value="">Todos</option>
                                    <option value="true">Activos</option>
                                    <option value="false">Inactivos</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabla de Coordinadores -->
                <div class="card">
                    <div class="card-body">
                        <table class="table table-hover">
                            <thead class="thead-light">
                                <tr>
                                    <th>Nombre</th>
                                    <th>RUT</th>
                                    <th>Email</th>
                                    <th>Teléfono</th>
                                    <th>Estado</th>
                                    <th class="text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="coordinadoresFiltrados.length === 0">
                                    <td colspan="6" class="text-center text-muted">
                                        No hay coordinadores registrados
                                    </td>
                                </tr>
                                <tr v-for="coordinador in coordinadoresFiltrados" :key="coordinador.id">
                                    <td>{{ coordinador.nombre }}</td>
                                    <td>{{ coordinador.rut }}</td>
                                    <td>{{ coordinador.email || '-' }}</td>
                                    <td>{{ coordinador.telefono || '-' }}</td>
                                    <td>
                                        <span
                                            :class="coordinador.activo ? 'badge badge-success' : 'badge badge-secondary'">
                                            {{ coordinador.activo ? 'Activo' : 'Inactivo' }}
                                        </span>
                                    </td>
                                    <td class="text-right">
                                        <button @click="editarCoordinador(coordinador)"
                                            class="btn btn-sm btn-info mr-1">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button @click="confirmarEliminar(coordinador)" class="btn btn-sm btn-danger">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>

        <!-- Modal Formulario -->
        <div class="modal fade" :class="{ show: mostrarFormulario }"
            :style="{ display: mostrarFormulario ? 'block' : 'none' }" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ editando ? 'Editar Coordinador' : 'Nuevo Coordinador' }}</h5>
                        <button type="button" class="close" @click="cerrarFormulario">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="guardarCoordinador">
                            <div class="form-group">
                                <label>Nombre <span class="text-danger">*</span></label>
                                <input v-model="formulario.nombre" type="text" class="form-control" required
                                    placeholder="Nombre completo del coordinador">
                            </div>

                            <div class="form-group">
                                <label>RUT <span class="text-danger">*</span></label>
                                <input v-model="formulario.rut" type="text" class="form-control" required
                                    placeholder="12.345.678-9">
                            </div>

                            <div class="form-group">
                                <label>Email</label>
                                <input v-model="formulario.email" type="email" class="form-control"
                                    placeholder="coordinador@example.com">
                            </div>

                            <div class="form-group">
                                <label>Teléfono</label>
                                <input v-model="formulario.telefono" type="text" class="form-control"
                                    placeholder="+56 9 1234 5678">
                            </div>

                            <div class="form-group">
                                <div class="custom-control custom-checkbox">
                                    <input v-model="formulario.activo" type="checkbox" class="custom-control-input"
                                        id="checkActivo">
                                    <label class="custom-control-label" for="checkActivo">
                                        Activo (disponible para asignar)
                                    </label>
                                </div>
                            </div>

                            <div class="modal-footer px-0 pb-0">
                                <button type="button" class="btn btn-secondary" @click="cerrarFormulario">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save mr-1"></i>
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="mostrarFormulario" class="modal-backdrop fade show"></div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCoordinadoresStore } from '../stores/coordinadores'

const coordinadoresStore = useCoordinadoresStore()

const mostrarFormulario = ref(false)
const editando = ref(false)
const busqueda = ref('')
const filtroActivo = ref('')

const formulario = reactive({
    nombre: '',
    rut: '',
    email: '',
    telefono: '',
    activo: true
})

// Cargar coordinadores al montar
onMounted(async () => {
    try {
        await coordinadoresStore.cargarCoordinadores()
    } catch (error) {
        alert('Error al cargar coordinadores: ' + error.message)
    }
})

// Computed
const coordinadoresFiltrados = computed(() => {
    let resultado = coordinadoresStore.coordinadores

    // Filtrar por búsqueda
    if (busqueda.value) {
        const termino = busqueda.value.toLowerCase()
        resultado = resultado.filter(c =>
            c.nombre.toLowerCase().includes(termino) ||
            c.rut.toLowerCase().includes(termino)
        )
    }

    // Filtrar por estado activo
    if (filtroActivo.value !== '') {
        const activo = filtroActivo.value === 'true'
        resultado = resultado.filter(c => c.activo === activo)
    }

    return resultado
})

// Funciones
function abrirFormularioNuevo() {
    editando.value = false
    resetearFormulario()
    mostrarFormulario.value = true
}

function editarCoordinador(coordinador) {
    editando.value = true
    formulario.id = coordinador.id
    formulario.nombre = coordinador.nombre
    formulario.rut = coordinador.rut
    formulario.email = coordinador.email || ''
    formulario.telefono = coordinador.telefono || ''
    formulario.activo = coordinador.activo
    mostrarFormulario.value = true
}

async function guardarCoordinador() {
    try {
        // Validar RUT único
        const rutUnico = await coordinadoresStore.validarRutUnico(
            formulario.rut,
            editando.value ? formulario.id : null
        )

        if (!rutUnico) {
            alert('El RUT ya está registrado para otro coordinador')
            return
        }

        if (editando.value) {
            await coordinadoresStore.actualizarCoordinador(formulario.id, {
                nombre: formulario.nombre,
                rut: formulario.rut,
                email: formulario.email,
                telefono: formulario.telefono,
                activo: formulario.activo
            })
        } else {
            await coordinadoresStore.crearCoordinador({
                nombre: formulario.nombre,
                rut: formulario.rut,
                email: formulario.email,
                telefono: formulario.telefono,
                activo: formulario.activo
            })
        }

        cerrarFormulario()
        alert('Coordinador guardado correctamente')
    } catch (error) {
        alert('Error al guardar coordinador: ' + error.message)
    }
}

function confirmarEliminar(coordinador) {
    if (confirm(`¿Está seguro de eliminar al coordinador ${coordinador.nombre}?`)) {
        eliminarCoordinador(coordinador.id)
    }
}

async function eliminarCoordinador(id) {
    try {
        await coordinadoresStore.eliminarCoordinador(id)
        alert('Coordinador eliminado correctamente')
    } catch (error) {
        alert('Error al eliminar coordinador: ' + error.message)
    }
}

function cerrarFormulario() {
    mostrarFormulario.value = false
    resetearFormulario()
}

function resetearFormulario() {
    formulario.id = null
    formulario.nombre = ''
    formulario.rut = ''
    formulario.email = ''
    formulario.telefono = ''
    formulario.activo = true
}
</script>
