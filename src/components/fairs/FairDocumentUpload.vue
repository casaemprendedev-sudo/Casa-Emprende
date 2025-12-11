<template>
    <div class="fair-document-upload">
        <!-- Authentication Status -->
        <div v-if="!isAuthenticated" class="alert alert-info mb-3">
            <i class="fab fa-google mr-2"></i>
            <strong>Autenticación requerida</strong>
            <p class="mb-2">Necesitas autenticarte con Google Drive para subir documentos.</p>
            <button @click="handleAuthenticate" class="btn btn-primary btn-sm" :disabled="isLoading">
                <i class="fab fa-google mr-2"></i>
                Conectar con Google Drive
            </button>
        </div>

        <!-- Upload Interface -->
        <div v-else>
            <div class="mb-3">
                <span class="badge badge-success">
                    <i class="fas fa-check-circle mr-1"></i>
                    Autenticado con Google Drive
                </span>
            </div>

            <!-- Documents List -->
            <div v-if="documents.length > 0" class="mt-4">
                <h6 class="mb-3">
                    <i class="fas fa-folder-open mr-2"></i>
                    Documentos Subidos ({{ documents.length }})
                </h6>
                <div class="list-group">
                    <div v-for="doc in documents" :key="doc.id"
                        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center flex-grow-1">
                            <i class="fas fa-file-pdf text-danger mr-3" style="font-size: 1.5rem;"></i>
                            <div>
                                <div class="fw-500">{{ doc.nombre_archivo }}</div>
                                <small class="text-muted">
                                    Subido: {{ formatDate(doc.created_at) }}
                                </small>
                            </div>
                        </div>
                        <div class="btn-group">
                            <a :href="doc.url_drive" target="_blank" class="btn btn-sm btn-outline-primary"
                                title="Ver en Drive">
                                <i class="fab fa-google-drive"></i>
                                Ver
                            </a>
                            <button @click="deleteDocument(doc)" class="btn btn-sm btn-outline-danger" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Purchase Order Registration -->
            <PurchaseOrderForm :fairId="fairId" :mallId="mallId" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGoogleDrive } from '../../composables/useGoogleDrive'
import { supabase } from '../../lib/supabase'
import PurchaseOrderForm from './PurchaseOrderForm.vue'

const props = defineProps({
    fairId: {
        type: String,
        required: true,
    },
    mallId: {
        type: String,
        required: true,
    },
    fairData: {
        type: Object,
        required: true,
        // Expected: { year, mallName, fairName, month }
    },
})

const {
    isAuthenticated,
    isLoading,
    authenticate,
} = useGoogleDrive()

const documents = ref([])

// Load documents from database
const loadDocuments = async () => {
    try {
        const { data, error } = await supabase
            .from('documentos_drive')
            .select('*')
            .eq('feria_id', props.fairId)
            .eq('tipo_documento', 'Orden de Compra')
            .is('participacion_id', null)
            .order('created_at', { ascending: false })

        if (error) throw error
        documents.value = data || []
    } catch (err) {
        console.error('Error loading documents:', err)
    }
}

const handleAuthenticate = async () => {
    try {
        await authenticate()
    } catch (err) {
        console.error('Error during authentication:', err)
        alert('Error al autenticar con Google Drive')
    }
}

const deleteDocument = async (doc) => {
    if (!confirm(`¿Eliminar "${doc.nombre_archivo}"?`)) return

    try {
        const { error } = await supabase
            .from('documentos_drive')
            .delete()
            .eq('id', doc.id)

        if (error) throw error

        await loadDocuments()
        alert('Documento eliminado exitosamente')
    } catch (err) {
        console.error('Error deleting document:', err)
        alert('Error al eliminar documento')
    }
}

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

onMounted(() => {
    loadDocuments()
})
</script>

<style scoped>
.fair-document-upload {
    padding: 0;
}

.fw-500 {
    font-weight: 500;
}

.list-group-item {
    border-left: 3px solid #ffc107;
}

.list-group-item:hover {
    background-color: #f8f9fa;
}
</style>
