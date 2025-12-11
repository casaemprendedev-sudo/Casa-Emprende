<template>
    <div class="google-drive-upload">
        <!-- Configuration Warning -->
        <div class="alert alert-warning mb-3" v-if="!isConfigured">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            <strong>Google Drive no configurado.</strong> 
            Por favor configure las variables de entorno
        </div>

        <!-- Authentication Required -->
        <div v-else-if="!isAuthenticated" class="alert alert-info mb-3">
            <i class="fab fa-google mr-2"></i>
            <strong>Autenticación requerida</strong>
            <p class="mb-2">Necesitas autenticarte con Google Drive para subir documentos.</p>
            <button 
                @click="handleAuthenticate" 
                class="btn btn-primary btn-sm"
                :disabled="isLoading"
            >
                <i class="fab fa-google mr-2"></i>
                Conectar con Google Drive
            </button>
        </div>

        <!-- Upload Interface -->
        <div v-else class="upload-section">
            <div class="mb-3 d-flex justify-content-between align-items-center">
                <div>
                    <i class="fab fa-google-drive text-success mr-2"></i>
                    <small class="text-muted">
                        Conectado a Google Drive
                    </small>
                </div>
                <span class="badge badge-success">
                    <i class="fas fa-check-circle mr-1"></i>
                    Autenticado
                </span>
            </div>

            <!-- Upload Forms -->
            <div class="row">
                <!-- Facturas -->
                <div class="col-md-6 mb-3">
                    <div class="card border-info">
                        <div class="card-header bg-info text-white">
                            <i class="fas fa-file-invoice mr-2"></i>
                            Facturas
                        </div>
                        <div class="card-body">
                            <input 
                                type="file" 
                                ref="invoiceInput"
                                @change="handleInvoiceUpload"
                                accept=".pdf"
                                class="form-control-file mb-2"
                                :disabled="isLoading"
                            />
                            <small class="text-muted d-block">Solo archivos PDF</small>
                            
                            <!-- Existing Documents List -->
                            <div v-if="invoiceDocuments.length > 0" class="mt-3 mb-2">
                                <small class="text-muted d-block mb-2">
                                    <strong>Documentos subidos:</strong>
                                </small>
                                <div 
                                    v-for="doc in invoiceDocuments" 
                                    :key="doc.id"
                                    class="d-flex align-items-center justify-content-between mb-2 p-2 border rounded"
                                >
                                    <div class="flex-grow-1">
                                        <small class="text-truncate d-block" style="max-width: 200px;">
                                            <i class="fas fa-file-pdf text-danger mr-1"></i>
                                            {{ doc.nombre_archivo }}
                                        </small>
                                        <small class="text-muted">
                                            {{ new Date(doc.fecha_subida).toLocaleDateString() }}
                                        </small>
                                    </div>
                                    <a 
                                        :href="doc.drive_web_view_link" 
                                        target="_blank" 
                                        class="btn btn-sm btn-outline-primary ml-2"
                                        title="Ver en Drive"
                                    >
                                        <i class="fab fa-google-drive"></i>
                                    </a>
                                </div>
                            </div>
                            
                            <div v-if="uploadingInvoice" class="mt-2">
                                <div class="progress">
                                    <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                         role="progressbar" 
                                         style="width: 100%">
                                        Subiendo...
                                    </div>
                                </div>
                            </div>

                            <div v-if="invoiceSuccess" class="alert alert-success mt-2 mb-0">
                                <i class="fas fa-check-circle mr-2"></i>
                                Factura subida exitosamente
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ordenes de Compra -->
                <div class="col-md-6 mb-3">
                    <div class="card border-warning">
                        <div class="card-header bg-warning text-dark">
                            <i class="fas fa-file-contract mr-2"></i>
                            Órdenes de Compra
                        </div>
                        <div class="card-body">
                            <input 
                                type="file" 
                                ref="purchaseOrderInput"
                                @change="handlePurchaseOrderUpload"
                                accept=".pdf"
                                class="form-control-file mb-2"
                                :disabled="isLoading"
                            />
                            <small class="text-muted d-block">Solo archivos PDF</small>
                            
                            <!-- Existing Documents List -->
                            <div v-if="purchaseOrderDocuments.length > 0" class="mt-3 mb-2">
                                <small class="text-muted d-block mb-2">
                                    <strong>Documentos subidos:</strong>
                                </small>
                                <div 
                                    v-for="doc in purchaseOrderDocuments" 
                                    :key="doc.id"
                                    class="d-flex align-items-center justify-content-between mb-2 p-2 border rounded"
                                >
                                    <div class="flex-grow-1">
                                        <small class="text-truncate d-block" style="max-width: 200px;">
                                            <i class="fas fa-file-pdf text-danger mr-1"></i>
                                            {{ doc.nombre_archivo }}
                                        </small>
                                        <small class="text-muted">
                                            {{ new Date(doc.fecha_subida).toLocaleDateString() }}
                                        </small>
                                    </div>
                                    <a 
                                        :href="doc.drive_web_view_link" 
                                        target="_blank" 
                                        class="btn btn-sm btn-outline-warning ml-2"
                                        title="Ver en Drive"
                                    >
                                        <i class="fab fa-google-drive"></i>
                                    </a>
                                </div>
                            </div>
                            
                            <div v-if="uploadingPO" class="mt-2">
                                <div class="progress">
                                    <div class="progress-bar bg-warning progress-bar-striped progress-bar-animated" 
                                         role="progressbar" 
                                         style="width: 100%">
                                        Subiendo...
                                    </div>
                                </div>
                            </div>

                            <div v-if="poSuccess" class="alert alert-success mt-2 mb-0">
                                <i class="fas fa-check-circle mr-2"></i>
                                Orden de compra subida exitosamente
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Setup Instructions -->
            <div class="alert alert-info alert-sm">
                <i class="fas fa-info-circle mr-2"></i>
                <small>
                    <strong>Nota:</strong> Las carpetas deben estar pre-creadas en Google Drive con la estructura: 
                    Año / Mall / Feria-Mes / Facturas|Ordenes de Compra
                </small>
            </div>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="alert alert-danger alert-dismissible fade show">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            {{ error }}
            <button type="button" class="close" @click="clearError">
                <span>&times;</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGoogleDrive } from '../../composables/useGoogleDrive'
import { supabase } from '../../lib/supabase'

const props = defineProps({
    fairData: {
        type: Object,
        required: true,
        // Expected: { year, mallName, fairName, month }
    },
    entrepreneurName: {
        type: String,
        required: true,
    },
    participationId: {
        type: String,
        required: true,
    },
    fairId: {
        type: String,
        required: true,
    },
    mallId: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['upload-success', 'upload-error'])

const {
    isConfigured,
    isAuthenticated,
    isLoading,
    error,
    authenticate,
    uploadInvoice,
    uploadPurchaseOrder,
} = useGoogleDrive()

const invoiceInput = ref(null)
const purchaseOrderInput = ref(null)
const uploadingInvoice = ref(false)
const uploadingPO = ref(false)
const invoiceSuccess = ref(false)
const poSuccess = ref(false)

// Lists of uploaded documents
const invoiceDocuments = ref([])
const purchaseOrderDocuments = ref([])

// Load existing documents from database
const loadDocuments = async () => {
    try {
        // Load facturas (por emprendedor - participacion_id)
        const { data: facturas, error: errorFacturas } = await supabase
            .from('documentos_drive')
            .select('*')
            .eq('participacion_id', props.participationId)
            .eq('tipo_documento', 'Factura')
            .order('fecha_subida', { ascending: false })

        if (errorFacturas) throw errorFacturas

        // Load ordenes de compra (por feria - feria_id)
        const { data: ordenes, error: errorOrdenes } = await supabase
            .from('documentos_drive')
            .select('*')
            .eq('feria_id', props.fairId)
            .eq('tipo_documento', 'Orden de Compra')
            .order('fecha_subida', { ascending: false })

        if (errorOrdenes) throw errorOrdenes

        invoiceDocuments.value = facturas || []
        purchaseOrderDocuments.value = ordenes || []
    } catch (err) {
        console.error('Error loading documents:', err)
    }
}

onMounted(() => {
    loadDocuments()
})

const handleAuthenticate = async () => {
    try {
        await authenticate()
    } catch (err) {
        console.error('Error during authentication:', err)
        alert('Error al autenticar con Google Drive')
    }
}

const handleInvoiceUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF')
        return
    }

    uploadingInvoice.value = true
    invoiceSuccess.value = false

    try {
        const result = await uploadInvoice(file, props.fairData, props.entrepreneurName)
        
        if (result.success) {
            // Save factura (a nivel de participación/emprendedor)
            const folderPath = `${props.fairData.year}/${props.fairData.mallName}/${props.fairData.fairName} - ${props.fairData.month}/${props.entrepreneurName}/Facturas`
            
            const { error: dbError } = await supabase
                .from('documentos_drive')
                .insert({
                    participacion_id: props.participationId,
                    feria_id: props.fairId,
                    centro_comercial_id: props.mallId,
                    tipo_documento: 'Factura',
                    nombre_archivo: result.fileName,
                    drive_file_id: result.fileId,
                    drive_web_view_link: result.webViewLink,
                    drive_folder_path: folderPath
                })

            if (dbError) {
                console.error('Error saving document:', dbError)
                alert('Archivo subido pero error al guardar en BD')
            } else {
                // Reload documents list
                await loadDocuments()
                invoiceSuccess.value = true
                emit('upload-success', { type: 'invoice', result })
                
                // Clear input and success message after 3 seconds
                setTimeout(() => {
                    invoiceSuccess.value = false
                    if (invoiceInput.value) {
                        invoiceInput.value.value = ''
                    }
                }, 3000)
            }
        } else {
            emit('upload-error', { type: 'invoice', error: result.error })
        }
    } catch (err) {
        console.error('Error uploading invoice:', err)
        emit('upload-error', { type: 'invoice', error: err.message })
    } finally {
        uploadingInvoice.value = false
    }
}

const handlePurchaseOrderUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF')
        return
    }

    uploadingPO.value = true
    poSuccess.value = false

    try {
        const result = await uploadPurchaseOrder(file, props.fairData, props.entrepreneurName)
        
        if (result.success) {
            // Save orden de compra (a nivel de feria, NO de participación individual)
            const folderPath = `${props.fairData.year}/${props.fairData.mallName}/${props.fairData.fairName} - ${props.fairData.month}/Ordenes de Compra`
            
            const { error: dbError } = await supabase
                .from('documentos_drive')
                .insert({
                    feria_id: props.fairId,
                    centro_comercial_id: props.mallId,
                    tipo_documento: 'Orden de Compra',
                    nombre_archivo: result.fileName,
                    drive_file_id: result.fileId,
                    drive_web_view_link: result.webViewLink,
                    drive_folder_path: folderPath
                })

            if (dbError) {
                console.error('Error saving document:', dbError)
                alert('Archivo subido pero error al guardar en BD')
            } else {
                // Reload documents list
                await loadDocuments()
                poSuccess.value = true
                emit('upload-success', { type: 'purchase-order', result })
                
                // Clear input and success message after 3 seconds
                setTimeout(() => {
                    poSuccess.value = false
                    if (purchaseOrderInput.value) {
                        purchaseOrderInput.value.value = ''
                    }
                }, 3000)
            }
        } else {
            emit('upload-error', { type: 'purchase-order', error: result.error })
        }
    } catch (err) {
        console.error('Error uploading purchase order:', err)
        emit('upload-error', { type: 'purchase-order', error: err.message })
    } finally {
        uploadingPO.value = false
    }
}
</script>

<style scoped>
.google-drive-upload {
    padding: 0;
}

.upload-section {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 0.25rem;
}

.card-header {
    font-weight: 600;
    font-size: 0.9rem;
}

.progress {
    height: 1.5rem;
}

.alert-sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}
</style>
