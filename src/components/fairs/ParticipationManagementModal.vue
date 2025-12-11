<template>
    <div v-if="visible && participation" class="modal fade show d-block" tabindex="-1"
        style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-fullscreen-lg-down" style="max-width: 95vw; margin: 1rem auto;">
            <div class="modal-content" style="height: 95vh;">

                <!-- Header simple sin fondo azul -->
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="bi bi-clipboard-check me-2"></i>
                        Gestión de Participación - {{ entrepreneurName }}
                    </h5>
                    <button type="button" class="btn-close" @click="$emit('close')"></button>
                </div>

                <!-- Body con scroll - todo en una sola vista -->
                <div class="modal-body p-0" style="height: calc(95vh - 120px); overflow-y: auto;">

                    <div class="container-fluid p-4">

                        <!-- ========== SECCIÓN 1: INFORMACIÓN Y EDICIÓN ========== -->
                        <section class="content-section mb-4">
                            <div class="section-header">
                                <div class="section-header-icon bg-gradient-primary">
                                    <i class="bi bi-info-circle"></i>
                                </div>
                                <h5 class="section-title">Información de Participación</h5>
                            </div>

                            <div class="row g-3">
                                <!-- Info compacta -->
                                <div class="col-lg-3">
                                    <div class="info-card">
                                        <div class="info-card-item">
                                            <span class="info-label">Feria</span>
                                            <span class="info-value">{{ fairData?.fairName || 'N/A' }}</span>
                                        </div>
                                        <div class="info-card-item">
                                            <span class="info-label">Centro</span>
                                            <span class="info-value">{{ fairData?.mallName || 'N/A' }}</span>
                                        </div>
                                        <div class="info-card-item">
                                            <span class="info-label">Período</span>
                                            <span class="info-value">{{ fairData?.month || 'N/A' }} {{ fairData?.year ||
                                                '' }}</span>
                                        </div>
                                        <div class="info-card-item border-0">
                                            <span class="info-label">Emprendedor</span>
                                            <span class="info-value text-primary fw-bold">{{ entrepreneurName || 'N/A'
                                            }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Formulario -->
                                <div class="col-lg-9">
                                    <div class="form-section">
                                        <form @submit.prevent="handleSave">
                                            <div class="row g-3 mb-3">
                                                <div class="col-md-3">
                                                    <label class="form-label">Número de Puesto</label>
                                                    <input type="text" class="form-control"
                                                        v-model="editForm.numeroPuesto" required
                                                        placeholder="Ej: P001" />
                                                </div>

                                                <div class="col-md-3">
                                                    <label class="form-label">Descuento (%)</label>
                                                    <input type="number" class="form-control"
                                                        v-model.number="editForm.descuento" min="0" max="100"
                                                        step="0.01" placeholder="0" />
                                                </div>

                                                <div class="col-md-6">
                                                    <label class="form-label">Mobiliario Adicional</label>
                                                    <div class="mobiliario-grid"
                                                        v-if="furniture && furniture.length > 0">
                                                        <div v-for="item in furniture" :key="item.id"
                                                            class="mobiliario-checkbox">
                                                            <input class="form-check-input" type="checkbox"
                                                                :id="'mob-' + item.id"
                                                                v-model="editForm.mobiliarioSeleccionado[item.id]" />
                                                            <label :for="'mob-' + item.id" class="mobiliario-label">
                                                                {{ item.nombre }}
                                                                <small class="text-muted">${{
                                                                    item.precio?.toLocaleString('es-CL') }}</small>
                                                            </label>
                                                            <input v-if="editForm.mobiliarioSeleccionado[item.id]"
                                                                type="number"
                                                                class="form-control form-control-sm qty-input"
                                                                v-model.number="editForm.mobiliarioCantidad[item.id]"
                                                                min="1" placeholder="Cant." />
                                                        </div>
                                                    </div>
                                                    <p v-else class="text-muted small mb-0">No hay mobiliario disponible
                                                    </p>
                                                </div>
                                            </div>

                                            <!-- Resumen de precios mejorado -->
                                            <div class="price-summary-box">
                                                <div class="price-row">
                                                    <span>Precio Base</span>
                                                    <strong>${{ priceCalculation.basePrice.toLocaleString('es-CL')
                                                    }}</strong>
                                                </div>
                                                <div class="price-row">
                                                    <span>Descuento</span>
                                                    <strong class="text-danger">-${{
                                                        priceCalculation.discount.toLocaleString('es-CL') }}</strong>
                                                </div>
                                                <div class="price-row">
                                                    <span>Mobiliario</span>
                                                    <strong>${{ priceCalculation.mobiliarioCargo.toLocaleString('es-CL')
                                                    }}</strong>
                                                </div>
                                                <div class="price-row">
                                                    <span>IVA (19%)</span>
                                                    <strong>${{ priceCalculation.tax.toLocaleString('es-CL') }}</strong>
                                                </div>
                                                <div class="price-row total-row">
                                                    <span>TOTAL A PAGAR</span>
                                                    <strong class="total-amount">${{
                                                        priceCalculation.total.toLocaleString('es-CL') }}</strong>
                                                </div>
                                            </div>

                                            <button type="submit" class="btn btn-primary mt-3" :disabled="saving">
                                                <span v-if="saving"
                                                    class="spinner-border spinner-border-sm me-2"></span>
                                                <i v-else class="bi bi-save me-2"></i>
                                                {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- ========== SECCIÓN 2: PAGOS Y ABONOS ========== -->
                        <section class="content-section mb-4">
                            <div class="section-header">
                                <div class="section-header-icon bg-gradient-success">
                                    <i class="bi bi-cash-stack"></i>
                                </div>
                                <h5 class="section-title">Pagos y Abonos</h5>
                            </div>

                            <!-- Formulario de nuevo pago -->
                            <div class="form-section mb-3">
                                <h6 class="section-subtitle mb-3">Registrar Nuevo Pago</h6>
                                <form @submit.prevent="savePayment">
                                    <div class="row g-3">
                                        <div class="col-md-2">
                                            <label class="form-label">Monto</label>
                                            <input type="number" class="form-control" v-model.number="paymentForm.monto"
                                                required min="0" step="0.01" placeholder="0" />
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label">Fecha</label>
                                            <input type="date" class="form-control" v-model="paymentForm.fechaPago"
                                                required />
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label">Método</label>
                                            <select class="form-select" v-model="paymentForm.metodoPago" required>
                                                <option value="">Seleccionar...</option>
                                                <option value="Efectivo">Efectivo</option>
                                                <option value="Transferencia">Transferencia</option>
                                                <option value="Tarjeta">Tarjeta</option>
                                                <option value="Cheque">Cheque</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label">Notas</label>
                                            <input type="text" class="form-control" v-model="paymentForm.notas"
                                                placeholder="Opcional" />
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label">Comprobante</label>
                                            <input type="file" class="form-control" accept=".pdf,.jpg,.jpeg,.png"
                                                @change="handlePaymentFileChange" />
                                        </div>
                                    </div>
                                    <button type="submit" class="btn btn-success mt-3" :disabled="savingPayment">
                                        <span v-if="savingPayment" class="spinner-border spinner-border-sm me-2"></span>
                                        <i v-else class="bi bi-plus-circle me-2"></i>
                                        {{ savingPayment ? 'Guardando...' : 'Agregar Pago' }}
                                    </button>
                                </form>
                            </div>

                            <!-- Lista de pagos -->
                            <div class="table-section">
                                <h6 class="section-subtitle mb-3">Historial de Pagos</h6>
                                <div v-if="payments.length === 0" class="empty-state">
                                    <i class="bi bi-inbox"></i>
                                    <p>No hay pagos registrados para esta participación</p>
                                </div>
                                <div v-else class="table-responsive">
                                    <table class="table table-hover table-modern">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Monto</th>
                                                <th>Método</th>
                                                <th>Notas</th>
                                                <th>Comprobante</th>
                                                <th width="80">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="payment in payments" :key="payment.id">
                                                <td>{{ formatDate(payment.fecha_pago) }}</td>
                                                <td><strong class="text-success">${{
                                                    payment.monto?.toLocaleString('es-CL') }}</strong></td>
                                                <td><span class="badge bg-light text-dark">{{ payment.metodo_pago
                                                }}</span></td>
                                                <td>{{ payment.notas || '-' }}</td>
                                                <td>
                                                    <a v-if="payment.comprobante_url" :href="payment.comprobante_url"
                                                        target="_blank" class="btn btn-sm btn-outline-primary">
                                                        <i class="bi bi-file-earmark-pdf"></i>
                                                    </a>
                                                    <span v-else class="text-muted">-</span>
                                                </td>
                                                <td>
                                                    <button class="btn btn-sm btn-outline-danger"
                                                        @click="deletePayment(payment.id)" title="Eliminar">
                                                        <i class="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        <!-- ========== SECCIÓN 3: DOCUMENTOS DRIVE ========== -->
                        <section class="content-section mb-4">
                            <div class="section-header">
                                <div class="section-header-icon bg-gradient-warning">
                                    <i class="bi bi-google"></i>
                                </div>
                                <h5 class="section-title">Documentos de Google Drive</h5>
                            </div>
                            <FairDocumentUpload v-if="participation" :fair-id="fairId" :mall-id="mallId"
                                :participation-id="participation.id" :fair-data="fairData" />
                        </section>

                        <!-- ========== SECCIÓN 4: FACTURAS ========== -->
                        <section class="content-section mb-4">
                            <div class="section-header">
                                <div class="section-header-icon bg-gradient-danger">
                                    <i class="bi bi-receipt"></i>
                                </div>
                                <h5 class="section-title">Facturas</h5>
                            </div>

                            <InvoiceForm v-if="participation && participation.emprendimiento_id"
                                :entrepreneurship-id="participation.emprendimiento_id" :fair-id="fairId"
                                :participation-id="participation.id" />
                        </section>

                    </div>
                    <!-- Fin container -->

                </div>

                <!-- Footer -->
                <div class="modal-footer border-top bg-light">
                    <button type="button" class="btn btn-secondary" @click="$emit('close')">
                        <i class="bi bi-x-circle me-1"></i> Cerrar
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useParticipacionesStore } from '../../stores/participaciones';
import { useAbonosStore } from '../../stores/abonos';
import { useNotifications } from '../../composables/useNotifications';
import FairDocumentUpload from './FairDocumentUpload.vue';
import InvoiceForm from './InvoiceForm.vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    participation: {
        type: Object,
        default: null
    },
    fairData: {
        type: Object,
        default: null
    },
    furniture: {
        type: Array,
        default: () => []
    },
    fairId: {
        type: String,
        default: null
    },
    mallId: {
        type: String,
        default: null
    },
    entrepreneurName: {
        type: String,
        default: ''
    },
    businesses: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['close', 'updated']);

const participacionesStore = useParticipacionesStore();
const abonosStore = useAbonosStore();
const { showSuccess, showError } = useNotifications();

const saving = ref(false);
const savingPayment = ref(false);
const payments = ref([]);
const selectedPaymentFile = ref(null);
const selectedInvoiceFile = ref(null);
const uploadingInvoice = ref(false);

const editForm = ref({
    numeroPuesto: '',
    descuento: 0,
    mobiliarioSeleccionado: {},
    mobiliarioCantidad: {}
});

const paymentForm = ref({
    monto: 0,
    fechaPago: new Date().toISOString().split('T')[0],
    metodoPago: '',
    notas: ''
});

const priceCalculation = computed(() => {
    const basePrice = props.fairData?.precio_base || 0;
    const discount = (basePrice * (editForm.value.descuento || 0)) / 100;

    let mobiliarioCargo = 0;
    if (props.furniture && props.furniture.length > 0) {
        props.furniture.forEach(item => {
            if (editForm.value.mobiliarioSeleccionado[item.id]) {
                const cantidad = editForm.value.mobiliarioCantidad[item.id] || 1;
                mobiliarioCargo += (item.precio || 0) * cantidad;
            }
        });
    }

    const subtotal = basePrice - discount + mobiliarioCargo;
    const tax = subtotal * 0.19;
    const total = subtotal + tax;

    return { basePrice, discount, mobiliarioCargo, tax, total };
});

const loadPayments = async () => {
    if (!props.participation?.id) return;

    try {
        await abonosStore.cargarAbonos(props.participation.id);
        payments.value = abonosStore.abonos;
    } catch (error) {
        console.error('Error loading payments:', error);
    }
};

const handleSave = async () => {
    saving.value = true;
    try {
        const mobiliarioArray = Object.keys(editForm.value.mobiliarioSeleccionado)
            .filter(itemId => editForm.value.mobiliarioSeleccionado[itemId])
            .map(itemId => ({
                item_mobiliario_id: itemId,
                cantidad: editForm.value.mobiliarioCantidad[itemId] || 1
            }));

        const updateData = {
            numero_puesto: editForm.value.numeroPuesto,
            descuento: editForm.value.descuento || 0,
            mobiliario: mobiliarioArray,
            monto_final: priceCalculation.value.total
        };

        await participacionesStore.actualizarParticipacion(props.participation.id, updateData);
        showSuccess('Participación actualizada exitosamente');
        emit('updated');
    } catch (error) {
        console.error('Error saving participation:', error);
        showError('Error al guardar la participación');
    } finally {
        saving.value = false;
    }
};

const savePayment = async () => {
    savingPayment.value = true;
    try {
        let comprobanteUrl = null;

        // Si hay archivo de comprobante, subirlo primero
        if (selectedPaymentFile.value) {
            const formData = new FormData();
            formData.append('file', selectedPaymentFile.value);
            formData.append('tipo', 'comprobante_pago');
            formData.append('participacion_id', props.participation.id);

            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                comprobanteUrl = data.webViewLink;
            }
        }

        // Crear el pago
        await abonosStore.crearAbono({
            participacion_id: props.participation.id,
            monto: paymentForm.value.monto,
            fecha_pago: paymentForm.value.fechaPago,
            metodo_pago: paymentForm.value.metodoPago,
            notas: paymentForm.value.notas,
            comprobante_url: comprobanteUrl
        });

        showSuccess('Pago registrado exitosamente');

        // Reset form
        paymentForm.value = {
            monto: 0,
            fechaPago: new Date().toISOString().split('T')[0],
            metodoPago: '',
            notas: ''
        };
        selectedPaymentFile.value = null;

        // Reset file input
        const fileInput = document.querySelector('input[type="file"][accept*=".pdf,.jpg"]');
        if (fileInput) fileInput.value = '';

        await loadPayments();
    } catch (error) {
        console.error('Error saving payment:', error);
        showError('Error al registrar el pago');
    } finally {
        savingPayment.value = false;
    }
};

const deletePayment = async (paymentId) => {
    if (!confirm('¿Está seguro de eliminar este pago?')) return;

    try {
        await abonosStore.eliminarAbono(paymentId);
        showSuccess('Pago eliminado exitosamente');
        await loadPayments();
    } catch (error) {
        console.error('Error deleting payment:', error);
        showError('Error al eliminar el pago');
    }
};

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CL');
};

const handlePaymentFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        selectedPaymentFile.value = file;
    }
};

const handleInvoiceFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        selectedInvoiceFile.value = file;
    }
};

const uploadInvoiceFile = async () => {
    if (!selectedInvoiceFile.value) return;

    uploadingInvoice.value = true;
    try {
        const formData = new FormData();
        formData.append('file', selectedInvoiceFile.value);
        formData.append('tipo', 'factura');
        formData.append('participacion_id', props.participation.id);

        const response = await fetch('http://localhost:3001/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Error al subir archivo');

        const data = await response.json();
        showSuccess('Archivo de factura subido exitosamente a Google Drive');
        selectedInvoiceFile.value = null;

        // Reset file input
        const fileInput = document.querySelector('input[type="file"][accept*=".pdf"]');
        if (fileInput) fileInput.value = '';
    } catch (error) {
        console.error('Error uploading invoice file:', error);
        showError('Error al subir el archivo de factura');
    } finally {
        uploadingInvoice.value = false;
    }
};

watch(() => props.participation, (newVal) => {
    if (newVal) {
        editForm.value = {
            numeroPuesto: newVal.numero_puesto || '',
            descuento: newVal.descuento || 0,
            mobiliarioSeleccionado: {},
            mobiliarioCantidad: {}
        };

        if (newVal.mobiliario && newVal.mobiliario.length > 0) {
            newVal.mobiliario.forEach(mob => {
                const itemId = mob.item_mobiliario_id;
                if (itemId) {
                    editForm.value.mobiliarioSeleccionado[itemId] = true;
                    editForm.value.mobiliarioCantidad[itemId] = mob.cantidad || 1;
                }
            });
        }

        loadPayments();
    }
}, { immediate: true });
</script>

<style scoped>
/* Modal Base */
.modal {
    overflow-y: auto;
}

.modal-dialog {
    margin: 1rem auto;
}

.modal-header {
    background: #374151;
    color: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 0.875rem 1.25rem;
}

.modal-header .modal-title {
    font-weight: 500;
    font-size: 0.95rem;
    letter-spacing: 0.025em;
}

.modal-header .btn-close {
    filter: brightness(0) invert(1);
}

.modal-body {
    background-color: #fafafa;
}

/* Content Sections */
.content-section {
    background: white;
    border-radius: 4px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
}

.section-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.section-header-icon {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.625rem;
    color: white;
    font-size: 0.875rem;
}

.bg-gradient-primary {
    background: #6366f1;
}

.bg-gradient-success {
    background: #10b981;
}

.bg-gradient-warning {
    background: #f59e0b;
}

.bg-gradient-danger {
    background: #ef4444;
}

.section-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    letter-spacing: 0.025em;
}

.section-subtitle {
    font-size: 0.8125rem;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 0.75rem;
}

/* Info Card */
.info-card {
    background: #fafafa;
    border-radius: 4px;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
}

.info-card-item {
    padding: 0.5rem 0;
    border-bottom: 1px solid #f3f4f6;
}

.info-card-item:last-child {
    border-bottom: none;
}

.info-label {
    display: block;
    font-size: 0.6875rem;
    color: #9ca3af;
    font-weight: 500;
    margin-bottom: 0.125rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.info-value {
    display: block;
    font-size: 0.8125rem;
    color: #1f2937;
    font-weight: 400;
}

/* Form Section */
.form-section {
    background: #ffffff;
    border-radius: 4px;
    padding: 1rem;
    border: 1px solid #e5e7eb;
}

.form-label {
    font-weight: 500;
    color: #4b5563;
    margin-bottom: 0.375rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    display: block;
    width: 100%;
}

.col-md-2,
.col-md-3,
.col-md-6,
.col-md-12,
.col-lg-3,
.col-lg-6,
.col-lg-9,
.mb-3,
[class*="col-"] {
    display: flex;
    flex-direction: column;
}

.form-control,
.form-select {
    border: 1px solid #d1d5db !important;
    border-radius: 4px !important;
    padding: 0.5rem 0.75rem !important;
    transition: all 0.15s;
    font-size: 0.8125rem !important;
    height: 36px !important;
    line-height: 1.5 !important;
    width: 100%;
}

.form-select {
    background-position: right 0.75rem center !important;
    background-size: 16px 12px !important;
    padding-right: 2.5rem !important;
}

.form-control:focus,
.form-select:focus {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1) !important;
    outline: none !important;
}

.form-control-sm {
    font-size: 0.75rem;
    padding: 0.375rem 0.625rem;
    height: 32px;
}

/* Mobiliario Grid */
.mobiliario-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.625rem;
}

.mobiliario-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    background: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    transition: all 0.15s;
}

.mobiliario-checkbox:hover {
    background: #f3f4f6;
    border-color: #6366f1;
}

.mobiliario-checkbox .form-check-input {
    margin: 0.25rem 0 0 0;
    cursor: pointer;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    position: relative;
}

.mobiliario-label {
    margin: 0;
    padding: 0;
    font-size: 0.75rem;
    cursor: pointer;
    display: block;
    flex: 1;
    word-wrap: break-word;
    line-height: 1.4;
}

.mobiliario-label small {
    font-size: 0.6875rem;
    display: block;
    margin-top: 0.125rem;
}

.qty-input {
    width: 55px !important;
    font-size: 0.75rem !important;
    padding: 0.25rem 0.375rem !important;
    flex-shrink: 0;
    margin-top: 0.125rem;
}

/* Price Summary */
.price-summary-box {
    background: #f9fafb;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 0.875rem;
    margin-top: 0.75rem;
}

.price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.375rem 0;
    font-size: 0.8125rem;
}

.price-row:last-child {
    border-bottom: none;
}

.price-row.total-row {
    margin-top: 0.375rem;
    padding-top: 0.625rem;
    border-top: 1px solid #d1d5db;
    border-bottom: none;
    font-weight: 600;
}

.total-amount {
    font-size: 1.125rem;
    color: #1f2937;
    font-weight: 600;
}

/* Table Section */
.table-section {
    background: #ffffff;
    border-radius: 4px;
    padding: 0.875rem;
    border: 1px solid #e5e7eb;
}

.table-modern {
    margin-bottom: 0;
    font-size: 0.75rem;
}

.table-modern thead {
    background: #fafafa;
}

.table-modern thead th {
    border-bottom: 1px solid #e5e7eb;
    font-weight: 500;
    color: #6b7280;
    padding: 0.5rem 0.625rem;
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.table-modern tbody tr {
    transition: all 0.15s;
}

.table-modern tbody tr:hover {
    background-color: #fafafa;
}

.table-modern tbody td {
    padding: 0.625rem;
    vertical-align: middle;
    border-bottom: 1px solid #f3f4f6;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: #9ca3af;
}

.empty-state i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    display: block;
    opacity: 0.5;
}

.empty-state p {
    margin: 0;
    font-size: 0.8125rem;
}

/* Buttons */
.btn {
    border-radius: 4px;
    font-weight: 500;
    padding: 0.5rem 1rem;
    transition: all 0.15s;
    font-size: 0.8125rem;
}

.btn-primary {
    background: #6366f1;
    border: none;
}

.btn-primary:hover:not(:disabled) {
    background: #4f46e5;
}

.btn-success {
    background: #10b981;
    border: none;
}

.btn-success:hover:not(:disabled) {
    background: #059669;
}

.btn-sm {
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
}

.btn-outline-danger:hover {
    transform: scale(1.05);
}

/* Badges */
.badge {
    padding: 0.25rem 0.5rem;
    font-weight: 500;
    font-size: 0.6875rem;
    border-radius: 3px;
}

/* Form Check */
.form-check-input:checked {
    background-color: #6366f1;
    border-color: #6366f1;
}

/* Scrollbar */
.modal-body::-webkit-scrollbar {
    width: 6px;
}

.modal-body::-webkit-scrollbar-track {
    background: #f3f4f6;
}

.modal-body::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
    .content-section {
        padding: 0.75rem;
    }

    .section-title {
        font-size: 0.8125rem;
    }

    .mobiliario-grid {
        grid-template-columns: 1fr;
    }
}
</style>
