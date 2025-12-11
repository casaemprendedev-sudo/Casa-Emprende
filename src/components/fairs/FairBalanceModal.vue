<template>
  <div v-if="visible && fair" class="modal fade show" style="display: block;" @click.self="$emit('close')">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <!-- Header Minimalista -->
        <div class="modal-header">
          <div class="header-info">
            <h5 class="modal-title">Balance Financiero</h5>
            <div class="fair-info">
              <span class="fair-name">{{ fair.nombre }}</span>
              <span class="fair-dates">{{ formatDate(fair.fecha_inicio) }} - {{ formatDate(fair.fecha_fin) }}</span>
            </div>
          </div>
          <button type="button" class="btn-close-custom" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- KPIs Principales -->
          <div class="kpi-grid">
            <div class="kpi-card kpi-revenue">
              <div class="kpi-header">
                <i class="fas fa-arrow-circle-down"></i>
                <span>Ingresos</span>
              </div>
              <div class="kpi-amount">${{ formatNumber(totalIncome) }}</div>
              <div class="kpi-meta">
                <span class="progress-text">{{ incomePercentage }}% cobrado</span>
                <div class="kpi-progress">
                  <div class="kpi-progress-bar" :style="{ width: incomePercentage + '%' }"></div>
                </div>
              </div>
              <div class="kpi-detail">de ${{ formatNumber(totalExpected) }} esperado</div>
            </div>

            <div class="kpi-card kpi-expenses">
              <div class="kpi-header">
                <i class="fas fa-arrow-circle-up"></i>
                <span>Gastos</span>
              </div>
              <div class="kpi-amount">${{ formatNumber(totalExpenses) }}</div>
              <div class="kpi-meta">
                <span class="expense-count">{{ expensesList.length }} gastos</span>
              </div>
              <div class="kpi-detail">{{ expensePercentage }}% de ingresos</div>
            </div>

            <div class="kpi-card kpi-pending">
              <div class="kpi-header">
                <i class="fas fa-clock"></i>
                <span>Por Cobrar</span>
              </div>
              <div class="kpi-amount">${{ formatNumber(totalPending) }}</div>
              <div class="kpi-meta">
                <span class="pending-count">{{ pendingCount }} pendientes</span>
              </div>
              <div class="kpi-detail">{{ pendingPercentage }}% del total</div>
            </div>

            <div class="kpi-card kpi-profit" :class="profitClass">
              <div class="kpi-header">
                <i :class="profitIcon"></i>
                <span>Utilidad</span>
              </div>
              <div class="kpi-amount">${{ formatNumber(finalProfit) }}</div>
              <div class="kpi-meta">
                <span :class="profitTextClass">{{ profitStatus }}</span>
              </div>
              <div class="kpi-detail">{{ profitPercentage }}% margen</div>
            </div>
          </div>

          <!-- Navegación por Tabs -->
          <div class="tabs-container">
            <button class="tab-button" :class="{ active: activeTab === 'income' }" @click="activeTab = 'income'">
              <i class="fas fa-store"></i>
              <span>Participaciones</span>
              <span class="tab-badge">{{ currentParticipations.length }}</span>
            </button>
            <button class="tab-button" :class="{ active: activeTab === 'expenses' }" @click="activeTab = 'expenses'">
              <i class="fas fa-receipt"></i>
              <span>Gastos</span>
              <span class="tab-badge">{{ expensesList.length }}</span>
            </button>
            <button class="tab-button" :class="{ active: activeTab === 'documents' }" @click="activeTab = 'documents'">
              <i class="fas fa-file-alt"></i>
              <span>Documentos</span>
            </button>
          </div>

          <!-- Contenido de Tabs -->
          <div class="tab-content">
            <!-- Ingresos Tab -->
            <div class="tab-pane" :class="{ 'active': activeTab === 'income' }" v-show="activeTab === 'income'">
              <div class="income-summary">
                <div class="summary-row">
                  <span class="summary-label">Total esperado:</span>
                  <span class="summary-value total">${{ formatNumber(totalExpected) }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Total cobrado:</span>
                  <span class="summary-value paid">${{ formatNumber(totalIncome) }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Por cobrar:</span>
                  <span class="summary-value pending">${{ formatNumber(totalPending) }}</span>
                </div>
              </div>

              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Puesto</th>
                      <th>Emprendimiento</th>
                      <th class="text-end">Total</th>
                      <th class="text-end">Pagado</th>
                      <th class="text-end">Pendiente</th>
                      <th class="text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="currentParticipations.length === 0">
                      <td colspan="6" class="text-center text-muted py-4">
                        No hay participaciones registradas
                      </td>
                    </tr>
                    <tr v-for="participation in currentParticipations" :key="participation.id">
                      <td class="td-puesto">
                        <span class="puesto-badge">{{ participation.numero_puesto }}</span>
                      </td>
                      <td class="td-emprendimiento">
                        <div class="business-name">{{ getBusinessName(participation.emprendimiento_id) }}</div>
                        <div class="business-owner">{{ getBusinessOwner(participation.emprendimiento_id) }}</div>
                      </td>
                      <td class="text-end td-money total">
                        ${{ formatNumber(participation.monto_final) }}
                      </td>
                      <td class="text-end td-money paid">
                        ${{ formatNumber(participation.monto_pagado) }}
                      </td>
                      <td class="text-end td-money pending">
                        ${{ formatNumber(participation.monto_final - participation.monto_pagado) }}
                      </td>
                      <td class="text-center">
                        <span class="status-badge" :class="'status-' + participation.estado_pago.toLowerCase()">
                          {{ participation.estado_pago }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Gastos Tab -->
            <div class="tab-pane" :class="{ 'active': activeTab === 'expenses' }" v-show="activeTab === 'expenses'">
              <!-- Formulario Simplificado -->
              <div class="expense-form">
                <form @submit.prevent="saveExpense">
                  <div class="row g-3">
                    <div class="col-md-3">
                      <label class="form-label">Categoría</label>
                      <select v-model="expenseForm.categoria" class="form-select" required>
                        <option value="">Seleccionar...</option>
                        <option value="coordinadores">Coordinadores</option>
                        <option value="montaje">Montaje</option>
                        <option value="flete">Flete</option>
                        <option value="otros">Otros</option>
                      </select>
                    </div>
                    <div class="col-md-2">
                      <label class="form-label">Monto</label>
                      <input v-model.number="expenseForm.monto" type="number" class="form-control" min="0"
                        placeholder="0" required />
                    </div>
                    <div class="col-md-2">
                      <label class="form-label">Fecha</label>
                      <input v-model="expenseForm.fecha" type="date" class="form-control" />
                    </div>
                    <div class="col-md-3">
                      <label class="form-label">Descripción</label>
                      <input v-model="expenseForm.descripcion" type="text" class="form-control"
                        placeholder="Detalle..." />
                    </div>
                    <div class="col-md-2 d-flex align-items-end">
                      <button type="submit" class="btn btn-primary w-100" :disabled="isSaving">
                        <i :class="editingExpense ? 'fas fa-check' : 'fas fa-plus'"></i>
                        {{ editingExpense ? 'Actualizar' : 'Agregar' }}
                      </button>
                      <button v-if="editingExpense" type="button" class="btn btn-secondary ms-2" @click="cancelEdit">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <!-- Tabla de Gastos por Categoría -->
              <div class="expenses-by-category">
                <div v-for="category in expenseCategories" :key="category.value" class="category-group"
                  v-show="getExpensesByCategory(category.value).length > 0">
                  <div class="category-header">
                    <div class="category-info">
                      <i :class="category.icon"></i>
                      <span class="category-name">{{ category.label }}</span>
                      <span class="category-count">{{ getExpensesByCategory(category.value).length }}</span>
                    </div>
                    <div class="category-total">${{ formatNumber(getCategoryTotal(category.value)) }}</div>
                  </div>

                  <div class="expense-list">
                    <div v-for="expense in getExpensesByCategory(category.value)" :key="expense.id"
                      class="expense-item">
                      <div class="expense-details">
                        <div class="expense-description">{{ expense.descripcion || 'Sin descripción' }}</div>
                        <div class="expense-date">{{ formatDate(expense.fecha) }}</div>
                      </div>
                      <div class="expense-actions">
                        <div class="expense-amount">${{ formatNumber(expense.monto) }}</div>
                        <button @click="editExpense(expense)" class="btn-icon" title="Editar">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button @click="confirmDeleteExpense(expense.id)" class="btn-icon danger" title="Eliminar">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="expensesList.length === 0" class="empty-state">
                  <i class="fas fa-inbox"></i>
                  <p>No hay gastos registrados</p>
                </div>
              </div>
            </div>

            <!-- Documentos Tab -->
            <div class="tab-pane" :class="{ 'active': activeTab === 'documents' }" v-show="activeTab === 'documents'">
              <FairDocumentUpload v-if="fair" :fairId="fair.id" :mallId="fair.centro_comercial_id" :fairData="{
                year: new Date(fair.fecha_inicio).getFullYear(),
                mallName: getMallName(),
                fairName: fair.nombre,
                month: getMonthName(fair.fecha_inicio)
              }" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="visible" class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useFeriasStore } from '../../stores/ferias';
import FairDocumentUpload from './FairDocumentUpload.vue';

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

const emit = defineEmits(['close', 'refresh', 'view-participation']);

const feriasStore = useFeriasStore();

const activeTab = ref('income');
const editingExpense = ref(null);
const isSaving = ref(false);

const expenseForm = ref({
  categoria: '',
  monto: 0,
  fecha: new Date().toISOString().split('T')[0],
  descripcion: '',
});

// Computed - Participaciones
const currentParticipations = computed(() => {
  if (!props.fair) return [];
  return props.participations.filter((p) => p.feria_id === props.fair.id && !p.deleted_at);
});

// Computed - Gastos
const expensesList = computed(() => {
  if (!props.fair || !props.fair.gastos) return [];
  return props.fair.gastos;
});

// Expense categories data
const expenseCategories = ref([
  { value: 'coordinadores', label: 'Coordinadores', icon: 'fas fa-users' },
  { value: 'montaje', label: 'Montaje', icon: 'fas fa-hammer' },
  { value: 'flete', label: 'Flete', icon: 'fas fa-truck' },
  { value: 'otros', label: 'Otros', icon: 'fas fa-ellipsis-h' }
]);

// Computed - Totales de Ingresos
const totalExpected = computed(() => {
  return currentParticipations.value.reduce((sum, p) => sum + (p.monto_final || 0), 0);
});

const totalIncome = computed(() => {
  return currentParticipations.value.reduce((sum, p) => sum + (p.monto_pagado || 0), 0);
});

const totalPending = computed(() => {
  return totalExpected.value - totalIncome.value;
});

const incomePercentage = computed(() => {
  if (totalExpected.value === 0) return 0;
  return Math.round((totalIncome.value / totalExpected.value) * 100);
});

const pendingPercentage = computed(() => {
  if (totalExpected.value === 0) return 0;
  return Math.round((totalPending.value / totalExpected.value) * 100);
});

const pendingCount = computed(() => {
  return currentParticipations.value.filter(p =>
    (p.monto_final - p.monto_pagado) > 0
  ).length;
});

// Computed - Totales de Gastos
const totalExpenses = computed(() => {
  return expensesList.value.reduce((sum, e) => sum + (e.monto || 0), 0);
});

const expensePercentage = computed(() => {
  if (totalIncome.value === 0) return 0;
  return Math.round((totalExpenses.value / totalIncome.value) * 100);
});

// Computed - Utilidad
const finalProfit = computed(() => {
  return totalIncome.value - totalExpenses.value;
});

const profitPercentage = computed(() => {
  if (totalIncome.value === 0) return 0;
  return Math.round((finalProfit.value / totalIncome.value) * 100);
});

const profitClass = computed(() => {
  if (finalProfit.value > 0) return 'positive';
  if (finalProfit.value < 0) return 'negative';
  return 'neutral';
});

const profitIcon = computed(() => {
  if (finalProfit.value > 0) return 'fas fa-arrow-up';
  if (finalProfit.value < 0) return 'fas fa-arrow-down';
  return 'fas fa-minus';
});

const profitStatus = computed(() => {
  if (finalProfit.value > 0) return 'Ganancia';
  if (finalProfit.value < 0) return 'Pérdida';
  return 'Punto de equilibrio';
});

const profitTextClass = computed(() => {
  if (finalProfit.value > 0) return 'text-success';
  if (finalProfit.value < 0) return 'text-danger';
  return 'text-muted';
});

// Methods
function getExpensesByCategory(category) {
  return expensesList.value.filter(e => e.categoria === category);
}

function getCategoryTotal(category) {
  return getExpensesByCategory(category).reduce((sum, e) => sum + (e.monto || 0), 0);
}

function getBusinessName(businessId) {
  const business = props.businesses.find((b) => b.id === businessId);
  return business?.nombre_emprendimiento || 'N/A';
}

function getBusinessOwner(businessId) {
  const business = props.businesses.find((b) => b.id === businessId);
  return business?.nombre_emprendedor || '';
}

function getCategoryLabel(categoria) {
  const labels = {
    coordinadores: 'Coordinadores',
    montaje: 'Montaje',
    flete: 'Flete',
    otros: 'Otros',
  };
  return labels[categoria] || categoria;
}

function getCategoryBadgeClass(categoria) {
  const classes = {
    coordinadores: 'badge-primary',
    montaje: 'badge-warning',
    flete: 'badge-info',
    otros: 'badge-secondary',
  };
  return classes[categoria] || 'badge-secondary';
}

function getPaymentStatusClass(participation) {
  const estado = participation.estado_pago?.toLowerCase();
  return `status-${estado}`;
}

function getPaymentStatusText(participation) {
  return participation.estado_pago || 'Pendiente';
}

function handleViewParticipation(participation) {
  emit('view-participation', participation);
}

async function saveExpense() {
  if (!props.fair) return;

  isSaving.value = true;
  try {
    if (editingExpense.value) {
      // Actualizar gasto existente
      await feriasStore.actualizarGasto(editingExpense.value.id, {
        categoria: expenseForm.value.categoria,
        descripcion: expenseForm.value.descripcion,
        monto: expenseForm.value.monto,
        fecha: expenseForm.value.fecha,
      });
    } else {
      // Agregar nuevo gasto
      await feriasStore.agregarGasto(props.fair.id, {
        categoria: expenseForm.value.categoria,
        descripcion: expenseForm.value.descripcion,
        monto: expenseForm.value.monto,
        fecha: expenseForm.value.fecha,
      });
    }

    resetForm();
    emit('refresh');
  } catch (error) {
    console.error('Error guardando gasto:', error);
    alert('Error al guardar el gasto: ' + error.message);
  } finally {
    isSaving.value = false;
  }
}

function editExpense(expense) {
  editingExpense.value = expense;
  expenseForm.value = {
    categoria: expense.categoria,
    monto: expense.monto,
    fecha: expense.fecha || new Date().toISOString().split('T')[0],
    descripcion: expense.descripcion || '',
  };
  activeTab.value = 'expenses';
}

async function confirmDeleteExpense(expenseId) {
  if (!confirm('¿Está seguro de eliminar este gasto?')) return;

  try {
    await feriasStore.eliminarGasto(expenseId);
    emit('refresh');
  } catch (error) {
    console.error('Error eliminando gasto:', error);
    alert('Error al eliminar el gasto: ' + error.message);
  }
}

async function deleteExpense(expense) {
  await confirmDeleteExpense(expense.id);
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  editingExpense.value = null;
  expenseForm.value = {
    categoria: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
  };
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatNumber(value) {
  return new Intl.NumberFormat('es-CL').format(value || 0);
}

// Helper methods
function getMallName() {
  if (!props.fair || !props.malls) return '';
  const mall = props.malls.find(m => m.id === props.fair.centro_comercial_id);
  return mall ? mall.nombre : '';
}

function getMonthName(dateString) {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const date = new Date(dateString);
  return months[date.getMonth()];
}

// Watch for modal close to reset form
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    resetForm();
    activeTab.value = 'income';
  }
});
</script>

<style scoped>
/* ===== MODAL HEADER ===== */
.modal-header {
  background: white;
  color: #374151;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-info {
  flex: 1;
}

.modal-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.5rem 0;
}

.fair-info {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  opacity: 0.9;
}

.fair-name {
  font-weight: 500;
}

.fair-dates {
  opacity: 0.8;
}

.btn-close-custom {
  background: none;
  border: none;
  color: #374151;
  font-size: 1.5rem;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.15s;
  width: 40px;
  height: 40px;
}

.btn-close-custom:hover {
  background: #f3f4f6;
  color: #111827;
}

.btn-close-custom i {
  font-size: 1.25rem;
  font-weight: 700;
}

/* ===== KPI CARDS ===== */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.kpi-card {
  background: white;
  border-radius: 6px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.kpi-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.kpi-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.kpi-header i {
  font-size: 1rem;
}

.kpi-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.kpi-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.kpi-detail {
  font-size: 0.7rem;
  color: #9ca3af;
}

.progress-text,
.expense-count,
.pending-count {
  font-size: 0.7rem;
  color: #6b7280;
  font-weight: 500;
}

.kpi-progress {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-left: 0.5rem;
}

.kpi-progress-bar {
  height: 100%;
  background: #10b981;
  border-radius: 2px;
  transition: width 0.3s;
}

/* KPI Color Variations */
.kpi-revenue .kpi-header i {
  color: #10b981;
}

.kpi-expenses .kpi-header i {
  color: #ef4444;
}

.kpi-pending .kpi-header i {
  color: #f59e0b;
}

.kpi-profit.positive .kpi-header i {
  color: #10b981;
}

.kpi-profit.positive .kpi-amount {
  color: #10b981;
}

.kpi-profit.negative .kpi-header i {
  color: #ef4444;
}

.kpi-profit.negative .kpi-amount {
  color: #ef4444;
}

.kpi-profit.neutral .kpi-header i {
  color: #6b7280;
}

/* ===== TABS ===== */
.tabs-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #374151;
  background: #f9fafb;
}

.tab-button.active {
  color: #6366f1;
  border-bottom-color: #6366f1;
}

.tab-button i {
  font-size: 0.875rem;
}

.tab-badge {
  background: #e5e7eb;
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

.tab-button.active .tab-badge {
  background: #6366f1;
  color: white;
}

/* ===== TAB CONTENT ===== */
.tab-content {
  min-height: 300px;
}

.tab-pane {
  display: none;
}

.tab-pane.active {
  display: block;
}

/* ===== INCOME TAB ===== */
.income-summary {
  display: flex;
  justify-content: flex-end;
  gap: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.summary-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.summary-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  font-size: 0.875rem;
  font-weight: 700;
}

.summary-value.total {
  color: #374151;
}

.summary-value.paid {
  color: #10b981;
}

.summary-value.pending {
  color: #f59e0b;
}

/* ===== DATA TABLE ===== */
.table-container {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.data-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.data-table tbody tr:last-child {
  border-bottom: none;
}

.data-table td {
  padding: 0.875rem 1rem;
}

.td-puesto {
  width: 80px;
}

.puesto-badge {
  display: inline-block;
  background: #e5e7eb;
  color: #374151;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.75rem;
}

.td-emprendimiento {
  width: 35%;
}

.business-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.125rem;
}

.business-owner {
  font-size: 0.75rem;
  color: #6b7280;
}

.td-money {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  width: 120px;
}

.td-money.total {
  color: #374151;
}

.td-money.paid {
  color: #10b981;
}

.td-money.pending {
  color: #f59e0b;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-completo {
  background: #d1fae5;
  color: #065f46;
}

.status-parcial {
  background: #fef3c7;
  color: #92400e;
}

.status-pendiente {
  background: #fee2e2;
  color: #991b1b;
}

/* ===== EXPENSE FORM ===== */
.expense-form {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
}

.expense-form .form-label {
  font-size: 0.75rem;
  color: #374151;
  font-weight: 600;
  margin-bottom: 0.375rem;
  text-transform: uppercase;
}

.expense-form .form-control,
.expense-form .form-select {
  height: 36px;
  font-size: 0.8125rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.expense-form .btn {
  height: 36px;
  font-size: 0.8125rem;
  font-weight: 500;
}

/* ===== EXPENSES BY CATEGORY ===== */
.expenses-by-category {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-group {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-info i {
  font-size: 1rem;
  color: #6366f1;
}

.category-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
}

.category-count {
  background: #e5e7eb;
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

.category-total {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #ef4444;
  font-family: 'Courier New', monospace;
}

.expense-list {
  display: flex;
  flex-direction: column;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}

.expense-item:hover {
  background: #f9fafb;
}

.expense-item:last-child {
  border-bottom: none;
}

.expense-details {
  flex: 1;
}

.expense-description {
  font-size: 0.8125rem;
  color: #374151;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.expense-date {
  font-size: 0.7rem;
  color: #9ca3af;
}

.expense-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.expense-amount {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 700;
  color: #111827;
  min-width: 100px;
  text-align: right;
}

/* ===== BUTTONS ===== */
.btn-icon {
  background: none;
  border: none;
  padding: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
}

.btn-icon:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-icon.danger:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .income-summary {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
