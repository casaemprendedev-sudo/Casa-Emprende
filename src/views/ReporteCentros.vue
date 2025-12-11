<template>
    <div class="reporte-centros">
        <Breadcrumb :items="breadcrumbItems" />

        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">
                <i class="fas fa-chart-area me-2"></i>Reporte por Centro Comercial
            </h2>
        </div>

        <!-- Filtros -->
        <div class="row mb-4">
            <div class="col-md-6">
                <label class="form-label">Centro Comercial</label>
                <select class="form-select" v-model="selectedCentroId" @change="loadData">
                    <option value="">Seleccione un centro...</option>
                    <option v-for="centro in centrosStore.malls" :key="centro.id" :value="centro.id">
                        {{ centro.nombre }}
                    </option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">Año</label>
                <select class="form-select" v-model="selectedYear" @change="loadData">
                    <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
            </div>
        </div>

        <div v-if="!selectedCentroId" class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            Seleccione un centro comercial para ver el reporte
        </div>

        <div v-else-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
        </div>

        <div v-else>
            <!-- KPIs -->
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="stat-label">Total Ferias</div>
                            <div class="stat-value">{{ stats.totalFerias }}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="stat-label">Emprendedores</div>
                            <div class="stat-value">{{ stats.totalEmprendedores }}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="stat-label">Ingresos Totales</div>
                            <div class="stat-value">${{ formatNumber(stats.totalIngresos) }}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="stat-label">Ocupación Promedio</div>
                            <div class="stat-value">{{ stats.ocupacionPromedio }}%</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Información del Centro -->
            <div class="card mb-4" v-if="selectedCentro">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-building me-2"></i>{{ selectedCentro.nombre }}
                    </h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Dirección:</strong> {{ selectedCentro.direccion }}</p>
                            <p><strong>Ciudad:</strong> {{ selectedCentro.ciudad }}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Región:</strong> {{ selectedCentro.region }}</p>
                            <p><strong>Teléfono:</strong> {{ selectedCentro.telefono || '-' }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla de Ferias -->
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas fa-calendar-alt me-2"></i>Ferias Realizadas
                    </h5>
                </div>
                <div class="card-body">
                    <div v-if="ferias.length === 0" class="text-center py-4 text-muted">
                        No hay ferias registradas para este centro en {{ selectedYear }}
                    </div>
                    <div v-else class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>Feria</th>
                                    <th>Período</th>
                                    <th>Stands</th>
                                    <th>Ocupación</th>
                                    <th>Ingresos</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="feria in ferias" :key="feria.id">
                                    <td><strong>{{ feria.nombre }}</strong></td>
                                    <td>
                                        {{ formatDate(feria.fecha_inicio) }} - {{ formatDate(feria.fecha_fin) }}
                                    </td>
                                    <td>{{ feria.stands_ocupados }} / {{ feria.stands_totales }}</td>
                                    <td>
                                        <div class="progress" style="height: 20px;">
                                            <div class="progress-bar" :class="getOcupacionClass(feria.ocupacion)"
                                                :style="{ width: feria.ocupacion + '%' }">
                                                {{ feria.ocupacion }}%
                                            </div>
                                        </div>
                                    </td>
                                    <td><strong>${{ formatNumber(feria.ingresos) }}</strong></td>
                                    <td>
                                        <span class="badge" :class="getEstadoBadge(feria.estado)">
                                            {{ feria.estado }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMallsStore } from '../stores/malls'
import { useFeriasStore } from '../stores/ferias'
import { useParticipationsStore } from '../stores/participations'
import Breadcrumb from '../components/common/Breadcrumb.vue'

const centrosStore = useMallsStore()
const feriasStore = useFeriasStore()
const participacionesStore = useParticipationsStore()

const selectedCentroId = ref('')
const selectedYear = ref(new Date().getFullYear())
const loading = ref(false)

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

const breadcrumbItems = [
    { text: 'Reportes', icon: 'fas fa-chart-bar' },
    { text: 'Por Centro', icon: 'fas fa-chart-area' }
]

const selectedCentro = computed(() => {
    return centrosStore.malls.find(c => c.id === selectedCentroId.value)
})

const ferias = computed(() => {
    return feriasStore.ferias
        .filter(f => {
            if (!selectedCentroId.value) return false
            const feriaYear = new Date(f.fecha_inicio).getFullYear()
            return f.centro_id === selectedCentroId.value && feriaYear === selectedYear.value
        })
        .map(f => {
            const ocupacion = f.stands_totales > 0
                ? Math.round((f.stands_ocupados / f.stands_totales) * 100)
                : 0
            const ingresos = participacionesStore.participations
                .filter(p => p.feria_id === f.id)
                .reduce((sum, p) => sum + (parseFloat(p.monto_total) || 0), 0)

            return {
                ...f,
                ocupacion,
                ingresos
            }
        })
})

const stats = computed(() => {
    const totalFerias = ferias.value.length
    const emprendedoresUnicos = new Set(
        participacionesStore.participations
            .filter(p => ferias.value.some(f => f.id === p.feria_id))
            .map(p => p.emprendimiento_id)
    )
    const totalEmprendedores = emprendedoresUnicos.size
    const totalIngresos = ferias.value.reduce((sum, f) => sum + f.ingresos, 0)
    const ocupacionPromedio = ferias.value.length > 0
        ? Math.round(ferias.value.reduce((sum, f) => sum + f.ocupacion, 0) / ferias.value.length)
        : 0

    return {
        totalFerias,
        totalEmprendedores,
        totalIngresos,
        ocupacionPromedio
    }
})

function formatNumber(value) {
    return new Intl.NumberFormat('es-CL').format(value || 0)
}

function formatDate(date) {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-CL')
}

function getOcupacionClass(ocupacion) {
    if (ocupacion >= 80) return 'bg-success'
    if (ocupacion >= 50) return 'bg-warning'
    return 'bg-danger'
}

function getEstadoBadge(estado) {
    const badges = {
        'Planificada': 'bg-info',
        'En Curso': 'bg-primary',
        'Finalizada': 'bg-success',
        'Cancelada': 'bg-danger'
    }
    return badges[estado] || 'bg-secondary'
}

async function loadData() {
    if (!selectedCentroId.value) return
    loading.value = true
    try {
        await Promise.all([
            feriasStore.cargarFerias(),
            participacionesStore.loadParticipations()
        ])
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await centrosStore.loadMalls()
})
</script>

<style scoped>
.stat-card {
    border-left: 4px solid #0d6efd;
}

.stat-label {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
}

.stat-value {
    font-size: 1.75rem;
    font-weight: 600;
    color: #212529;
}
</style>
