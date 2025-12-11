<template>
  <div v-if="visible && fair" class="modal fade show" style="display: block;" @click.self="$emit('close')">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <!-- Header - Minimalist -->
        <div class="modal-header">
          <div class="flex-grow-1">
            <h5 class="modal-title mb-1">{{ fair.nombre }}</h5>
            <div class="text-muted small">
              {{ getMallName(fair.centro_comercial_id) }} •
              {{ formatDate(fair.fecha_inicio) }} - {{ formatDate(fair.fecha_fin) }}
            </div>
          </div>
          <button type="button" class="close" @click="$emit('close')">
            <span>&times;</span>
          </button>
        </div>

        <!-- Summary Stats - Minimalist -->
        <div class="modal-body">
          <div class="stats-grid mb-4">
            <div class="stat-item">
              <div class="stat-label">Ocupación</div>
              <div class="stat-value">{{ currentParticipations.length }} / {{ fair.limite_puestos }}</div>
              <div class="stat-bar">
                <div class="stat-bar-fill" :style="{ width: occupancyPercentage + '%' }"></div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-label">Ingresos</div>
              <div class="stat-value">${{ formatNumber(totalIncome) }}</div>
            </div>

            <div class="stat-item">
              <div class="stat-label">Precio Base</div>
              <div class="stat-value">${{ formatNumber(fair.precio_base_puesto) }}</div>
            </div>

            <div class="stat-item">
              <div class="stat-label">Estado</div>
              <div class="stat-value">
                <span class="status-badge" :class="'status-' + fair.estado.toLowerCase().replace(' ', '-')">
                  {{ fair.estado }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="mb-0">Emprendimientos</h6>
            <div>
              <button @click="showAddForm = true" class="btn btn-sm btn-outline-primary mr-2"
                :disabled="currentParticipations.length >= fair.limite_puestos">
                <i class="fas fa-plus mr-1"></i>
                Asignar
              </button>
              <button @click="$emit('open-balance', fair)" class="btn btn-sm btn-outline-secondary">
                <i class="fas fa-chart-line mr-1"></i>
                Balance
              </button>
            </div>
          </div>

          <!-- Add Form - Minimalist -->
          <div v-if="showAddForm" class="add-form mb-4">
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Emprendimiento <span class="text-danger">*</span></label>
                  <select v-model="form.emprendimientoId" @change="onBusinessSelect"
                    class="form-control form-control-sm" required>
                    <option value="">Seleccionar...</option>
                    <option v-for="business in availableBusinesses" :key="business.id" :value="business.id">
                      {{ business.nombre_emprendimiento }} - {{ business.nombre_emprendedor }}
                    </option>
                  </select>
                </div>

                <div class="col-md-3 mb-3">
                  <label class="form-label">Puesto</label>
                  <input v-model="form.numeroPuesto" type="text" class="form-control form-control-sm" readonly />
                </div>

                <div class="col-md-3 mb-3">
                  <label class="form-label">Descuento (%)</label>
                  <input v-model.number="form.descuento" type="number" class="form-control form-control-sm" min="0"
                    max="100" @input="calculatePrices" />
                </div>
              </div>

              <!-- Mobiliario Section -->
              <div class="mb-3">
                <label class="form-label d-block mb-2">
                  <i class="fas fa-chair mr-1"></i>
                  Mobiliario
                </label>
                <div class="row">
                  <div v-for="item in itemsMobiliario" :key="item.id" class="col-md-6 mb-2">
                    <div class="d-flex align-items-center">
                      <div class="custom-control custom-checkbox">
                        <input type="checkbox" class="custom-control-input" :id="'mob-' + item.id"
                          v-model="form.mobiliarioSeleccionado[item.id]" @change="calculatePrices" />
                        <label class="custom-control-label" :for="'mob-' + item.id">
                          {{ item.nombre }}
                          <small class="text-muted">(+${{ formatNumber(item.precio) }})</small>
                        </label>
                      </div>
                      <input v-if="form.mobiliarioSeleccionado[item.id]"
                        v-model.number="form.mobiliarioCantidad[item.id]" type="number"
                        class="form-control form-control-sm ml-2" style="width: 70px;" min="1" max="10"
                        @input="calculatePrices" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Price Summary - Minimalist -->
              <div class="price-summary mb-3">
                <div class="price-row">
                  <span>Base:</span>
                  <span>${{ formatNumber(priceCalculation.basePrice) }}</span>
                </div>
                <div class="price-row" v-if="form.descuento > 0">
                  <span>Descuento ({{ form.descuento }}%):</span>
                  <span class="text-danger">-${{ formatNumber(priceCalculation.discount) }}</span>
                </div>
                <div class="price-row" v-if="priceCalculation.mobiliarioCargo > 0">
                  <span>Mobiliario:</span>
                  <span class="text-primary">+${{ formatNumber(priceCalculation.mobiliarioCargo) }}</span>
                </div>
                <div class="price-row">
                  <span>IVA (19%):</span>
                  <span>${{ formatNumber(priceCalculation.tax) }}</span>
                </div>
                <div class="price-row price-total">
                  <span>Total:</span>
                  <span>${{ formatNumber(priceCalculation.total) }}</span>
                </div>
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-sm btn-primary" :disabled="isSubmitting">
                  {{ isSubmitting ? 'Guardando...' : 'Agregar' }}
                </button>
                <button type="button" @click="cancelForm" class="btn btn-sm btn-outline-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          <!-- Participations Table - Minimalist -->
          <div class="table-responsive">
            <table class="table table-sm table-hover">
              <thead>
                <tr>
                  <th>Puesto</th>
                  <th>Emprendimiento</th>
                  <th class="text-end">Precio Base</th>
                  <th class="text-end">Descuento</th>
                  <th>Mobiliario</th>
                  <th class="text-end">IVA</th>
                  <th class="text-end">Total</th>
                  <th class="text-end">Pagado</th>
                  <th class="text-center">Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="currentParticipations.length === 0">
                  <td colspan="10" class="text-center text-muted py-4">
                    No hay emprendimientos asignados
                  </td>
                </tr>
                <tr v-for="participation in currentParticipations" :key="participation.id">
                  <td>
                    <span class="badge badge-light">{{ participation.numero_puesto }}</span>
                  </td>
                  <td>
                    <div class="fw-500">{{ getBusinessName(participation.emprendimiento_id) }}</div>
                    <small class="text-muted">{{ getBusinessOwner(participation.emprendimiento_id) }}</small>
                  </td>
                  <td class="text-end">
                    <small>${{ formatNumber(participation.precio_base) }}</small>
                  </td>
                  <td class="text-end">
                    <small class="text-danger" v-if="participation.descuento_monto > 0">
                      -${{ formatNumber(participation.descuento_monto) }}
                      <span class="text-muted">({{ participation.descuento_porcentaje }}%)</span>
                    </small>
                    <small class="text-muted" v-else>-</small>
                  </td>
                  <td>
                    <div v-if="participation.mobiliario && participation.mobiliario.length > 0">
                      <small class="text-muted d-block" v-for="mob in participation.mobiliario" :key="mob.id">
                        <i class="fas fa-chair text-primary" style="font-size: 0.7rem;"></i>
                        {{ mob.item?.nombre }} ({{ mob.cantidad }})
                      </small>
                      <small class="text-primary fw-500 d-block mt-1">
                        +${{ formatNumber(participation.cargo_mobiliario) }}
                      </small>
                    </div>
                    <small class="text-muted" v-else>-</small>
                  </td>
                  <td class="text-end">
                    <small>${{ formatNumber(participation.iva) }}</small>
                  </td>
                  <td class="text-end fw-500">
                    ${{ formatNumber(participation.monto_final) }}
                  </td>
                  <td class="text-end text-success">
                    ${{ formatNumber(participation.monto_pagado) }}
                  </td>
                  <td class="text-center">
                    <span class="status-badge" :class="'status-' + participation.estado_pago.toLowerCase()">
                      {{ participation.estado_pago }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="btn-group">
                      <button @click="openManageParticipation(participation)"
                        class="btn btn-sm btn-link text-primary p-0" title="Gestionar Participación">
                        <i class="fas fa-cog"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-sm btn-secondary" @click="$emit('close')">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="visible" class="modal-backdrop fade show"></div>

  <!-- Modal Gestión Completa de Participación -->
  <ParticipationManagementModal :visible="showManageModal" :participation="selectedParticipation" :fairId="fair?.id"
    :mallId="fair?.centro_comercial_id" :fairData="fairDataForManagement"
    :entrepreneurName="getBusinessName(selectedParticipation?.emprendimiento_id)" :furniture="itemsMobiliario"
    @close="closeManageParticipation" @updated="handleParticipationUpdated" />
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch, onMounted } from 'vue';
import { useParticipacionesStore } from '../../stores/participaciones';
import ParticipationManagementModal from './ParticipationManagementModal.vue';

const participacionesStore = useParticipacionesStore();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  fair: {
    type: Object,
    default: null,
  },
  participations: {
    type: Array,
    default: () => [],
  },
  businesses: {
    type: Array,
    default: () => [],
  },
  malls: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'add-participation', 'manage-payments', 'open-balance']);

const showAddForm = ref(false);
const showManageModal = ref(false);
const selectedParticipation = ref(null);
const isSubmitting = ref(false);

const form = ref({
  emprendimientoId: '',
  numeroPuesto: '',
  descuento: 0,
  mobiliarioSeleccionado: {},
  mobiliarioCantidad: {},
});



const itemsMobiliario = computed(() => participacionesStore.itemsMobiliario);

const currentParticipations = computed(() => {
  if (!props.fair) return [];
  return props.participations.filter((p) => p.feria_id === props.fair.id && !p.deleted_at);
});

const availableBusinesses = computed(() => {
  const assignedIds = currentParticipations.value.map((p) => p.emprendimiento_id);
  return props.businesses.filter((b) => !assignedIds.includes(b.id) && !b.deleted_at);
});

const occupancyPercentage = computed(() => {
  if (!props.fair) return 0;
  return Math.round((currentParticipations.value.length / props.fair.limite_puestos) * 100);
});

const totalIncome = computed(() => {
  return currentParticipations.value.reduce((sum, p) => sum + (p.monto_pagado || 0), 0);
});

const priceCalculation = computed(() => {
  if (!props.fair) return { basePrice: 0, discount: 0, mobiliarioCargo: 0, tax: 0, total: 0 };

  const basePrice = props.fair.precio_base_puesto || 0;
  const discount = (basePrice * form.value.descuento) / 100;

  // Calcular cargo de mobiliario
  let mobiliarioCargo = 0;
  Object.keys(form.value.mobiliarioSeleccionado).forEach(itemId => {
    if (form.value.mobiliarioSeleccionado[itemId]) {
      const item = itemsMobiliario.value.find(m => m.id === itemId);
      if (item) {
        const cantidad = form.value.mobiliarioCantidad[itemId] || 1;
        mobiliarioCargo += item.precio * cantidad;
      }
    }
  });

  const subtotal = basePrice - discount + mobiliarioCargo;
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  return {
    basePrice,
    discount,
    mobiliarioCargo,
    tax,
    total,
  };
});

// Fair data for management modal
const fairDataForManagement = computed(() => {
  if (!props.fair) return null;

  const fairDate = new Date(props.fair.fecha_inicio);
  const year = fairDate.getFullYear();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const month = monthNames[fairDate.getMonth()];

  return {
    year,
    mallName: getMallName(props.fair.centro_comercial_id),
    fairName: props.fair.nombre,
    month,
    precio_base: props.fair.precio_base_puesto
  };
});



function onBusinessSelect() {
  const nextNumber = currentParticipations.value.length + 1;
  form.value.numeroPuesto = `P${String(nextNumber).padStart(3, '0')}`;
}

function calculatePrices() {
  // Trigger reactivity
}



function openManageParticipation(participation) {
  selectedParticipation.value = participation;
  showManageModal.value = true;
}

function closeManageParticipation() {
  showManageModal.value = false;
  selectedParticipation.value = null;
}

function handleParticipationUpdated() {
  // Recargar participaciones
  emit('add-participation'); // Esto trigger la recarga en el componente padre
}

function handleSubmit() {
  isSubmitting.value = true;

  // Preparar items de mobiliario seleccionados
  const mobiliarioItems = [];
  Object.keys(form.value.mobiliarioSeleccionado).forEach(itemId => {
    if (form.value.mobiliarioSeleccionado[itemId]) {
      mobiliarioItems.push({
        itemId: itemId,
        cantidad: form.value.mobiliarioCantidad[itemId] || 1
      });
    }
  });

  const participationData = {
    feriaId: props.fair.id,
    emprendimientoId: form.value.emprendimientoId,
    numeroPuesto: form.value.numeroPuesto,
    precioBase: props.fair.precio_base_puesto,
    descuento: form.value.descuento,
    descuentoMonto: priceCalculation.value.discount,
    subtotal: props.fair.precio_base_puesto - priceCalculation.value.discount,
    cargoMobiliario: priceCalculation.value.mobiliarioCargo,
    precioNeto: props.fair.precio_base_puesto - priceCalculation.value.discount + priceCalculation.value.mobiliarioCargo,
    iva: priceCalculation.value.tax,
    total: priceCalculation.value.total,
    montoFinal: priceCalculation.value.total,
    mobiliarioItems: mobiliarioItems,
  };

  emit('add-participation', participationData);

  setTimeout(() => {
    isSubmitting.value = false;
    cancelForm();
  }, 500);
}

function cancelForm() {
  showAddForm.value = false;
  form.value = {
    emprendimientoId: '',
    numeroPuesto: '',
    descuento: 0,
    mobiliarioSeleccionado: {},
    mobiliarioCantidad: {},
  };
}

function getMallName(mallId) {
  const mall = props.malls.find((m) => m.id === mallId);
  return mall?.nombre || 'N/A';
}

function getBusinessName(businessId) {
  const business = props.businesses.find((b) => b.id === businessId);
  return business?.nombre_emprendimiento || 'N/A';
}

function getBusinessOwner(businessId) {
  const business = props.businesses.find((b) => b.id === businessId);
  return business?.nombre_emprendedor || '';
}

function getBusinessContact(businessId) {
  const business = props.businesses.find((b) => b.id === businessId);
  return business?.telefono || business?.email || '-';
}

function getMobiliarioText(participation) {
  if (!participation.mobiliario || participation.mobiliario.length === 0) return '-';
  return participation.mobiliario
    .map(m => `${m.item?.nombre} (${m.cantidad})`)
    .join(', ');
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatNumber(value) {
  return new Intl.NumberFormat('es-CL').format(value || 0);
}

onMounted(async () => {
  await participacionesStore.cargarItemsMobiliario();
});

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      showAddForm.value = false;
      cancelForm();
    }
  }
);
</script>

<style scoped>
/* Minimalist Design */
.modal-header {
  border-bottom: 1px solid #e9ecef;
  padding: 1.25rem 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

/* Stats Grid - Minimalist */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #212529;
}

.stat-bar {
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

/* Status Badges - Minimalist */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 12px;
  background: #e9ecef;
  color: #495057;
}

.status-badge.status-planificada {
  background: #cfe2ff;
  color: #084298;
}

.status-badge.status-en-curso {
  background: #d1e7dd;
  color: #0f5132;
}

.status-badge.status-completo {
  background: #d1e7dd;
  color: #0f5132;
}

.status-badge.status-parcial {
  background: #fff3cd;
  color: #664d03;
}

.status-badge.status-pendiente {
  background: #f8d7da;
  color: #842029;
}

/* Add Form - Minimalist */
.add-form {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #007bff;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.25rem;
}

.form-control-sm {
  font-size: 0.875rem;
}

/* Price Summary - Minimalist */
.price-summary {
  padding: 0.75rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 0.875rem;
}

.price-total {
  border-top: 1px solid #dee2e6;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
}

/* Table - Minimalist */
.table {
  font-size: 0.875rem;
  margin-bottom: 0;
}

.table thead th {
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  padding: 0.75rem 0.5rem;
}

.table tbody td {
  padding: 0.75rem 0.5rem;
  vertical-align: middle;
}

.badge-light {
  background: #e9ecef;
  color: #495057;
  font-weight: 500;
}

.fw-500 {
  font-weight: 500;
}

.btn-link {
  text-decoration: none;
}

/* Custom Checkbox Styles */
.custom-control {
  position: relative;
  display: block;
  min-height: 1.5rem;
  padding-left: 1.5rem;
}

.custom-control-input {
  position: absolute;
  left: 0;
  z-index: -1;
  width: 1rem;
  height: 1.25rem;
  opacity: 0;
}

.custom-control-input:checked~.custom-control-label::before {
  color: #fff;
  border-color: #007bff;
  background-color: #007bff;
}

.custom-control-label {
  position: relative;
  margin-bottom: 0;
  vertical-align: top;
  cursor: pointer;
}

.custom-control-label::before {
  position: absolute;
  top: 0.25rem;
  left: -1.5rem;
  display: block;
  width: 1rem;
  height: 1rem;
  pointer-events: none;
  content: "";
  background-color: #fff;
  border: 1px solid #adb5bd;
  border-radius: 0.25rem;
}

.custom-control-label::after {
  position: absolute;
  top: 0.25rem;
  left: -1.5rem;
  display: block;
  width: 1rem;
  height: 1rem;
  content: "";
  background: no-repeat 50% / 50% 50%;
}

.custom-checkbox .custom-control-input:checked~.custom-control-label::after {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3e%3cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z'/%3e%3c/svg%3e");
}


.btn-link:hover {
  text-decoration: none;
  opacity: 0.8;
}

.d-flex.gap-2 {
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
