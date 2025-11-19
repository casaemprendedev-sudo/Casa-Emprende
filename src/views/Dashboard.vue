<template>
    <div>
        <!-- Content Header -->
        <div class="content-header">
            <div class="row align-items-center">
                <div class="col-sm-6">
                    <h1>
                        <i class="fas fa-chart-line mr-2" style="color: #4f46e5;"></i>
                        Dashboard
                    </h1>
                </div>
                <div class="col-sm-6 text-right">
                    <small class="text-muted">
                        <i class="fas fa-calendar mr-1"></i>
                        {{ new Date().toLocaleDateString('es-CL', {
                            weekday: 'long', year: 'numeric', month: 'long',
                        day: 'numeric' }) }}
                    </small>
                </div>
            </div>
        </div>

        <!-- Estadísticas principales -->
        <div class="row">
            <div class="col-lg-3 col-6">
                <div class="small-box bg-info">
                    <div class="inner">
                        <h3>{{ centrosStore.totalCentros }}</h3>
                        <p>Centros Comerciales</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-building"></i>
                    </div>
                    <router-link to="/centros" class="small-box-footer">
                        Ver detalles <i class="fas fa-arrow-right ml-1"></i>
                    </router-link>
                </div>
            </div>

            <div class="col-lg-3 col-6">
                <div class="small-box bg-success">
                    <div class="inner">
                        <h3>{{ emprendimientosStore.totalEmprendimientos }}</h3>
                        <p>Emprendimientos</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <router-link to="/emprendimientos" class="small-box-footer">
                        Ver detalles <i class="fas fa-arrow-right ml-1"></i>
                    </router-link>
                </div>
            </div>

            <div class="col-lg-3 col-6">
                <div class="small-box bg-warning">
                    <div class="inner">
                        <h3>{{ feriasStore.feriasActivas.length }}</h3>
                        <p>Ferias Activas</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <router-link to="/ferias" class="small-box-footer">
                        Ver detalles <i class="fas fa-arrow-right ml-1"></i>
                    </router-link>
                </div>
            </div>

            <div class="col-lg-3 col-6">
                <div class="small-box bg-danger">
                    <div class="inner">
                        <h3>{{ feriasStore.totalFerias }}</h3>
                        <p>Total Ferias</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <router-link to="/ferias" class="small-box-footer">
                        Ver detalles <i class="fas fa-arrow-right ml-1"></i>
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Próximas Ferias -->
        <div class="row">
            <div class="col-12" v-if="proximasFerias.length > 0">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-calendar-week mr-2"></i>
                            Próximas Ferias
                        </h3>
                        <div class="card-tools">
                            <span class="badge badge-primary">{{ proximasFerias.length }} ferias</span>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th><i class="fas fa-tag mr-1"></i> Feria</th>
                                    <th><i class="fas fa-building mr-1"></i> Centro</th>
                                    <th><i class="fas fa-calendar mr-1"></i> Fecha Inicio</th>
                                    <th><i class="fas fa-users mr-1"></i> Ocupación</th>
                                    <th><i class="fas fa-info-circle mr-1"></i> Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="feria in proximasFerias" :key="feria.id">
                                    <td><strong>{{ feria.nombre }}</strong></td>
                                    <td>{{ obtenerNombreCentro(feria.centroComercialId) }}</td>
                                    <td>{{ formatDate(feria.fechaInicio) }}</td>
                                    <td>
                                        {{ obtenerParticipaciones(feria.id).length }} / {{ feria.limitePuestos }}
                                    </td>
                                    <td>
                                        <span :class="['badge', getBadgeEstado(feria.estado)]">
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
import { computed } from 'vue'
import { useCentrosStore } from '../stores/centros'
import { useEmprendimientosStore } from '../stores/emprendimientos'
import { useFeriasStore } from '../stores/ferias'
import { useParticipacionesStore } from '../stores/participaciones'

const centrosStore = useCentrosStore()
const emprendimientosStore = useEmprendimientosStore()
const feriasStore = useFeriasStore()
const participacionesStore = useParticipacionesStore()

const proximasFerias = computed(() => {
    const hoy = new Date()
    return feriasStore.ferias
        .filter(f => new Date(f.fechaInicio) >= hoy && f.estado !== 'Cancelada')
        .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
        .slice(0, 5)
})

function obtenerNombreCentro(centroId) {
    const centro = centrosStore.obtenerPorId(centroId)
    return centro?.nombre || 'N/A'
}

function obtenerParticipaciones(feriaId) {
    return participacionesStore.obtenerPorFeria(feriaId)
}

function getBadgeEstado(estado) {
    const badges = {
        'Planificada': 'badge-info',
        'Montada': 'badge-warning',
        'En Curso': 'badge-success',
        'Desmontada': 'badge-secondary',
        'Cancelada': 'badge-danger'
    }
    return badges[estado] || 'badge-secondary'
}

function formatDate(dateString) {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>
