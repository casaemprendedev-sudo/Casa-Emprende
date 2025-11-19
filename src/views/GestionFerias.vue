<template>
    <div>
        <!-- Content Header -->
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0">Ferias</h1>
                    </div>
                    <div class="col-sm-6">
                        <button @click="mostrarFormularioFeria = true" class="btn btn-primary float-right">
                            <i class="fas fa-plus mr-1"></i>
                            Nueva Feria
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Formulario Nueva Feria -->
        <div class="row" v-if="mostrarFormularioFeria">
            <div class="col-12">
                <div class="card card-warning">
                    <div class="card-header">
                        <h3 class="card-title">{{ editandoFeria ? 'Editar' : 'Nueva' }} Feria</h3>
                    </div>
                    <form @submit.prevent="guardarFeria">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label required">Nombre de la Feria</label>
                                        <input v-model="formularioFeria.nombre" type="text" class="form-control"
                                            required>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label class="form-label required">Fecha Inicio</label>
                                        <input v-model="formularioFeria.fechaInicio" type="date" class="form-control"
                                            required>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label class="form-label required">Fecha Fin</label>
                                        <input v-model="formularioFeria.fechaFin" type="date" class="form-control"
                                            required>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label required">Centro Comercial</label>
                                        <select v-model="formularioFeria.centroComercialId" class="form-select" required
                                            @change="cargarZonas">
                                            <option value="">Seleccionar...</option>
                                            <option v-for="centro in centrosStore.centros" :key="centro.id"
                                                :value="centro.id">
                                                {{ centro.nombre }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label required">Zona</label>
                                        <select v-model="formularioFeria.zonaId" class="form-select" required
                                            :disabled="!formularioFeria.centroComercialId">
                                            <option value="">Seleccionar...</option>
                                            <option v-for="zona in zonasDisponibles" :key="zona.id" :value="zona.id">
                                                {{ zona.nombre }} {{ zona.capacidad_maxima ? `(Capacidad:
                                                ${zona.capacidad_maxima})` : '' }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label">Coordinador</label>
                                        <select v-model="formularioFeria.coordinadorId" class="form-select">
                                            <option value="">Sin asignar</option>
                                            <option v-for="coordinador in coordinadoresStore.coordinadoresActivos"
                                                :key="coordinador.id" :value="coordinador.id">
                                                {{ coordinador.nombre }} - {{ coordinador.rut }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label required">Límite Total de Puestos</label>
                                        <input v-model.number="formularioFeria.limitePuestos" type="number"
                                            class="form-control" min="1" required>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label">Precio Base por Puesto</label>
                                        <input v-model.number="formularioFeria.precioBasePuesto" type="number"
                                            class="form-control" min="0">
                                        <small class="form-hint">Este precio se aplica a todos los emprendedores</small>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label">Moneda</label>
                                        <select v-model="formularioFeria.moneda" class="form-select">
                                            <option value="CLP">CLP (Pesos Chilenos)</option>
                                            <option value="UF">UF (Unidad de Fomento)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-save mr-1"></i>
                                {{ editandoFeria ? 'Actualizar' : 'Crear' }} Feria
                            </button>
                            <button type="button" @click="cancelarFormularioFeria" class="btn btn-secondary ml-2">
                                <i class="fas fa-times mr-1"></i>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Estadísticas Rápidas -->
        <div class="row">
            <div class="col-lg-3 col-6">
                <div class="small-box bg-info">
                    <div class="inner">
                        <h3>{{ feriasStore.totalFerias }}</h3>
                        <p>Total Ferias</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-6">
                <div class="small-box bg-success">
                    <div class="inner">
                        <h3>{{ feriasActivas }}</h3>
                        <p>Ferias Activas</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-6">
                <div class="small-box bg-warning">
                    <div class="inner">
                        <h3>{{ feriasPlanificadas }}</h3>
                        <p>Planificadas</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-clock"></i>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-6">
                <div class="small-box bg-danger">
                    <div class="inner">
                        <h3>{{ totalParticipaciones }}</h3>
                        <p>Total Participaciones</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Lista de Ferias -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-list mr-2"></i>
                            Ferias Registradas ({{ feriasStore.totalFerias }})
                        </h3>
                        <div class="card-tools">
                            <select v-model="filtroEstado" class="form-control form-control-sm" style="width: 200px;">
                                <option value="">Todos los estados</option>
                                <option value="Planificada">Planificada</option>
                                <option value="Montada">Montada</option>
                                <option value="En Curso">En Curso</option>
                                <option value="Desmontada">Desmontada</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th><i class="fas fa-tag mr-1"></i> Feria</th>
                                    <th><i class="fas fa-building mr-1"></i> Centro / Zona</th>
                                    <th><i class="fas fa-user-tie mr-1"></i> Coordinador</th>
                                    <th><i class="fas fa-calendar mr-1"></i> Fechas</th>
                                    <th><i class="fas fa-info-circle mr-1"></i> Estado</th>
                                    <th><i class="fas fa-users mr-1"></i> Ocupación</th>
                                    <th><i class="fas fa-dollar-sign mr-1"></i> Ingresos</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="feria in feriasFiltradas" :key="feria.id">
                                    <td>
                                        <strong class="d-block">{{ feria.nombre }}</strong>
                                        <small class="text-muted">
                                            <i class="fas fa-dollar-sign mr-1"></i>
                                            {{ feria.moneda }} ${{ formatNumber(feria.precio_base_puesto) }} / puesto
                                        </small>
                                    </td>
                                    <td>
                                        <div><i class="fas fa-building mr-1 text-primary"></i>{{
                                            obtenerNombreCentro(feria.centro_comercial_id) }}</div>
                                        <small class="text-muted">{{ obtenerNombreZona(feria.centro_comercial_id,
                                            feria.zona_id) }}</small>
                                    </td>
                                    <td>
                                        <div v-if="feria.coordinador">{{ feria.coordinador.nombre }}</div>
                                        <small v-if="feria.coordinador" class="text-muted">{{ feria.coordinador.telefono
                                            || feria.coordinador.email }}</small>
                                        <span v-else class="text-muted">Sin asignar</span>
                                    </td>
                                    <td>
                                        <div>{{ formatDate(feria.fecha_inicio) }}</div>
                                        <small class="text-muted">al {{ formatDate(feria.fecha_fin) }}</small>
                                    </td>
                                    <td>
                                        <span :class="['badge', getBadgeEstado(feria.estado)]">
                                            {{ feria.estado }}
                                        </span>
                                    </td>
                                    <td>
                                        {{ obtenerParticipaciones(feria.id).length }} / {{ feria.limite_puestos }}
                                        <div class="progress progress-sm mt-1">
                                            <div class="progress-bar"
                                                :class="calcularPorcentajeOcupacion(feria) >= 80 ? 'bg-warning' : 'bg-success'"
                                                :style="{ width: calcularPorcentajeOcupacion(feria) + '%' }"></div>
                                        </div>
                                    </td>
                                    <td>
                                        <strong class="text-success">
                                            <i class="fas fa-dollar-sign mr-1"></i>
                                            {{ feria.moneda }} ${{ formatNumber(calcularIngresosFeria(feria.id)) }}
                                        </strong>
                                    </td>
                                    <td>
                                        <div class="btn-group btn-group-sm">
                                            <button @click="verDetalleFeria(feria)" class="btn btn-success"
                                                title="Ver Detalle">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button v-if="feria.coordinador_id" @click="abrirModalAsistencia(feria)"
                                                class="btn btn-info" title="Asistencia Coordinador">
                                                <i class="fas fa-calendar-check"></i>
                                            </button>
                                            <button @click="editarFeria(feria)" class="btn btn-primary" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button @click="eliminarFeria(feria.id)" class="btn btn-danger"
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

        <!-- Modal Detalle de Feria (Nuevo Componente Mejorado) -->
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
                        <!-- Información de la feria y coordinador -->
                        <div class="card bg-light mb-3">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <strong>Feria:</strong> {{ feriaAsistencia.nombre }}<br>
                                        <small class="text-muted">
                                            {{ formatDate(feriaAsistencia.fecha_inicio) }} - {{
                                            formatDate(feriaAsistencia.fecha_fin) }}
                                        </small>
                                    </div>
                                    <div class="col-md-6">
                                        <strong>Coordinador:</strong>
                                        {{ feriaAsistencia.coordinador?.nombre || 'Sin asignar' }}<br>
                                        <small class="text-muted" v-if="feriaAsistencia.coordinador">
                                            {{ feriaAsistencia.coordinador.telefono || feriaAsistencia.coordinador.email
                                            }}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Lista de días con checkboxes -->
                        <div v-if="feriaAsistencia.coordinador">
                            <h6 class="mb-3">Marcar días de asistencia:</h6>
                            <div class="table-responsive">
                                <table class="table table-sm table-hover">
                                    <thead class="thead-light">
                                        <tr>
                                            <th style="width: 50px">
                                                <input type="checkbox" @change="marcarTodos($event.target.checked)"
                                                    :checked="todosAsistieron" title="Marcar/Desmarcar todos">
                                            </th>
                                            <th>Fecha</th>
                                            <th>Día</th>
                                            <th>Observaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="dia in diasFeria" :key="dia.fecha">
                                            <td class="text-center">
                                                <input type="checkbox" v-model="dia.asistio" class="form-check-input"
                                                    style="width: 20px; height: 20px;">
                                            </td>
                                            <td>{{ formatDate(dia.fecha) }}</td>
                                            <td>
                                                <span class="badge badge-secondary">
                                                    {{ dia.nombreDia }}
                                                </span>
                                            </td>
                                            <td>
                                                <input v-model="dia.observaciones" type="text"
                                                    class="form-control form-control-sm" placeholder="Opcional...">
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- Resumen -->
                            <div class="alert alert-info mt-3">
                                <i class="fas fa-info-circle mr-2"></i>
                                <strong>Días asistidos:</strong> {{ diasAsistidos }} de {{ diasFeria.length }}
                                ({{ porcentajeAsistencia }}%)
                            </div>
                        </div>
                        <div v-else class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            Esta feria no tiene coordinador asignado
                        </div>
                    </div>
                    <div class="modal-footer" v-if="feriaAsistencia?.coordinador">
                        <button type="button" class="btn btn-secondary" @click="modalAsistencia = false">
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-primary" @click="guardarAsistencias">
                            <i class="fas fa-save mr-1"></i>
                            Guardar Asistencias
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="modalAsistencia" class="modal-backdrop fade show"></div>

        <!-- Modal Balance Financiero -->
        <div class="modal fade" :class="{ show: modalBalance }" :style="{ display: modalBalance ? 'block' : 'none' }"
            tabindex="-1">
            <div class="modal-dialog modal-xl modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-chart-line mr-2"></i>
                            Balance Financiero - {{ feriaBalance?.nombre }}
                        </h5>
                        <button type="button" class="close" @click="modalBalance = false">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" v-if="feriaBalance">
                        <!-- Resumen General -->
                        <div class="row mb-4">
                            <div class="col-md-3">
                                <div class="card bg-primary text-white">
                                    <div class="card-body">
                                        <div class="d-flex align-items-center">
                                            <div class="flex-grow-1">
                                                <h6 class="mb-0">Ingresos Totales</h6>
                                                <h3 class="mb-0">{{ feriaBalance.moneda }} ${{ formatNumber(balanceData.ingresosTotales) }}</h3>
                                            </div>
                                            <div>
                                                <i class="fas fa-dollar-sign fa-3x opacity-50"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card bg-success text-white">
                                    <div class="card-body">
                                        <div class="d-flex align-items-center">
                                            <div class="flex-grow-1">
                                                <h6 class="mb-0">Pagado</h6>
                                                <h3 class="mb-0">{{ feriaBalance.moneda }} ${{ formatNumber(balanceData.totalPagado) }}</h3>
                                            </div>
                                            <div>
                                                <i class="fas fa-check-circle fa-3x opacity-50"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card bg-warning text-white">
                                    <div class="card-body">
                                        <div class="d-flex align-items-center">
                                            <div class="flex-grow-1">
                                                <h6 class="mb-0">Por Cobrar</h6>
                                                <h3 class="mb-0">{{ feriaBalance.moneda }} ${{ formatNumber(balanceData.porCobrar) }}</h3>
                                            </div>
                                            <div>
                                                <i class="fas fa-clock fa-3x opacity-50"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card bg-danger text-white">
                                    <div class="card-body">
                                        <div class="d-flex align-items-center">
                                            <div class="flex-grow-1">
                                                <h6 class="mb-0">Gastos Totales</h6>
                                                <h3 class="mb-0">{{ feriaBalance.moneda }} ${{ formatNumber(balanceData.gastosTotales) }}</h3>
                                            </div>
                                            <div>
                                                <i class="fas fa-shopping-cart fa-3x opacity-50"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Balance Neto -->
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <div class="card" :class="balanceData.balanceNeto >= 0 ? 'border-success' : 'border-danger'">
                                    <div class="card-body text-center">
                                        <h5>Balance Neto (Ingresos - Gastos)</h5>
                                        <h2 :class="balanceData.balanceNeto >= 0 ? 'text-success' : 'text-danger'">
                                            {{ feriaBalance.moneda }} ${{ formatNumber(balanceData.balanceNeto) }}
                                        </h2>
                                        <small class="text-muted">
                                            {{ balanceData.balanceNeto >= 0 ? 'Ganancia' : 'Pérdida' }}
                                        </small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card border-info">
                                    <div class="card-body text-center">
                                        <h5>Tasa de Cobro</h5>
                                        <h2 class="text-info">{{ balanceData.tasaCobro }}%</h2>
                                        <div class="progress" style="height: 25px;">
                                            <div class="progress-bar bg-info" :style="{ width: balanceData.tasaCobro + '%' }">
                                                {{ balanceData.tasaCobro }}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tabs -->
                        <ul class="nav nav-tabs" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active" data-toggle="tab" href="#ingresos-tab">
                                    <i class="fas fa-arrow-up mr-1"></i> Ingresos
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" data-toggle="tab" href="#gastos-tab">
                                    <i class="fas fa-arrow-down mr-1"></i> Gastos
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" data-toggle="tab" href="#morosidad-tab">
                                    <i class="fas fa-exclamation-triangle mr-1"></i> Morosidad
                                </a>
                            </li>
                        </ul>

                        <div class="tab-content mt-3">
                            <!-- Tab Ingresos -->
                            <div id="ingresos-tab" class="tab-pane fade show active">
                                <table class="table table-sm table-hover">
                                    <thead class="thead-light">
                                        <tr>
                                            <th>Emprendimiento</th>
                                            <th>Puesto</th>
                                            <th class="text-right">Total</th>
                                            <th class="text-right">Descuento</th>
                                            <th class="text-right">Subtotal</th>
                                            <th class="text-right">Pagado</th>
                                            <th class="text-right">Pendiente</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="part in balanceData.participaciones" :key="part.id">
                                            <td>{{ obtenerNombreEmprendimiento(part.emprendimiento_id) }}</td>
                                            <td>{{ part.numero_puesto }}</td>
                                            <td class="text-right">${{ formatNumber(part.total) }}</td>
                                            <td class="text-right text-info">{{ part.descuento }}%</td>
                                            <td class="text-right"><strong>${{ formatNumber(part.subtotal) }}</strong></td>
                                            <td class="text-right text-success">${{ formatNumber(part.pagado) }}</td>
                                            <td class="text-right text-warning">${{ formatNumber(part.pendiente) }}</td>
                                            <td>
                                                <span class="badge" :class="getBadgeEstadoPago(part)">
                                                    {{ getEstadoPago(part) }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot class="font-weight-bold">
                                        <tr>
                                            <td colspan="4" class="text-right">TOTALES:</td>
                                            <td class="text-right">${{ formatNumber(balanceData.ingresosTotales) }}</td>
                                            <td class="text-right text-success">${{ formatNumber(balanceData.totalPagado) }}</td>
                                            <td class="text-right text-warning">${{ formatNumber(balanceData.porCobrar) }}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <!-- Tab Gastos -->
                            <div id="gastos-tab" class="tab-pane fade">
                                <table class="table table-sm table-hover">
                                    <thead class="thead-light">
                                        <tr>
                                            <th>Categoría</th>
                                            <th>Descripción</th>
                                            <th class="text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="gasto in balanceData.gastos" :key="gasto.id">
                                            <td><span class="badge badge-secondary">{{ gasto.categoria }}</span></td>
                                            <td>{{ gasto.descripcion || '-' }}</td>
                                            <td class="text-right text-danger">${{ formatNumber(gasto.monto) }}</td>
                                        </tr>
                                        <tr v-if="balanceData.gastos.length === 0">
                                            <td colspan="3" class="text-center text-muted">No hay gastos registrados</td>
                                        </tr>
                                    </tbody>
                                    <tfoot class="font-weight-bold">
                                        <tr>
                                            <td colspan="2" class="text-right">TOTAL GASTOS:</td>
                                            <td class="text-right text-danger">${{ formatNumber(balanceData.gastosTotales) }}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <!-- Tab Morosidad -->
                            <div id="morosidad-tab" class="tab-pane fade">
                                <div class="alert alert-warning">
                                    <i class="fas fa-exclamation-triangle mr-2"></i>
                                    <strong>{{ balanceData.emprendimientosMorosos.length }}</strong> emprendimiento(s) con pagos pendientes
                                </div>
                                <table class="table table-sm table-hover">
                                    <thead class="thead-light">
                                        <tr>
                                            <th>Emprendimiento</th>
                                            <th>Contacto</th>
                                            <th class="text-right">Total Adeudado</th>
                                            <th class="text-right">% Pagado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="moroso in balanceData.emprendimientosMorosos" :key="moroso.id">
                                            <td>{{ moroso.nombre }}</td>
                                            <td>
                                                <small>
                                                    <i class="fas fa-envelope mr-1"></i>{{ moroso.correo }}<br>
                                                    <i class="fas fa-phone mr-1"></i>{{ moroso.telefono }}
                                                </small>
                                            </td>
                                            <td class="text-right text-danger">
                                                <strong>${{ formatNumber(moroso.adeudo) }}</strong>
                                            </td>
                                            <td class="text-right">
                                                <div class="progress" style="height: 20px;">
                                                    <div class="progress-bar" :class="moroso.porcentajePagado >= 50 ? 'bg-success' : 'bg-danger'"
                                                        :style="{ width: moroso.porcentajePagado + '%' }">
                                                        {{ moroso.porcentajePagado }}%
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr v-if="balanceData.emprendimientosMorosos.length === 0">
                                            <td colspan="4" class="text-center text-success">
                                                <i class="fas fa-check-circle mr-2"></i>
                                                ¡Todos los pagos están al día!
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="modalBalance = false">
                            Cerrar
                        </button>
                        <button type="button" class="btn btn-primary" @click="exportarBalance">
                            <i class="fas fa-download mr-1"></i>
                            Exportar a Excel
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="modalBalance" class="modal-backdrop fade show"></div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCentrosStore } from '../stores/centros'
import { useEmprendimientosStore } from '../stores/emprendimientos'
import { useFeriasStore, ESTADOS_FERIA } from '../stores/ferias'
import { useParticipacionesStore } from '../stores/participaciones'
import { useAbonosStore } from '../stores/abonos'
import { useCoordinadoresStore } from '../stores/coordinadores'
import FairDetailsModal from '../components/fairs/FairDetailsModal.vue'

const centrosStore = useCentrosStore()
const emprendimientosStore = useEmprendimientosStore()
const feriasStore = useFeriasStore()
const participacionesStore = useParticipacionesStore()
const abonosStore = useAbonosStore()
const coordinadoresStore = useCoordinadoresStore()

// Cargar coordinadores al inicio
onMounted(async () => {
    try {
        await coordinadoresStore.cargarCoordinadores()
    } catch (error) {
        console.error('Error cargando coordinadores:', error)
    }
})

const mostrarFormularioFeria = ref(false)
const editandoFeria = ref(false)
const zonasDisponibles = ref([])
const modalDetalle = ref(false)
const feriaActual = ref(null)
const participacionesActuales = ref([])
const mostrarFormularioParticipacion = ref(false)
const modalAbonos = ref(false)
const participacionActual = ref(null)
const abonosActuales = ref([])
const filtroEstado = ref('')
const modalAsistencia = ref(false)
const feriaAsistencia = ref(null)
const diasFeria = ref([])
const modalBalance = ref(false)
const feriaBalance = ref(null)
const balanceData = ref({
    ingresosTotales: 0,
    totalPagado: 0,
    porCobrar: 0,
    gastosTotales: 0,
    balanceNeto: 0,
    tasaCobro: 0,
    participaciones: [],
    gastos: [],
    emprendimientosMorosos: []
})

const formularioFeria = reactive({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    centroComercialId: '',
    zonaId: '',
    coordinadorId: '',
    limitePuestos: 50,
    precioBasePuesto: 0,
    moneda: 'CLP'
})

// Computed properties para estadísticas
const feriasActivas = computed(() => {
    return feriasStore.ferias.filter(f => f.estado === 'En Curso' || f.estado === 'Montada').length
})

const feriasPlanificadas = computed(() => {
    return feriasStore.ferias.filter(f => f.estado === 'Planificada').length
})

const totalParticipaciones = computed(() => {
    return participacionesStore.participaciones.length
})


const feriasFiltradas = computed(() => {
    if (!filtroEstado.value) {
        return feriasStore.ferias
    }
    return feriasStore.ferias.filter(f => f.estado === filtroEstado.value)
})

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

const formularioParticipacion = reactive({
    emprendimientoId: '',
    numeroPuesto: '',
    descuento: 0,
    mobiliario: {
        estanteNegro: false,
        perchero: false,
        repisaSobreMesa: false,
        silla: false
    }
})

const formularioAbono = reactive({
    fecha: new Date().toISOString().split('T')[0],
    monto: 0,
    banco: '',
    numeroOperacion: '',
    notas: '',
    archivoComprobante: null
})

const subiendoComprobante = ref(false)

function cargarZonas() {
    if (formularioFeria.centroComercialId) {
        zonasDisponibles.value = centrosStore.obtenerZonasPorCentro(formularioFeria.centroComercialId)
    } else {
        zonasDisponibles.value = []
    }
}

function guardarFeria() {
    if (editandoFeria.value) {
        feriasStore.actualizarFeria(formularioFeria.id, formularioFeria)
    } else {
        feriasStore.agregarFeria(formularioFeria)
    }
    cancelarFormularioFeria()
}

function cancelarFormularioFeria() {
    Object.assign(formularioFeria, {
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        centroComercialId: '',
        zonaId: '',
        limitePuestos: 50,
        precioBasePuesto: 0,
        moneda: 'CLP'
    })
    mostrarFormularioFeria.value = false
    editandoFeria.value = false
}

function editarFeria(feria) {
    Object.assign(formularioFeria, {
        id: feria.id,
        nombre: feria.nombre,
        fechaInicio: feria.fecha_inicio,
        fechaFin: feria.fecha_fin,
        centroComercialId: feria.centro_comercial_id,
        zonaId: feria.zona_id,
        coordinadorId: feria.coordinador_id || '',
        limitePuestos: feria.limite_puestos,
        precioBasePuesto: feria.precio_base_puesto,
        moneda: feria.moneda
    })
    cargarZonas()
    editandoFeria.value = true
    mostrarFormularioFeria.value = true
}

function eliminarFeria(id) {
    if (confirm('¿Estás seguro de eliminar esta feria?')) {
        feriasStore.eliminarFeria(id)
    }
}

async function verDetalleFeria(feria) {
    feriaActual.value = feria
    // Cargar participaciones desde BD
    await participacionesStore.cargarParticipaciones()
    participacionesActuales.value = participacionesStore.obtenerPorFeria(feria.id)
    modalDetalle.value = true
}

function cerrarModalDetalle() {
    modalDetalle.value = false
    feriaActual.value = null
    participacionesActuales.value = []
    mostrarFormularioParticipacion.value = false
}

function alSeleccionarEmprendimiento() {
    if (!formularioParticipacion.emprendimientoId) return

    // Auto-generar número de puesto
    const zona = obtenerNombreZona(feriaActual.value.centro_comercial_id, feriaActual.value.zona_id)
    const numero = participacionesActuales.value.length + 1
    formularioParticipacion.numeroPuesto = `${zona}_${numero.toString().padStart(2, '0')}`
}

function guardarParticipacion() {
    const precioNeto = feriaActual.value.precio_base_puesto
    const descuento = formularioParticipacion.descuento || 0
    const netoConDescuento = precioNeto - (precioNeto * descuento / 100)
    const iva = netoConDescuento * 0.19
    const total = netoConDescuento + iva

    const participacion = participacionesStore.agregarParticipacion({
        feriaId: feriaActual.value.id,
        emprendimientoId: formularioParticipacion.emprendimientoId,
        numeroPuesto: formularioParticipacion.numeroPuesto,
        descuento: formularioParticipacion.descuento,
        mobiliario: { ...formularioParticipacion.mobiliario },
        precioNeto: Math.round(precioNeto),
        iva: Math.round(iva),
        total: Math.round(total),
        montoFinal: Math.round(total)
    })

    participacionesActuales.value = participacionesStore.obtenerPorFeria(feriaActual.value.id)
    cancelarFormularioParticipacion()
}

// Handler for new modal component
async function handleAddParticipation(data) {
    try {
        await participacionesStore.agregarParticipacion(data)
        // Reload participations
        participacionesActuales.value = participacionesStore.obtenerPorFeria(feriaActual.value.id)
    } catch (error) {
        console.error('Error adding participation:', error)
    }
}

function cancelarFormularioParticipacion() {
    Object.assign(formularioParticipacion, {
        emprendimientoId: '',
        numeroPuesto: '',
        descuento: 0,
        mobiliario: {
            estanteNegro: false,
            perchero: false,
            repisaSobreMesa: false,
            silla: false
        }
    })
    mostrarFormularioParticipacion.value = false
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

        // 1. Registrar abono
        const abono = await abonosStore.registrarAbono({
            participacionId: participacionActual.value.id,
            fecha: formularioAbono.fecha,
            monto: formularioAbono.monto,
            banco: formularioAbono.banco,
            numeroOperacion: formularioAbono.numeroOperacion,
            notas: formularioAbono.notas
        })

        // 2. Si hay comprobante, subirlo
        if (formularioAbono.archivoComprobante && abono) {
            await abonosStore.subirComprobante(abono.id, formularioAbono.archivoComprobante)
        }

        // 3. Recargar datos
        participacionActual.value = participacionesStore.obtenerPorId(participacionActual.value.id)
        participacionesActuales.value = participacionesStore.obtenerPorFeria(feriaActual.value.id)
        abonosActuales.value = abonosStore.obtenerPorParticipacion(participacionActual.value.id)

        // 4. Limpiar formulario
        formularioAbono.monto = 0
        formularioAbono.banco = ''
        formularioAbono.numeroOperacion = ''
        formularioAbono.notas = ''
        formularioAbono.archivoComprobante = null

        // Limpiar input file
        const fileInput = document.querySelector('input[type="file"]')
        if (fileInput) fileInput.value = ''

    } catch (error) {
        console.error('Error guardando abono:', error)
        alert('Error al guardar el abono: ' + error.message)
    } finally {
        subiendoComprobante.value = false
    }
}

function obtenerNombreCentro(centroId) {
    const centro = centrosStore.obtenerPorId(centroId)
    return centro?.nombre || 'N/A'
}

function obtenerNombreZona(centroId, zonaId) {
    const zonas = centrosStore.obtenerZonasPorCentro(centroId)
    const zona = zonas.find(z => z.id === zonaId)
    return zona?.nombre || 'Zona'
}

function obtenerNombreEmprendimiento(empId) {
    const emp = emprendimientosStore.obtenerPorId(empId)
    return emp?.nombre_emprendimiento || 'N/A'
}

function obtenerParticipaciones(feriaId) {
    return participacionesStore.obtenerPorFeria(feriaId)
}

function calcularPorcentajeOcupacion(feria) {
    const participaciones = obtenerParticipaciones(feria.id).length
    return Math.round((participaciones / feria.limite_puestos) * 100)
}

function calcularIngresosFeria(feriaId) {
    const participaciones = participacionesStore.obtenerPorFeria(feriaId)
    return participaciones.reduce((total, part) => total + (part.monto_final || 0), 0)
}

function getBadgeEstado(estado) {
    const badges = {
        'Planificada': 'badge-info',
        'Montada': 'badge-warning',
        'En Curso': 'badge-success',
        'Desmontada': 'badge-secondary',
        'Cancelada': 'badge-danger'
    }
    return badges[estado] || 'bg-secondary'
}

function formatDate(dateString) {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatNumber(num) {
    return new Intl.NumberFormat('es-CL').format(num || 0)
}

// ===== FUNCIONES DE BALANCE FINANCIERO =====
async function abrirBalanceFinanciero(feria) {
    feriaBalance.value = feria
    modalBalance.value = true
    
    // Calcular balance
    await calcularBalance(feria)
}

async function calcularBalance(feria) {
    try {
        // Cargar participaciones de la feria
        await participacionesStore.cargarParticipaciones()
        await abonosStore.cargarAbonos()
        
        const participaciones = participacionesStore.participaciones.filter(
            p => p.feria_id === feria.id && !p.deleted_at
        )
        
        // Calcular datos por participación
        const participacionesConDatos = participaciones.map(part => {
            const total = feria.precio_base_puesto || 0
            const descuentoMonto = (total * (part.descuento || 0)) / 100
            const subtotal = total - descuentoMonto
            
            const abonosPart = abonosStore.abonos.filter(a => a.participacion_id === part.id)
            const pagado = abonosPart.reduce((sum, a) => sum + parseFloat(a.monto || 0), 0)
            const pendiente = Math.max(0, subtotal - pagado)
            
            return {
                ...part,
                total,
                subtotal,
                pagado,
                pendiente
            }
        })
        
        // Calcular totales
        const ingresosTotales = participacionesConDatos.reduce((sum, p) => sum + p.subtotal, 0)
        const totalPagado = participacionesConDatos.reduce((sum, p) => sum + p.pagado, 0)
        const porCobrar = participacionesConDatos.reduce((sum, p) => sum + p.pendiente, 0)
        const gastosTotales = feriasStore.calcularTotalGastos(feria.id)
        const balanceNeto = totalPagado - gastosTotales
        const tasaCobro = ingresosTotales > 0 ? Math.round((totalPagado / ingresosTotales) * 100) : 0
        
        // Emprendimientos morosos
        const morosos = participacionesConDatos
            .filter(p => p.pendiente > 0)
            .map(p => {
                const emp = emprendimientosStore.obtenerPorId(p.emprendimiento_id)
                return {
                    id: emp?.id,
                    nombre: emp?.nombre_emprendimiento || 'N/A',
                    correo: emp?.correo || 'N/A',
                    telefono: emp?.telefono || 'N/A',
                    adeudo: p.pendiente,
                    porcentajePagado: Math.round((p.pagado / p.subtotal) * 100)
                }
            })
        
        balanceData.value = {
            ingresosTotales,
            totalPagado,
            porCobrar,
            gastosTotales,
            balanceNeto,
            tasaCobro,
            participaciones: participacionesConDatos,
            gastos: feria.gastos || [],
            emprendimientosMorosos: morosos
        }
    } catch (error) {
        console.error('Error calculando balance:', error)
        alert('Error al calcular balance: ' + error.message)
    }
}

function getEstadoPago(participacion) {
    if (participacion.pendiente === 0) return 'Pagado'
    if (participacion.pagado === 0) return 'Pendiente'
    return 'Parcial'
}

function getBadgeEstadoPago(participacion) {
    const estado = getEstadoPago(participacion)
    const badges = {
        'Pagado': 'badge-success',
        'Parcial': 'badge-warning',
        'Pendiente': 'badge-danger'
    }
    return badges[estado] || 'badge-secondary'
}

function exportarBalance() {
    alert('Funcionalidad de exportación a Excel en desarrollo')
    // TODO: Implementar exportación a Excel
}

// ===== FUNCIONES DE ASISTENCIA =====
async function abrirModalAsistencia(feria) {
    if (!feria.coordinador_id) {
        alert('Esta feria no tiene coordinador asignado')
        return
    }

    feriaAsistencia.value = feria
    modalAsistencia.value = true

    // Generar todos los días entre fecha_inicio y fecha_fin
    generarDiasFeria(feria)

    // Cargar asistencias existentes
    try {
        const asistencias = await feriasStore.cargarAsistencias(feria.id)

        // Marcar los días que ya tienen asistencia
        asistencias.forEach(asist => {
            const dia = diasFeria.value.find(d => d.fecha === asist.fecha)
            if (dia) {
                dia.asistio = asist.asistio
                dia.observaciones = asist.observaciones || ''
            }
        })
    } catch (error) {
        console.error('Error cargando asistencias:', error)
    }
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
            nombreDia: nombresDias[fechaActual.getDay()],
            asistio: false,
            observaciones: ''
        })
        fechaActual.setDate(fechaActual.getDate() + 1)
    }

    diasFeria.value = dias
}

function marcarTodos(asistio) {
    diasFeria.value.forEach(dia => {
        dia.asistio = asistio
    })
}

async function guardarAsistencias() {
    try {
        const asistencias = diasFeria.value.map(dia => ({
            feria_id: feriaAsistencia.value.id,
            coordinador_id: feriaAsistencia.value.coordinador_id,
            fecha: dia.fecha,
            asistio: dia.asistio,
            observaciones: dia.observaciones || null
        }))

        await feriasStore.guardarAsistenciasMultiples(asistencias)

        modalAsistencia.value = false
        alert('Asistencias guardadas correctamente')
    } catch (error) {
        alert('Error al guardar asistencias: ' + error.message)
    }
}

</script>

<style scoped>
/* Modal extra grande personalizado */
.modal-xl {
    max-width: 1200px;
}

@media (min-width: 1400px) {
    .modal-xl {
        max-width: 1320px;
    }
}

/* Mejorar visualización de tablas en modales */
.modal-body table {
    font-size: 0.9rem;
}

.modal-body .table th {
    background-color: #f8fafc;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
}

/* Tarjetas de métricas */
.card .opacity-50 {
    opacity: 0.5;
}

/* Tabs personalizados */
.nav-tabs .nav-link {
    color: #6c757d;
}

.nav-tabs .nav-link.active {
    color: #495057;
    font-weight: 600;
}
</style>

