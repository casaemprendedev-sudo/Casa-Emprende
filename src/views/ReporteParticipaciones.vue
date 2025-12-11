<template>
    <div class="content-wrapper">
        <!-- Breadcrumb -->
        <Breadcrumb :items="breadcrumbItems" />

        <!-- Content Header -->
        <section class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1><i class="fas fa-users mr-2"></i>Reporte de Participaciones</h1>
                    </div>
                    <div class="col-sm-6">
                        <button @click="exportarReporte" class="btn btn-success float-right">
                            <i class="fas fa-file-excel mr-1"></i> Exportar Excel
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Main content -->
        <section class="content">
            <div class="container-fluid">
                <!-- KPIs -->
                <div class="row mb-3">
                    <div class="col-lg-3 col-md-6">
                        <div class="small-box bg-primary">
                            <div class="inner">
                                <h3>{{ totalParticipaciones }}</h3>
                                <p>Total Participaciones</p>
                            </div>
                            <div class="icon">
                                <i class="fas fa-handshake"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="small-box bg-info">
                            <div class="inner">
                                <h3>{{ emprendedoresUnicos }}</h3>
                                <p>Emprendedores Únicos</p>
                            </div>
                            <div class="icon">
                                <i class="fas fa-user-tie"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="small-box bg-success">
                            <div class="inner">
                                <h3>{{ participacionesActivas }}</h3>
                                <p>Participaciones Activas</p>
                            </div>
                            <div class="icon">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="small-box bg-warning">
                            <div class="inner">
                                <h3>{{ promedioParticipacionesPorEmprendedor }}</h3>
                                <p>Promedio por Emprendedor</p>
                            </div>
                            <div class="icon">
                                <i class="fas fa-chart-bar"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filtros -->
                <FilterBar v-model:searchQuery="filtros.busqueda"
                    searchPlaceholder="Buscar emprendimiento, feria o centro...">
                    <template #additional-filters>
                        <div class="col-md-2">
                            <select v-model="filtros.centroId" class="form-control">
                                <option value="">Todos los centros</option>
                                <option v-for="centro in centrosStore.centros" :key="centro.id" :value="centro.id">
                                    {{ centro.nombre }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <select v-model="filtros.feriaId" class="form-control">
                                <option value="">Todas las ferias</option>
                                <option v-for="feria in feriasDisponibles" :key="feria.id" :value="feria.id">
                                    {{ feria.nombre }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <select v-model="filtros.estado" class="form-control">
                                <option value="">Todos los estados</option>
                                <option value="Confirmada">Confirmada</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Cancelada">Cancelada</option>
                                <option value="Completada">Completada</option>
                            </select>
                        </div>
                    </template>
                </FilterBar>

                <!-- Tabla Principal -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-list mr-2"></i>
                            Historial de Participaciones ({{ participacionesFiltradas.length }})
                        </h3>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <th class="sortable" @click="sort('emprendimiento.nombre_emprendimiento')">
                                            Emprendimiento
                                            <i :class="getSortIcon('emprendimiento.nombre_emprendimiento')"></i>
                                        </th>
                                        <th class="sortable" @click="sort('feria.nombre')">
                                            Feria
                                            <i :class="getSortIcon('feria.nombre')"></i>
                                        </th>
                                        <th class="sortable" @click="sort('feria.centro_comercial.nombre')">
                                            Centro
                                            <i :class="getSortIcon('feria.centro_comercial.nombre')"></i>
                                        </th>
                                        <th class="sortable" @click="sort('feria.fecha_inicio')">
                                            Fecha
                                            <i :class="getSortIcon('feria.fecha_inicio')"></i>
                                        </th>
                                        <th class="sortable" @click="sort('numero_stand')">
                                            Stand
                                            <i :class="getSortIcon('numero_stand')"></i>
                                        </th>
                                        <th class="sortable" @click="sort('total_pagar')">
                                            Total
                                            <i :class="getSortIcon('total_pagar')"></i>
                                        </th>
                                        <th class="sortable" @click="sort('pagado')">
                                            Pagado
                                            <i :class="getSortIcon('pagado')"></i>
                                        </th>
                                        <th class="sortable" @click="sort('saldo_pendiente')">
                                            Saldo
                                            <i :class="getSortIcon('saldo_pendiente')"></i>
                                        </th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="participacion in sortedData" :key="participacion.id">
                                        <td>
                                            <strong>{{ participacion.emprendimiento?.nombre_emprendimiento }}</strong>
                                            <br>
                                            <small class="text-muted">{{
                                                participacion.emprendimiento?.nombre_emprendedor }}</small>
                                        </td>
                                        <td>{{ participacion.feria?.nombre }}</td>
                                        <td>{{ participacion.feria?.centro_comercial?.nombre }}</td>
                                        <td>{{ formatDate(participacion.feria?.fecha_inicio) }}</td>
                                        <td>
                                            <span class="badge badge-info">{{ participacion.numero_stand }}</span>
                                        </td>
                                        <td>${{ formatNumber(participacion.total_pagar) }}</td>
                                        <td class="text-success">${{ formatNumber(participacion.pagado) }}</td>
                                        <td :class="participacion.saldo_pendiente > 0 ? 'text-danger' : 'text-success'">
                                            ${{ formatNumber(participacion.saldo_pendiente) }}
                                        </td>
                                        <td>
                                            <span :class="getBadgeEstado(participacion.estado_participacion)">
                                                {{ participacion.estado_participacion }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot v-if="participacionesFiltradas.length > 0">
                                    <tr class="font-weight-bold bg-light">
                                        <td colspan="5" class="text-right">TOTALES:</td>
                                        <td>${{ formatNumber(totales.totalPagar) }}</td>
                                        <td class="text-success">${{ formatNumber(totales.totalPagado) }}</td>
                                        <td :class="totales.totalSaldo > 0 ? 'text-danger' : 'text-success'">
                                            ${{ formatNumber(totales.totalSaldo) }}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Top Emprendedores -->
                <div class="row mt-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-primary">
                                <h3 class="card-title">
                                    <i class="fas fa-trophy mr-2"></i>
                                    Top Emprendedores por Participaciones
                                </h3>
                            </div>
                            <div class="card-body p-0">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Emprendimiento</th>
                                            <th>Participaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(emp, index) in topEmprendedoresPorParticipaciones" :key="emp.id">
                                            <td>
                                                <span class="badge" :class="getMedalClass(index)">{{ index + 1 }}</span>
                                            </td>
                                            <td>
                                                <strong>{{ emp.nombre }}</strong>
                                                <br>
                                                <small class="text-muted">{{ emp.emprendedor }}</small>
                                            </td>
                                            <td>
                                                <strong class="text-primary">{{ emp.participaciones }}</strong>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-success">
                                <h3 class="card-title">
                                    <i class="fas fa-dollar-sign mr-2"></i>
                                    Top Emprendedores por Ingresos
                                </h3>
                            </div>
                            <div class="card-body p-0">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Emprendimiento</th>
                                            <th>Total Generado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(emp, index) in topEmprendedoresPorIngresos" :key="emp.id">
                                            <td>
                                                <span class="badge" :class="getMedalClass(index)">{{ index + 1 }}</span>
                                            </td>
                                            <td>
                                                <strong>{{ emp.nombre }}</strong>
                                            </td>
                                            <td>
                                                <strong class="text-success">${{ formatNumber(emp.totalGenerado)
                                                    }}</strong>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCentrosStore } from '../stores/centros'
import { useFeriasStore } from '../stores/ferias'
import { useParticipacionesStore } from '../stores/participaciones'
import { useEmprendimientosStore } from '../stores/emprendimientos'
import Breadcrumb from '../components/common/Breadcrumb.vue'
import FilterBar from '../components/common/FilterBar.vue'
import { useTableSort } from '../composables/useTableSort'
import { exportToExcel } from '../services/exportService'

const centrosStore = useCentrosStore()
const feriasStore = useFeriasStore()
const participacionesStore = useParticipacionesStore()
const emprendimientosStore = useEmprendimientosStore()

const breadcrumbItems = [
    { label: 'Reportes', icon: 'fas fa-chart-bar' },
    { label: 'Participaciones', icon: 'fas fa-users' }
]

const filtros = ref({
    busqueda: '',
    centroId: '',
    feriaId: '',
    estado: ''
})

// Computed - Filtrados
const participacionesFiltradas = computed(() => {
    let participaciones = participacionesStore.participaciones

    // Búsqueda
    if (filtros.value.busqueda) {
        const query = filtros.value.busqueda.toLowerCase()
        participaciones = participaciones.filter(p =>
            p.emprendimiento?.nombre_emprendimiento?.toLowerCase().includes(query) ||
            p.emprendimiento?.nombre_emprendedor?.toLowerCase().includes(query) ||
            p.feria?.nombre?.toLowerCase().includes(query) ||
            p.feria?.centro_comercial?.nombre?.toLowerCase().includes(query)
        )
    }

    // Centro
    if (filtros.value.centroId) {
        participaciones = participaciones.filter(p =>
            p.feria?.centro_comercial_id === filtros.value.centroId
        )
    }

    // Feria
    if (filtros.value.feriaId) {
        participaciones = participaciones.filter(p => p.feria_id === filtros.value.feriaId)
    }

    // Estado
    if (filtros.value.estado) {
        participaciones = participaciones.filter(p => p.estado_participacion === filtros.value.estado)
    }

    return participaciones
})

const feriasDisponibles = computed(() => {
    if (!filtros.value.centroId) return feriasStore.ferias
    return feriasStore.ferias.filter(f => f.centro_comercial_id === filtros.value.centroId)
})

// Sorting
const { sortedData, sort, getSortIcon } = useTableSort(participacionesFiltradas, 'feria.fecha_inicio', 'desc')

// Computed - KPIs
const totalParticipaciones = computed(() => participacionesFiltradas.value.length)

const emprendedoresUnicos = computed(() => {
    const unicos = new Set(participacionesFiltradas.value.map(p => p.emprendimiento_id))
    return unicos.size
})

const participacionesActivas = computed(() =>
    participacionesFiltradas.value.filter(p =>
        p.estado_participacion === 'Confirmada' || p.estado_participacion === 'Completada'
    ).length
)

const promedioParticipacionesPorEmprendedor = computed(() => {
    if (emprendedoresUnicos.value === 0) return 0
    return Math.round(totalParticipaciones.value / emprendedoresUnicos.value * 10) / 10
})

const totales = computed(() => ({
    totalPagar: participacionesFiltradas.value.reduce((sum, p) => sum + parseFloat(p.total_pagar || 0), 0),
    totalPagado: participacionesFiltradas.value.reduce((sum, p) => sum + parseFloat(p.pagado || 0), 0),
    totalSaldo: participacionesFiltradas.value.reduce((sum, p) => sum + parseFloat(p.saldo_pendiente || 0), 0)
}))

// Top emprendedores
const topEmprendedoresPorParticipaciones = computed(() => {
    const conteo = {}

    participacionesFiltradas.value.forEach(p => {
        const id = p.emprendimiento_id
        if (!conteo[id]) {
            conteo[id] = {
                id,
                nombre: p.emprendimiento?.nombre_emprendimiento,
                emprendedor: p.emprendimiento?.nombre_emprendedor,
                participaciones: 0
            }
        }
        conteo[id].participaciones++
    })

    return Object.values(conteo)
        .sort((a, b) => b.participaciones - a.participaciones)
        .slice(0, 10)
})

const topEmprendedoresPorIngresos = computed(() => {
    const conteo = {}

    participacionesFiltradas.value.forEach(p => {
        const id = p.emprendimiento_id
        if (!conteo[id]) {
            conteo[id] = {
                id,
                nombre: p.emprendimiento?.nombre_emprendimiento,
                totalGenerado: 0
            }
        }
        conteo[id].totalGenerado += parseFloat(p.total_pagar || 0)
    })

    return Object.values(conteo)
        .sort((a, b) => b.totalGenerado - a.totalGenerado)
        .slice(0, 10)
})

// Methods
const getBadgeEstado = (estado) => {
    const badges = {
        'Confirmada': 'badge badge-success',
        'Pendiente': 'badge badge-warning',
        'Cancelada': 'badge badge-danger',
        'Completada': 'badge badge-primary'
    }
    return badges[estado] || 'badge badge-secondary'
}

const getMedalClass = (index) => {
    if (index === 0) return 'badge-warning' // Oro
    if (index === 1) return 'badge-secondary' // Plata
    if (index === 2) return 'badge-danger' // Bronce
    return 'badge-info'
}

const exportarReporte = () => {
    const dataForExport = sortedData.value.map(p => ({
        'Emprendimiento': p.emprendimiento?.nombre_emprendimiento,
        'Emprendedor': p.emprendimiento?.nombre_emprendedor,
        'RUT': p.emprendimiento?.rut,
        'Feria': p.feria?.nombre,
        'Centro': p.feria?.centro_comercial?.nombre,
        'Fecha': formatDate(p.feria?.fecha_inicio),
        'Stand': p.numero_stand,
        'Total a Pagar': p.total_pagar,
        'Pagado': p.pagado,
        'Saldo Pendiente': p.saldo_pendiente,
        'Estado': p.estado_participacion
    }))

    const result = exportToExcel(
        dataForExport,
        `reporte-participaciones-${new Date().toISOString().split('T')[0]}`,
        'Participaciones'
    )

    if (result.success) {
        alert('Reporte exportado exitosamente')
    } else {
        alert('Error al exportar: ' + result.error)
    }
}

const formatNumber = (num) => {
    return new Intl.NumberFormat('es-CL').format(num || 0)
}

const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-CL')
}

// Lifecycle
onMounted(async () => {
    await Promise.all([
        centrosStore.fetchCentros(),
        feriasStore.fetchFerias(),
        participacionesStore.cargarParticipaciones(),
        emprendimientosStore.fetchEmprendimientos()
    ])
})
</script>

<style scoped>
.sortable {
    cursor: pointer;
    user-select: none;
}

.sortable:hover {
    background-color: #f8f9fa;
}
</style>
