<template>
  <div class="purchase-order-form">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0">
        <i class="fas fa-file-contract mr-2"></i>
        Registro de Órdenes de Compra
      </h6>
      <button v-if="!showForm" @click="showForm = true" class="btn btn-sm btn-outline-primary">
        <i class="fas fa-plus mr-1"></i>
        Nueva OC
      </button>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="card mb-3">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Número de OC <span class="text-danger">*</span></label>
              <input v-model="form.numero_oc" type="text" class="form-control form-control-sm"
                placeholder="Ej: OC-2025-001" required />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Monto <span class="text-danger">*</span></label>
              <input v-model.number="form.monto" type="number" step="0.01" class="form-control form-control-sm"
                placeholder="0.00" required />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Fecha <span class="text-danger">*</span></label>
              <input v-model="form.fecha_oc" type="date" class="form-control form-control-sm" required />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Estado</label>
              <select v-model="form.estado" class="form-control form-control-sm">
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobada">Aprobada</option>
                <option value="Rechazada">Rechazada</option>
                <option value="Pagada">Pagada</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 mb-3">
              <label class="form-label">Proveedor</label>
              <input v-model="form.proveedor" type="text" class="form-control form-control-sm"
                placeholder="Nombre del proveedor" />
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Descripción</label>
            <textarea v-model="form.descripcion" class="form-control form-control-sm" rows="2"
              placeholder="Descripción opcional..."></textarea>
          </div>

          <!-- Upload Section -->
          <div class="mb-3">
            <label class="form-label">
              <i class="fas fa-cloud-upload-alt me-1"></i>
              Adjuntar Archivo PDF/Imagen
            </label>
            <input type="file" @change="handleFileChange" accept=".pdf,.jpg,.jpeg,.png"
              class="form-control form-control-sm" />
            <small class="text-muted d-block mt-1">
              <i class="fas fa-info-circle"></i>
              Se subirá automáticamente al guardar la orden de compra
            </small>
            <div v-if="selectedFile" class="mt-2">
              <span class="badge bg-info">
                <i class="fas fa-file"></i> {{ selectedFile.name }}
              </span>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <button type="button" @click="cancelForm" class="btn btn-sm btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-sm btn-primary" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar OC' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Purchase Order List -->
    <div v-if="purchaseOrders.length > 0" class="po-list">
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th class="text-right">Monto</th>
              <th>Estado</th>
              <th>Documentos</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="po in purchaseOrders" :key="po.id">
              <td>
                <strong>{{ po.numero_oc }}</strong>
                <br>
                <small class="text-muted" v-if="po.descripcion">
                  {{ po.descripcion }}
                </small>
              </td>
              <td>{{ formatDate(po.fecha_oc) }}</td>
              <td>
                <span v-if="po.proveedor">{{ po.proveedor }}</span>
                <span v-else class="text-muted">-</span>
              </td>
              <td class="text-right">
                <strong>${{ formatNumber(po.monto) }}</strong>
              </td>
              <td>
                <span class="badge" :class="{
                  'badge-success': po.estado === 'Pagada' || po.estado === 'Aprobada',
                  'badge-warning': po.estado === 'Pendiente',
                  'badge-danger': po.estado === 'Rechazada'
                }">
                  {{ po.estado }}
                </span>
              </td>
              <td>
                <div v-if="po.documentos && po.documentos.length > 0" class="small">
                  <div v-for="doc in po.documentos" :key="doc.id" class="mb-1">
                    <a :href="doc.url_drive" target="_blank" class="text-primary">
                      <i class="fas fa-file-pdf mr-1"></i>
                      {{ doc.nombre_archivo }}
                    </a>
                    <br>
                    <small class="text-muted">{{ formatDate(doc.created_at) }}</small>
                  </div>
                </div>
                <small v-else class="text-muted">Sin archivos</small>
              </td>
              <td class="text-center">
                <button @click="deletePurchaseOrder(po.id)" class="btn btn-sm btn-outline-danger" title="Eliminar">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="!showForm" class="text-center text-muted py-3">
      <i class="fas fa-file-contract fa-2x mb-2"></i>
      <p>No hay órdenes de compra registradas</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../composables/useNotifications';

const props = defineProps({
  fairId: {
    type: String,
    required: true
  },
  mallId: {
    type: String,
    required: true
  }
});

const { showSuccess, showError } = useNotifications();

const showForm = ref(false);
const saving = ref(false);
const purchaseOrders = ref([]);
const selectedFile = ref(null);

const form = ref({
  numero_oc: '',
  monto: 0,
  fecha_oc: new Date().toISOString().split('T')[0],
  proveedor: '',
  estado: 'Pendiente',
  descripcion: ''
});

const resetForm = () => {
  form.value = {
    numero_oc: '',
    monto: 0,
    fecha_oc: new Date().toISOString().split('T')[0],
    proveedor: '',
    estado: 'Pendiente',
    descripcion: ''
  };
  selectedFile.value = null;
};

const cancelForm = () => {
  showForm.value = false;
  resetForm();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
  }
};

const loadPurchaseOrders = async () => {
  try {
    // Cargar órdenes de compra
    const { data, error } = await supabase
      .from('ordenes_compra')
      .select('*')
      .eq('feria_id', props.fairId)
      .order('fecha_oc', { ascending: false });

    if (error) throw error;

    // Cargar documentos de Drive asociados a cada orden de compra
    if (data && data.length > 0) {
      const ordenIds = data.map(o => o.id);

      const { data: documentos, error: docError } = await supabase
        .from('documentos_drive')
        .select('*')
        .in('orden_compra_id', ordenIds)
        .order('created_at', { ascending: false });

      if (docError) {
        console.error('Error loading documents:', docError);
      }

      // Asociar documentos a cada orden de compra
      purchaseOrders.value = data.map(orden => ({
        ...orden,
        documentos: documentos ? documentos.filter(doc => doc.orden_compra_id === orden.id) : []
      }));
    } else {
      purchaseOrders.value = [];
    }
  } catch (error) {
    console.error('Error loading purchase orders:', error);
    showError('Error al cargar las órdenes de compra');
  }
};

const handleSubmit = async () => {
  saving.value = true;
  try {
    const poData = {
      feria_id: props.fairId,
      centro_comercial_id: props.mallId,
      numero_oc: form.value.numero_oc,
      monto: form.value.monto,
      fecha_oc: form.value.fecha_oc,
      proveedor: form.value.proveedor || null,
      estado: form.value.estado,
      descripcion: form.value.descripcion || null
    };

    const { data: newPO, error } = await supabase
      .from('ordenes_compra')
      .insert(poData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe una OC con ese número para esta feria');
      }
      throw error;
    }

    // Si hay archivo seleccionado, subirlo a Drive y crear registro en documentos_drive
    if (selectedFile.value && newPO) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile.value);
        formData.append('tipo', 'orden_compra');
        formData.append('descripcion', `Orden de Compra ${form.value.numero_oc}`);

        const uploadResponse = await fetch('http://localhost:3001/upload', {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error('Error al subir el archivo a Google Drive');
        }

        const uploadData = await uploadResponse.json();

        // Crear registro en documentos_drive
        const { error: docError } = await supabase
          .from('documentos_drive')
          .insert({
            tipo_documento: 'orden_compra',
            drive_file_id: uploadData.fileId,
            nombre_archivo: selectedFile.value.name,
            url_drive: uploadData.webViewLink,
            orden_compra_id: newPO.id,
            feria_id: props.fairId,
            centro_comercial_id: props.mallId,
            descripcion: `Orden de Compra ${form.value.numero_oc}`
          });

        if (docError) {
          console.error('Error guardando documento en BD:', docError);
          showError('Orden de compra guardada pero hubo un error al vincular el documento');
        }
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        showError('Orden de compra guardada pero hubo un error al subir el archivo');
      }
    }

    showSuccess('Orden de compra registrada exitosamente');
    await loadPurchaseOrders();
    cancelForm();
  } catch (error) {
    console.error('Error saving purchase order:', error);
    showError(error.message || 'Error al guardar la orden de compra');
  } finally {
    saving.value = false;
  }
};

const deletePurchaseOrder = async (poId) => {
  if (!confirm('¿Está seguro de eliminar esta orden de compra?')) return;

  try {
    const { error } = await supabase
      .from('ordenes_compra')
      .delete()
      .eq('id', poId);

    if (error) throw error;

    showSuccess('Orden de compra eliminada');
    await loadPurchaseOrders();
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    showError('Error al eliminar la orden de compra');
  }
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-CL');
};

const formatNumber = (value) => {
  if (!value) return '0';
  return Number(value).toLocaleString('es-CL');
};

onMounted(() => {
  loadPurchaseOrders();
});
</script>

<style scoped>
.purchase-order-form {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.gap-2 {
  gap: 0.5rem;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 0.875rem;
}

.table td {
  vertical-align: middle;
  font-size: 0.875rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>
