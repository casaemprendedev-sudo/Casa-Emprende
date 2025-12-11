<template>
    <div>
        <!-- Content Header -->
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0">
                            <i class="fas fa-calendar-alt mr-2"></i>
                            Gestión de Ferias
                        </h1>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabs para Tipo de Feria -->
        <div class="container-fluid">
            <ul class="nav nav-tabs" role="tablist">
                <li class="nav-item">
                    <button 
                        type="button"
                        class="nav-link" 
                        :class="{ active: tipoFeriaActiva === 'fija' }"
                        @click="tipoFeriaActiva = 'fija'"
                    >
                        <i class="fas fa-store mr-2"></i>
                        Ferias Fijas
                        <span class="badge badge-primary ml-2">{{ feriasStore.feriasFijas.length }}</span>
                    </button>
                </li>
                <li class="nav-item">
                    <button 
                        type="button"
                        class="nav-link" 
                        :class="{ active: tipoFeriaActiva === 'itinerante' }"
                        @click="tipoFeriaActiva = 'itinerante'"
                    >
                        <i class="fas fa-route mr-2"></i>
                        Ferias Itinerantes
                        <span class="badge badge-warning ml-2">{{ feriasStore.feriasItinerantes.length }}</span>
                    </button>
                </li>
            </ul>

            <!-- Content según tipo -->
            <div class="tab-content mt-3">
                <!-- FERIAS FIJAS -->
                <div v-if="tipoFeriaActiva === 'fija'">
                    <div class="row mb-3">
                        <div class="col-12">
                            <button @click="abrirFormulario('fija')" class="btn btn-primary">
                                <i class="fas fa-plus mr-1"></i>
                                Nueva Feria Fija
                            </button>
                        </div>
                    </div>

                    <!-- Estadísticas Ferias Fijas -->
                    <div class="row mb-3">
                        <div class="col-lg-3 col-6">
                            <div class="small-box bg-info">
                                <div class="inner">
                                    <h3>{{ feriasStore.feriasFijas.length }}</h3>
                                    <p>Total Fijas</p>
                                </div>
                                <div class="icon">
                                    <i class="fas fa-store"></i>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-6">
                            <div class="small-box bg-success">
                                <div class="inner">
                                    <h3>{{ feriasStore.feriasFijasActivas.length }}</h3>
                                    <p>Activas</p>
                                </div>
                                <div class="icon">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tabla Ferias Fijas -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Ferias Fijas Registradas</h3>
                        </div>
                        <div class="card-body p-0">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Centro Comercial</th>
                                        <th>Zona</th>
                                        <th>Coordinador</th>
                                        <th>Puestos</th>
                                        <th>Estado</th>
                                        <th class="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="feriasStore.feriasFijas.length === 0">
                                        <td colspan="7" class="text-center text-muted py-4">
                                            No hay ferias fijas registradas
                                        </td>
                                    </tr>
                                    <tr v-for="feria in feriasStore.feriasFijas" :key="feria.id">
                                        <td>
                                            <strong>{{ feria.nombre }}</strong>
                                            <br>
                                            <small class="text-muted">
                                                <i class="fas fa-calendar"></i>
                                                {{ formatDate(feria.fecha_inicio) }} - {{ formatDate(feria.fecha_fin) }}
                                            </small>
                                        </td>
                                        <td>{{ feria.centro?.nombre || 'N/A' }}</td>
                                        <td>{{ feria.zona?.nombre || 'N/A' }}</td>
                                        <td>
                                            <span v-if="feria.coordinador">
                                                {{ feria.coordinador.nombre }}
                                            </span>
                                            <span v-else class="text-muted">Sin asignar</span>
                                        </td>
                                        <td>
                                            <span class="badge badge-light">
                                                {{ obtenerOcupacion(feria.id) }} / {{ feria.limite_puestos }}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge" :class="getBadgeEstado(feria.estado)">
                                                {{ feria.estado }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <button @click="verDetalles(feria)" class="btn btn-sm btn-info" title="Ver Detalles">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button v-if="feria.coordinador_id" @click="abrirModalAsistencia(feria)"
                                                class="btn btn-sm btn-warning" title="Asistencia Coordinador">
                                                <i class="fas fa-calendar-check"></i>
                                            </button>
                                            <button @click="editarFeria(feria)" class="btn btn-sm btn-primary" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- FERIAS ITINERANTES -->
                <div v-if="tipoFeriaActiva === 'itinerante'">
                    <div class="row mb-3">
                        <div class="col-12">
                            <button @click="abrirFormulario('itinerante')" class="btn btn-warning">
                                <i class="fas fa-plus mr-1"></i>
                                Nueva Feria Itinerante
                            </button>
                        </div>
                    </div>

                    <!-- Estadísticas Ferias Itinerantes -->
                    <div class="row mb-3">
                        <div class="col-lg-3 col-6">
                            <div class="small-box bg-warning">
                                <div class="inner">
                                    <h3>{{ feriasStore.feriasItinerantes.length }}</h3>
                                    <p>Total Itinerantes</p>
                                </div>
                                <div class="icon">
                                    <i class="fas fa-route"></i>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-6">
                            <div class="small-box bg-success">
                                <div class="inner">
                                    <h3>{{ feriasStore.feriasItinerantesActivas.length }}</h3>
                                    <p>Activas</p>
                                </div>
                                <div class="icon">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tabla Ferias Itinerantes -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Ferias Itinerantes Registradas</h3>
                        </div>
                        <div class="card-body p-0">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Centro Comercial</th>
                                        <th>Zona</th>
                                        <th>Fechas</th>
                                        <th>Coordinador</th>
                                        <th>Puestos</th>
                                        <th>Estado</th>
                                        <th class="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="feriasStore.feriasItinerantes.length === 0">
                                        <td colspan="8" class="text-center text-muted py-4">
                                            No hay ferias itinerantes registradas
                                        </td>
                                    </tr>
                                    <tr v-for="feria in feriasStore.feriasItinerantes" :key="feria.id">
                                        <td><strong>{{ feria.nombre }}</strong></td>
                                        <td>{{ feria.centro?.nombre || 'N/A' }}</td>
                                        <td>{{ feria.zona?.nombre || 'N/A' }}</td>
                                        <td>
                                            <small>
                                                <i class="fas fa-calendar"></i>
                                                {{ formatDate(feria.fecha_inicio) }} - {{ formatDate(feria.fecha_fin) }}
                                            </small>
                                        </td>
                                        <td>
                                            <span v-if="feria.coordinador">
                                                {{ feria.coordinador.nombre }}
                                            </span>
                                            <span v-else class="text-muted">Sin asignar</span>
                                        </td>
                                        <td>
                                            <span class="badge badge-light">
                                                {{ obtenerOcupacion(feria.id) }} / {{ feria.limite_puestos }}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge" :class="getBadgeEstado(feria.estado)">
                                                {{ feria.estado }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <button @click="verDetalles(feria)" class="btn btn-sm btn-info" title="Ver Detalles">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button v-if="feria.coordinador_id" @click="abrirModalAsistencia(feria)"
                                                class="btn btn-sm btn-warning" title="Asistencia Coordinador">
                                                <i class="fas fa-calendar-check"></i>
                                            </button>
                                            <button @click="editarFeria(feria)" class="btn btn-sm btn-primary" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Formulario Feria -->
        <div v-if="mostrarFormulario" class="modal fade show d-block" tabindex="-1" @click.self="cerrarFormulario">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i :class="editando ? 'fas fa-edit' : 'fas fa-plus'" class="mr-2"></i>
                            {{ editando ? 'Editar' : 'Nueva' }} Feria {{ formulario.tipoFeria === 'fija' ? 'Fija' : 'Itinerante' }}
                        </h5>
                        <button type="button" class="close" @click="cerrarFormulario">
                            <span>&times;</span>
                        </button>
                    </div>
                    <form @submit.prevent="guardarFeria">
                        <div class="modal-body" style="max-height: calc(100vh - 210px); overflow-y: auto;">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label required">Nombre de la Feria</label>
                                        <input v-model="formulario.nombre" type="text" class="form-control" required>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label class="form-label required">Fecha Inicio</label>
                                        <input v-model="formulario.fechaInicio" type="date" class="form-control" required>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label class="form-label required">Fecha Fin</label>
                                        <input v-model="formulario.fechaFin" type="date" class="form-control" required>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label required">Centro Comercial</label>
                                        <select v-model="formulario.centroComercialId" class="form-control" required @change="cargarZonas">
                                            <option value="">Seleccionar...</option>
                                            <option v-for="centro in centrosStore.centros" :key="centro.id" :value="centro.id">
                                                {{ centro.nombre }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label required">Zona</label>
                                        <select v-model="formulario.zonaId" class="form-control" required :disabled="!formulario.centroComercialId">
                                            <option value="">Seleccionar...</option>
                                            <option v-for="zona in zonasDisponibles" :key="zona.id" :value="zona.id">
                                                {{ zona.nombre }} {{ zona.capacidad_maxima ? `(Cap: ${zona.capacidad_maxima})` : '' }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label">Coordinador</label>
                                        <select v-model="formulario.coordinadorId" class="form-control">
                                            <option value="">Sin asignar</option>
                                            <option v-for="coord in coordinadoresStore.coordinadoresActivos" :key="coord.id" :value="coord.id">
                                                {{ coord.nombre }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label required">Límite de Puestos</label>
                                        <input v-model.number="formulario.limitePuestos" type="number" class="form-control" min="1" required>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label">Precio Base Puesto</label>
                                        <input v-model.number="formulario.precioBasePuesto" type="number" class="form-control" min="0">
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-12">
                                    <div class="form-group">
                                        <label class="form-label">Notas</label>
                                        <textarea v-model="formulario.notas" class="form-control" rows="3"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="cerrarFormulario">Cancelar</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save mr-1"></i>
                                {{ editando ? 'Actualizar' : 'Crear' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div v-if="mostrarFormulario" class="modal-backdrop fade show"></div>

        <!-- Modal Detalle de Feria -->
        <FairDetailsModal
            :visible="modalDetalle"
            :fair="feriaActual"
            :participations="participacionesStore.participaciones"
            :businesses="emprendimientosStore.emprendimientos"
            :malls="centrosStore.centros"
            @close="cerrarModalDetalle"
            @add-participation="handleAddParticipation"
            @manage-payments="gestionarAbonos"
            @open-balance="abrirBalanceFinanciero"
        />

        <!-- Modal Gestión de Abonos -->
        <div v-if="modalAbonos && participacionActual" class="modal modal-blur fade show" style="display: block;">
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header border-bottom-0">
                        <h5 class="modal-title">Pagos - {{
                            obtenerNombreEmprendimiento(participacionActual.emprendimiento_id)
                        }}</h5>
                        <button type="button" class="close" @click="cerrarModalAbonos">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <!-- Resumen -->
                        <div class="row mb-4">
                            <div class="col-4 text-center">
                                <div class="text-muted small mb-1">Total</div>
                                <div class="h4 mb-0">${{ formatNumber(participacionActual.monto_final) }}</div>
                            </div>
                            <div class="col-4 text-center">
                                <div class="text-muted small mb-1">Pagado</div>
                                <div class="h4 mb-0 text-success">${{ formatNumber(participacionActual.monto_pagado) }}
                                </div>
                            </div>
                            <div class="col-4 text-center">
                                <div class="text-muted small mb-1">Pendiente</div>
                                <div class="h4 mb-0 text-danger">${{ formatNumber(participacionActual.monto_final -
                                    participacionActual.monto_pagado) }}</div>
                            </div>
                        </div>

                        <!-- Formulario Nuevo Abono -->
                        <form @submit.prevent="guardarAbono" class="card mb-3">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label class="form-label required">Fecha</label>
                                            <input v-model="formularioAbono.fecha" type="date" class="form-control"
                                                required>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label class="form-label required">Monto</label>
                                            <input v-model.number="formularioAbono.monto" type="number"
                                                class="form-control" min="1" required>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label class="form-label">Banco</label>
                                            <input v-model="formularioAbono.banco" type="text" class="form-control">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label class="form-label">N° Operación</label>
                                            <input v-model="formularioAbono.numeroOperacion" type="text"
                                                class="form-control">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Comprobante de Pago</label>
                                            <input @change="handleComprobanteChange" type="file" class="form-control"
                                                accept="image/*,application/pdf">
                                            <small class="form-text text-muted">Formatos: JPG, PNG, PDF (max
                                                5MB)</small>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-label">Notas</label>
                                            <textarea v-model="formularioAbono.notas" class="form-control"
                                                rows="2"></textarea>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary" :disabled="subiendoComprobante">
                                    <i class="fas fa-plus mr-1"></i>
                                    {{ subiendoComprobante ? 'Subiendo...' : 'Registrar Abono' }}
                                </button>
                            </div>
                        </form>

                        <!-- Lista de Abonos -->
                        <div class="card-body p-0">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Fecha</th>
                                        <th>Monto</th>
                                        <th>Banco</th>
                                        <th>N° Operación</th>
                                        <th>Comprobante</th>
                                        <th>Notas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="abonosActuales.length === 0">
                                        <td colspan="7" class="text-center text-muted py-4">
                                            No hay abonos registrados
                                        </td>
                                    </tr>
                                    <tr v-for="abono in abonosActuales" :key="abono.id">
                                        <td>#{{ abono.numero_abono }}</td>
                                        <td>{{ formatDate(abono.fecha) }}</td>
                                        <td class="text-success fw-bold">${{ formatNumber(abono.monto) }}</td>
                                        <td>{{ abono.banco || '-' }}</td>
                                        <td>{{ abono.numero_operacion || '-' }}</td>
                                        <td>
                                            <a v-if="abono.comprobante_url" :href="abono.comprobante_url"
                                                target="_blank" class="btn btn-sm btn-info">
                                                <i class="fas fa-file-download"></i>
                                            </a>
                                            <span v-else class="text-muted">-</span>
                                        </td>
                                        <td>
                                            <span v-if="abono.notas" :title="abono.notas"
                                                class="text-truncate d-inline-block" style="max-width: 150px;">
                                                {{ abono.notas }}
                                            </span>
                                            <span v-else class="text-muted">-</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer border-top-0">
                        <button type="button" class="btn btn-secondary" @click="cerrarModalAbonos">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="modalAbonos" class="modal-backdrop fade show"></div>

        <!-- Modal Asistencia Coordinador -->
        <div class="modal fade" :class="{ show: modalAsistencia }"
            :style="{ display: modalAsistencia ? 'block' : 'none' }" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-calendar-check mr-2"></i>
                            Asistencia del Coordinador
                        </h5>
                        <button type="button" class="close" @click="modalAsistencia = false">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" v-if="feriaAsistencia">
                        <!-- Información de la feria -->
                        <div class="card bg-light mb-3">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-8">
                                        <strong>Feria:</strong> {{ feriaAsistencia.nombre }}<br>
                                        <small class="text-muted">
                                            {{ formatDate(feriaAsistencia.fecha_inicio) }} - {{
                                            formatDate(feriaAsistencia.fecha_fin) }}
                                        </small>
                                    </div>
                                    <div class="col-md-4 text-right">
                                        <label class="mb-0"><strong>Seleccionar día:</strong></label>
                                        <select v-model="diaSeleccionado" class="form-control form-control-sm">
                                            <option v-for="dia in diasFeria" :key="dia.fecha" :value="dia.fecha">
                                                {{ dia.nombreDia }} - {{ formatDate(dia.fecha) }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tabla de emprendedores -->
                        <div v-if="participantesAsistencia.length > 0">
                            <h6 class="mb-3">
                                <i class="fas fa-users mr-2"></i>
                                Asistencia de Emprendedores - {{ formatDate(diaSeleccionado) }}
                            </h6>
                            <div class="table-responsive">
                                <table class="table table-sm table-hover table-bordered">
                                    <thead class="thead-light">
                                        <tr>
                                            <th style="width: 80px">Puesto</th>
                                            <th>Emprendedor</th>
                                            <th>Emprendimiento</th>
                                            <th class="text-center" style="width: 120px">
                                                <i class="fas fa-clock mr-1"></i>
                                                ¿Llegó a tiempo?
                                                <br>
                                                <input type="checkbox" @change="marcarTodosPuntuales($event.target.checked)"
                                                    title="Marcar/Desmarcar todos" class="mt-1">
                                            </th>
                                            <th style="width: 250px">Observaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="participante in participantesAsistencia" :key="participante.id">
                                            <td class="text-center">
                                                <span class="badge badge-info">{{ participante.numero_puesto }}</span>
                                            </td>
                                            <td>{{ participante.emprendimiento?.nombre_emprendedor || 'N/A' }}</td>
                                            <td>{{ participante.emprendimiento?.nombre_emprendimiento || 'N/A' }}</td>
                                            <td class="text-center">
                                                <input type="checkbox" v-model="participante.llego_a_tiempo" 
                                                    class="form-check-input" style="width: 20px; height: 20px;">
                                            </td>
                                            <td>
                                                <input v-model="participante.observaciones" type="text"
                                                    class="form-control form-control-sm" 
                                                    placeholder="Ej: Llegó 30 min tarde...">
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- Resumen -->
                            <div class="alert alert-info mt-3">
                                <i class="fas fa-info-circle mr-2"></i>
                                <strong>Puntuales:</strong> {{ participantesPuntuales }} de {{ participantesAsistencia.length }}
                                ({{ porcentajePuntualidad }}%)
                            </div>
                        </div>
                        <div v-else class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            Esta feria no tiene participantes registrados
                        </div>
                    </div>
                    <div class="modal-footer" v-if="participantesAsistencia.length > 0">
                        <button type="button" class="btn btn-secondary" @click="modalAsistencia = false">
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-primary" @click="guardarAsistenciasEmprendedores">
                            <i class="fas fa-save mr-1"></i>
                            Guardar Asistencias
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="modalAsistencia" class="modal-backdrop fade show"></div>

        <!-- Modal Balance Financiero -->
        <FairBalanceModal
            :visible="modalBalance"
            :fair="feriaActual"
            :participations="participacionesStore.participaciones"
            :businesses="emprendimientosStore.emprendimientos"
            :malls="centrosStore.centros"
            @close="cerrarModalBalance"
            @refresh="feriasStore.cargarFerias"
        />

    </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useFeriasStore, TIPOS_FERIA } from '../stores/ferias'
import { useCentrosStore } from '../stores/centros'
import { useCoordinadoresStore } from '../stores/coordinadores'
import { useParticipacionesStore } from '../stores/participaciones'
import { useEmprendimientosStore } from '../stores/emprendimientos'
import { useAbonosStore } from '../stores/abonos'
import FairDetailsModal from '../components/fairs/FairDetailsModal.vue'
import FairBalanceModal from '../components/fairs/FairBalanceModal.vue'

const feriasStore = useFeriasStore()
const centrosStore = useCentrosStore()
const coordinadoresStore = useCoordinadoresStore()
const participacionesStore = useParticipacionesStore()
const emprendimientosStore = useEmprendimientosStore()
const abonosStore = useAbonosStore()

const tipoFeriaActiva = ref('fija')
const mostrarFormulario = ref(false)
const modalDetalle = ref(false)
const modalAbonos = ref(false)
const modalBalance = ref(false)
const feriaActual = ref(null)
const participacionActual = ref(null)
const abonosActuales = ref([])
const editando = ref(false)
const zonasDisponibles = ref([])
const subiendoComprobante = ref(false)

// Variables para asistencia
const modalAsistencia = ref(false)
const feriaAsistencia = ref(null)
const diasFeria = ref([])
const diaSeleccionado = ref(null)
const participantesAsistencia = ref([])

const formulario = reactive({
    tipoFeria: 'fija',
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    centroComercialId: '',
    zonaId: '',
    coordinadorId: '',
    limitePuestos: 10,
    precioBasePuesto: 0,
    notas: ''
})

const formularioAbono = reactive({
    fecha: new Date().toISOString().split('T')[0],
    monto: 0,
    banco: '',
    numeroOperacion: '',
    notas: '',
    archivoComprobante: null
})

function abrirFormulario(tipo) {
    resetFormulario()
    formulario.tipoFeria = tipo
    mostrarFormulario.value = true
    editando.value = false
}

function cerrarFormulario() {
    mostrarFormulario.value = false
    resetFormulario()
}

function resetFormulario() {
    Object.assign(formulario, {
        tipoFeria: 'fija',
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        centroComercialId: '',
        zonaId: '',
        coordinadorId: '',
        limitePuestos: 10,
        precioBasePuesto: 0,
        notas: ''
    })
    zonasDisponibles.value = []
}

async function cargarZonas() {
    if (!formulario.centroComercialId) {
        zonasDisponibles.value = []
        return
    }
    
    try {
        // Cargar zonas del centro seleccionado desde el store
        await centrosStore.cargarZonas()
        zonasDisponibles.value = centrosStore.zonas.filter(
            z => z.centro_comercial_id === formulario.centroComercialId
        )
    } catch (error) {
        console.error('Error cargando zonas:', error)
        zonasDisponibles.value = []
    }
}

async function guardarFeria() {
    try {
        if (editando.value) {
            await feriasStore.actualizarFeria(formulario.id, formulario)
        } else {
            await feriasStore.agregarFeria(formulario)
        }
        cerrarFormulario()
    } catch (error) {
        alert('Error al guardar: ' + error.message)
    }
}

function editarFeria(feria) {
    Object.assign(formulario, {
        id: feria.id,
        tipoFeria: feria.tipo_feria,
        nombre: feria.nombre,
        fechaInicio: feria.fecha_inicio,
        fechaFin: feria.fecha_fin,
        centroComercialId: feria.centro_comercial_id,
        zonaId: feria.zona_id,
        coordinadorId: feria.coordinador_id || '',
        limitePuestos: feria.limite_puestos,
        precioBasePuesto: feria.precio_base_puesto || 0,
        notas: feria.notas || ''
    })
    cargarZonas()
    mostrarFormulario.value = true
    editando.value = true
}

function verDetalles(feria) {
    feriaActual.value = feria
    modalDetalle.value = true
}

function cerrarModalDetalle() {
    modalDetalle.value = false
    feriaActual.value = null
}

async function handleAddParticipation(participationData) {
    try {
        await participacionesStore.agregarParticipacion(participationData)
    } catch (error) {
        console.error('Error agregando participación:', error)
        alert('Error al agregar participación: ' + error.message)
    }
}

async function gestionarAbonos(part) {
    participacionActual.value = part
    // Cargar abonos desde BD
    await abonosStore.cargarAbonos()
    abonosActuales.value = abonosStore.obtenerPorParticipacion(part.id)
    modalAbonos.value = true
}

function cerrarModalAbonos() {
    modalAbonos.value = false
    participacionActual.value = null
    abonosActuales.value = []
    formularioAbono.archivoComprobante = null
    Object.assign(formularioAbono, {
        fecha: new Date().toISOString().split('T')[0],
        monto: 0,
        banco: '',
        numeroOperacion: '',
        notas: '',
        archivoComprobante: null
    })
}

function handleComprobanteChange(event) {
    const file = event.target.files[0]
    if (file) {
        // Validar tamaño (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo no debe superar 5MB')
            event.target.value = ''
            return
        }
        formularioAbono.archivoComprobante = file
    }
}

async function guardarAbono() {
    try {
        subiendoComprobante.value = true

        // Registrar abono
        await abonosStore.registrarAbono({
            participacionId: participacionActual.value.id,
            fecha: formularioAbono.fecha,
            monto: formularioAbono.monto,
            banco: formularioAbono.banco,
            numeroOperacion: formularioAbono.numeroOperacion,
            notas: formularioAbono.notas,
            archivoComprobante: formularioAbono.archivoComprobante
        })

        // Recargar abonos
        await abonosStore.cargarAbonos()
        abonosActuales.value = abonosStore.obtenerPorParticipacion(participacionActual.value.id)

        // Resetear formulario
        Object.assign(formularioAbono, {
            fecha: new Date().toISOString().split('T')[0],
            monto: 0,
            banco: '',
            numeroOperacion: '',
            notas: '',
            archivoComprobante: null
        })

        // Limpiar input file
        const fileInput = document.querySelector('input[type="file"]')
        if (fileInput) fileInput.value = ''

    } catch (error) {
        console.error('Error guardando abono:', error)
        alert('Error al guardar abono: ' + error.message)
    } finally {
        subiendoComprobante.value = false
    }
}

function obtenerNombreEmprendimiento(emprendimientoId) {
    const emp = emprendimientosStore.obtenerPorId(emprendimientoId)
    return emp?.nombre_emprendimiento || 'N/A'
}

function abrirBalanceFinanciero(feria) {
    feriaActual.value = feria
    modalBalance.value = true
}

function cerrarModalBalance() {
    modalBalance.value = false
}

function obtenerOcupacion(feriaId) {
    const participaciones = participacionesStore.obtenerPorFeria(feriaId)
    return participaciones.length
}

// Computed para asistencias
const todosAsistieron = computed(() => {
    return diasFeria.value.length > 0 && diasFeria.value.every(d => d.asistio)
})

const diasAsistidos = computed(() => {
    return diasFeria.value.filter(d => d.asistio).length
})

const porcentajeAsistencia = computed(() => {
    if (diasFeria.value.length === 0) return 0
    return Math.round((diasAsistidos.value / diasFeria.value.length) * 100)
})

const participantesPuntuales = computed(() => {
    return participantesAsistencia.value.filter(p => p.llego_a_tiempo).length
})

const porcentajePuntualidad = computed(() => {
    if (participantesAsistencia.value.length === 0) return 0
    return Math.round((participantesPuntuales.value / participantesAsistencia.value.length) * 100)
})

// Watch para cargar asistencias cuando cambia el día seleccionado
watch(diaSeleccionado, async (nuevaFecha) => {
    if (nuevaFecha && feriaAsistencia.value) {
        await cargarAsistenciasDia(nuevaFecha)
    }
})

function getBadgeEstado(estado) {
    const badges = {
        'Planificada': 'badge-warning',
        'Montada': 'badge-info',
        'En Curso': 'badge-success',
        'Desmontada': 'badge-secondary',
        'Cancelada': 'badge-danger'
    }
    return badges[estado] || 'badge-secondary'
}

function formatDate(date) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatNumber(value) {
    return new Intl.NumberFormat('es-CL').format(value || 0)
}

// ===== FUNCIONES DE ASISTENCIA =====
async function abrirModalAsistencia(feria) {
    feriaAsistencia.value = feria
    modalAsistencia.value = true

    // Generar todos los días entre fecha_inicio y fecha_fin
    generarDiasFeria(feria)

    // Seleccionar el primer día por defecto
    if (diasFeria.value.length > 0) {
        diaSeleccionado.value = diasFeria.value[0].fecha
    }

    // Cargar participantes de la feria con sus asistencias
    await cargarParticipantes(feria.id)
}

function generarDiasFeria(feria) {
    const dias = []
    const fechaInicio = new Date(feria.fecha_inicio + 'T00:00:00')
    const fechaFin = new Date(feria.fecha_fin + 'T00:00:00')

    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

    let fechaActual = new Date(fechaInicio)
    while (fechaActual <= fechaFin) {
        const fechaStr = fechaActual.toISOString().split('T')[0]
        dias.push({
            fecha: fechaStr,
            nombreDia: nombresDias[fechaActual.getDay()]
        })
        fechaActual.setDate(fechaActual.getDate() + 1)
    }

    diasFeria.value = dias
}

async function cargarParticipantes(feriaId) {
    try {
        // Cargar participaciones de la feria
        const participaciones = participacionesStore.obtenerPorFeria(feriaId)
        
        // Inicializar la lista de participantes con sus datos
        participantesAsistencia.value = participaciones.map(p => ({
            id: p.id,
            participacion_id: p.id,
            numero_puesto: p.numero_puesto,
            emprendimiento: emprendimientosStore.emprendimientos.find(e => e.id === p.emprendimiento_id),
            llego_a_tiempo: false,
            observaciones: ''
        }))

        // Cargar asistencias del día seleccionado
        if (diaSeleccionado.value) {
            await cargarAsistenciasDia(diaSeleccionado.value)
        }
    } catch (error) {
        console.error('Error cargando participantes:', error)
    }
}

async function cargarAsistenciasDia(fecha) {
    try {
        if (!feriaAsistencia.value) return

        // Cargar asistencias existentes para esta fecha
        const asistencias = await feriasStore.cargarAsistenciasEmprendedores(feriaAsistencia.value.id, fecha)

        // Actualizar los participantes con los datos de asistencia
        participantesAsistencia.value.forEach(participante => {
            const asistencia = asistencias.find(a => a.participacion_id === participante.participacion_id && a.fecha === fecha)
            if (asistencia) {
                participante.llego_a_tiempo = asistencia.llego_a_tiempo
                participante.observaciones = asistencia.observaciones || ''
            } else {
                // Si no hay asistencia registrada, resetear
                participante.llego_a_tiempo = false
                participante.observaciones = ''
            }
        })
    } catch (error) {
        console.error('Error cargando asistencias del día:', error)
    }
}

function marcarTodosPuntuales(puntuales) {
    participantesAsistencia.value.forEach(p => {
        p.llego_a_tiempo = puntuales
    })
}

async function guardarAsistenciasEmprendedores() {
    try {
        const asistencias = participantesAsistencia.value.map(p => ({
            participacion_id: p.participacion_id,
            fecha: diaSeleccionado.value,
            llego_a_tiempo: p.llego_a_tiempo,
            observaciones: p.observaciones || null
        }))

        await feriasStore.guardarAsistenciasEmprendedores(asistencias)

        alert('Asistencias guardadas correctamente')
    } catch (error) {
        alert('Error al guardar asistencias: ' + error.message)
    }
}

</script>

<style scoped>
.nav-tabs .nav-link {
    cursor: pointer;
    border: 1px solid transparent;
    background: none;
}

.nav-tabs .nav-link:hover {
    border-color: #e9ecef #e9ecef #dee2e6;
}

.nav-tabs .nav-link.active {
    font-weight: bold;
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
}

.d-block {
    display: block !important;
}

.modal {
    overflow-x: hidden;
    overflow-y: auto;
}
</style>
