<template>
  <div class="invoice-form">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0">
        <i class="fas fa-file-invoice mr-2"></i>
        Registro de Facturas
      </h6>
      <button v-if="!showForm" @click="showForm = true" class="btn btn-sm btn-outline-primary">
        <i class="fas fa-plus mr-1"></i>
        Nueva Factura
      </button>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="card mb-3">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Número de Factura <span class="text-danger">*</span></label>
              <input v-model="form.numero_factura" type="text" class="form-control form-control-sm"
                placeholder="Ej: F-00123" required />
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
              <input v-model="form.fecha_factura" type="date" class="form-control form-control-sm" required />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Estado</label>
              <select v-model="form.estado" class="form-control form-control-sm">
                <option value="Pendiente">Pendiente</option>
                <option value="Pagada">Pagada</option>
                <option value="Anulada">Anulada</option>
              </select>
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
              Se subirá automáticamente al guardar la factura
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
              {{ saving ? 'Guardando...' : 'Guardar Factura' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Invoice List -->
    <div v-if="invoices.length > 0" class="invoice-list">
      <div class="table-responsive">
        <table class="table table-sm table-hover">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th class="text-right">Monto</th>
              <th>Estado</th>
              <th>Documentos</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in invoices" :key="invoice.id">
              <td>
                <strong>{{ invoice.numero_factura }}</strong>
                <br>
                <small class="text-muted" v-if="invoice.descripcion">
                  {{ invoice.descripcion }}
                </small>
              </td>
              <td>{{ formatDate(invoice.fecha_factura) }}</td>
              <td class="text-right">
                <strong>${{ formatNumber(invoice.monto) }}</strong>
              </td>
              <td>
                <span class="badge" :class="{
                  'badge-success': invoice.estado === 'Pagada',
                  'badge-warning': invoice.estado === 'Pendiente',
                  'badge-danger': invoice.estado === 'Anulada'
                }">
                  {{ invoice.estado }}
                </span>
              </td>
              <td>
                <div v-if="invoice.documentos && invoice.documentos.length > 0" class="small">
                  <div v-for="doc in invoice.documentos" :key="doc.id" class="mb-1">
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
                <button @click="deleteInvoice(invoice.id)" class="btn btn-sm btn-outline-danger" title="Eliminar">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="!showForm" class="text-center text-muted py-3">
      <i class="fas fa-file-invoice fa-2x mb-2"></i>
      <p>No hay facturas registradas</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../composables/useNotifications';

const props = defineProps({
  entrepreneurshipId: {
    type: String,
    required: true
  },
  participationId: {
    type: String,
    default: null
  },
  fairId: {
    type: String,
    default: null
  },
  mallId: {
    type: String,
    default: null
  }
});

const { showSuccess, showError } = useNotifications();

const showForm = ref(false);
const saving = ref(false);
const invoices = ref([]);
const selectedFile = ref(null);

const form = ref({
  numero_factura: '',
  monto: 0,
  fecha_factura: new Date().toISOString().split('T')[0],
  estado: 'Pendiente',
  descripcion: ''
});

const resetForm = () => {
  form.value = {
    numero_factura: '',
    monto: 0,
    fecha_factura: new Date().toISOString().split('T')[0],
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

const loadInvoices = async () => {
  try {
    // Cargar facturas
    const { data, error } = await supabase
      .from('facturas')
      .select('*')
      .eq('emprendimiento_id', props.entrepreneurshipId)
      .order('fecha_factura', { ascending: false });

    if (error) throw error;

    // Cargar documentos de Drive asociados a cada factura
    if (data && data.length > 0) {
      const facturaIds = data.map(f => f.id);

      const { data: documentos, error: docError } = await supabase
        .from('documentos_drive')
        .select('*')
        .in('factura_id', facturaIds)
        .order('created_at', { ascending: false });

      if (docError) {
        console.error('Error loading documents:', docError);
      }

      // Asociar documentos a cada factura
      invoices.value = data.map(factura => ({
        ...factura,
        documentos: documentos ? documentos.filter(doc => doc.factura_id === factura.id) : []
      }));
    } else {
      invoices.value = [];
    }
  } catch (error) {
    console.error('Error loading invoices:', error);
    showError('Error al cargar las facturas');
  }
};

const handleSubmit = async () => {
  saving.value = true;
  try {
    const invoiceData = {
      emprendimiento_id: props.entrepreneurshipId,
      participacion_id: props.participationId,
      feria_id: props.fairId,
      centro_comercial_id: props.mallId,
      numero_factura: form.value.numero_factura,
      monto: form.value.monto,
      fecha_factura: form.value.fecha_factura,
      estado: form.value.estado,
      descripcion: form.value.descripcion || null
    };

    const { data: newInvoice, error } = await supabase
      .from('facturas')
      .insert(invoiceData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe una factura con ese número para este emprendimiento');
      }
      throw error;
    }

    // Si hay archivo seleccionado, subirlo a Drive y crear registro en documentos_drive
    if (selectedFile.value && newInvoice) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile.value);
        formData.append('tipo', 'factura');
        formData.append('descripcion', `Factura ${form.value.numero_factura}`);

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
            tipo_documento: 'factura',
            drive_file_id: uploadData.fileId,
            nombre_archivo: selectedFile.value.name,
            url_drive: uploadData.webViewLink,
            factura_id: newInvoice.id,
            feria_id: props.fairId,
            participacion_id: props.participationId,
            centro_comercial_id: props.mallId,
            descripcion: `Factura ${form.value.numero_factura}`
          });

        if (docError) {
          console.error('Error guardando documento en BD:', docError);
          showError('Factura guardada pero hubo un error al vincular el documento');
        }
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        showError('Factura guardada pero hubo un error al subir el archivo');
      }
    }

    showSuccess('Factura registrada exitosamente');
    await loadInvoices();
    cancelForm();
  } catch (error) {
    console.error('Error saving invoice:', error);
    showError(error.message || 'Error al guardar la factura');
  } finally {
    saving.value = false;
  }
};

const deleteInvoice = async (invoiceId) => {
  if (!confirm('¿Está seguro de eliminar esta factura?')) return;

  try {
    const { error } = await supabase
      .from('facturas')
      .delete()
      .eq('id', invoiceId);

    if (error) throw error;

    showSuccess('Factura eliminada');
    await loadInvoices();
  } catch (error) {
    console.error('Error deleting invoice:', error);
    showError('Error al eliminar la factura');
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
  loadInvoices();
});
</script>

<style scoped>
.invoice-form {
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
