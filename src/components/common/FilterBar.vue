<template>
    <div class="filter-bar">
        <div class="row g-3 align-items-end">
            <!-- Búsqueda de texto -->
            <div v-if="showSearch" class="col-md-4">
                <label class="form-label">
                    <i class="fas fa-search me-1"></i>Buscar
                </label>
                <input type="text" class="form-control" :placeholder="searchPlaceholder" v-model="localFilters.search"
                    @input="emitFilters" />
            </div>

            <!-- Filtro de fecha inicio -->
            <div v-if="showDateRange" class="col-md-3">
                <label class="form-label">
                    <i class="fas fa-calendar me-1"></i>Desde
                </label>
                <input type="date" class="form-control" v-model="localFilters.fechaDesde" @change="emitFilters" />
            </div>

            <!-- Filtro de fecha fin -->
            <div v-if="showDateRange" class="col-md-3">
                <label class="form-label">
                    <i class="fas fa-calendar me-1"></i>Hasta
                </label>
                <input type="date" class="form-control" v-model="localFilters.fechaHasta" @change="emitFilters" />
            </div>

            <!-- Filtro de estado -->
            <div v-if="showEstado" class="col-md-2">
                <label class="form-label">
                    <i class="fas fa-filter me-1"></i>Estado
                </label>
                <select class="form-select" v-model="localFilters.estado" @change="emitFilters">
                    <option value="">Todos</option>
                    <option v-for="estado in estados" :key="estado" :value="estado">
                        {{ estado }}
                    </option>
                </select>
            </div>

            <!-- Filtro de centro comercial -->
            <div v-if="showCentro" class="col-md-3">
                <label class="form-label">
                    <i class="fas fa-building me-1"></i>Centro Comercial
                </label>
                <select class="form-select" v-model="localFilters.centroId" @change="emitFilters">
                    <option value="">Todos</option>
                    <option v-for="centro in centros" :key="centro.id" :value="centro.id">
                        {{ centro.nombre }}
                    </option>
                </select>
            </div>

            <!-- Filtro de feria -->
            <div v-if="showFeria" class="col-md-3">
                <label class="form-label">
                    <i class="fas fa-calendar-alt me-1"></i>Feria
                </label>
                <select class="form-select" v-model="localFilters.feriaId" @change="emitFilters">
                    <option value="">Todas</option>
                    <option v-for="feria in ferias" :key="feria.id" :value="feria.id">
                        {{ feria.nombre }}
                    </option>
                </select>
            </div>

            <!-- Filtro de tipo de documento -->
            <div v-if="showTipoDocumento" class="col-md-3">
                <label class="form-label">
                    <i class="fas fa-file me-1"></i>Tipo Documento
                </label>
                <select class="form-select" v-model="localFilters.tipoDocumento" @change="emitFilters">
                    <option value="">Todos</option>
                    <option v-for="tipo in tiposDocumento" :key="tipo" :value="tipo">
                        {{ tipo }}
                    </option>
                </select>
            </div>

            <!-- Filtro de nivel de vinculación -->
            <div v-if="showNivelVinculacion" class="col-md-3">
                <label class="form-label">
                    <i class="fas fa-link me-1"></i>Nivel
                </label>
                <select class="form-select" v-model="localFilters.nivelVinculacion" @change="emitFilters">
                    <option value="">Todos</option>
                    <option value="centro">Centro</option>
                    <option value="feria">Feria</option>
                    <option value="participacion">Participación</option>
                    <option value="factura">Factura</option>
                    <option value="orden">Orden de Compra</option>
                </select>
            </div>

            <!-- Filtro de año -->
            <div v-if="showAnio" class="col-md-2">
                <label class="form-label">
                    <i class="fas fa-calendar me-1"></i>Año
                </label>
                <select class="form-select" v-model="localFilters.anio" @change="emitFilters">
                    <option value="">Todos</option>
                    <option v-for="year in years" :key="year" :value="year">
                        {{ year }}
                    </option>
                </select>
            </div>

            <!-- Filtro de mes -->
            <div v-if="showMes" class="col-md-2">
                <label class="form-label">
                    <i class="fas fa-calendar me-1"></i>Mes
                </label>
                <select class="form-select" v-model="localFilters.mes" @change="emitFilters">
                    <option value="">Todos</option>
                    <option value="1">Enero</option>
                    <option value="2">Febrero</option>
                    <option value="3">Marzo</option>
                    <option value="4">Abril</option>
                    <option value="5">Mayo</option>
                    <option value="6">Junio</option>
                    <option value="7">Julio</option>
                    <option value="8">Agosto</option>
                    <option value="9">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                </select>
            </div>

            <!-- Botón limpiar filtros -->
            <div class="col-md-auto">
                <button class="btn btn-outline-secondary" @click="clearFilters">
                    <i class="fas fa-times me-1"></i>Limpiar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    showSearch: {
        type: Boolean,
        default: true
    },
    searchPlaceholder: {
        type: String,
        default: 'Buscar...'
    },
    showDateRange: {
        type: Boolean,
        default: false
    },
    showEstado: {
        type: Boolean,
        default: false
    },
    estados: {
        type: Array,
        default: () => []
    },
    showCentro: {
        type: Boolean,
        default: false
    },
    centros: {
        type: Array,
        default: () => []
    },
    showFeria: {
        type: Boolean,
        default: false
    },
    ferias: {
        type: Array,
        default: () => []
    },
    showTipoDocumento: {
        type: Boolean,
        default: false
    },
    tiposDocumento: {
        type: Array,
        default: () => []
    },
    showNivelVinculacion: {
        type: Boolean,
        default: false
    },
    showAnio: {
        type: Boolean,
        default: false
    },
    showMes: {
        type: Boolean,
        default: false
    },
    initialFilters: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['filter'])

const localFilters = ref({
    search: '',
    fechaDesde: '',
    fechaHasta: '',
    estado: '',
    centroId: '',
    feriaId: '',
    tipoDocumento: '',
    nivelVinculacion: '',
    anio: '',
    mes: '',
    ...props.initialFilters
})

// Generar años para el selector (últimos 5 años)
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

function emitFilters() {
    emit('filter', { ...localFilters.value })
}

function clearFilters() {
    localFilters.value = {
        search: '',
        fechaDesde: '',
        fechaHasta: '',
        estado: '',
        centroId: '',
        feriaId: '',
        tipoDocumento: '',
        nivelVinculacion: '',
        anio: '',
        mes: ''
    }
    emitFilters()
}

// Watch para cambios externos en filtros iniciales
watch(() => props.initialFilters, (newFilters) => {
    localFilters.value = { ...localFilters.value, ...newFilters }
}, { deep: true })
</script>

<style scoped>
.filter-bar {
    background: #f8f9fa;
    padding: 1.25rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid #dee2e6;
}

.form-label {
    font-weight: 500;
    font-size: 0.875rem;
    color: #495057;
    margin-bottom: 0.375rem;
}

.form-label i {
    color: #6c757d;
    font-size: 0.8rem;
}

.form-control,
.form-select {
    font-size: 0.9rem;
}

.btn-outline-secondary {
    margin-top: 1.9rem;
}
</style>
