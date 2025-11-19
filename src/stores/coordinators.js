import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../composables/useNotifications';

export const useCoordinatorsStore = defineStore('coordinators', () => {
    const coordinators = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const isLoaded = ref(false);

    const { showError, showSuccess } = useNotifications();

    // Computed
    const activeCoordinators = computed(() =>
        coordinators.value.filter((c) => c.activo && !c.deleted_at)
    );

    const totalCoordinators = computed(
        () => coordinators.value.filter((c) => !c.deleted_at).length
    );

    // Load coordinators
    async function loadCoordinators(forceReload = false) {
        if (isLoaded.value && !forceReload) return;

        isLoading.value = true;
        error.value = null;

        try {
            const { data, error: err } = await supabase
                .from('coordinadores')
                .select('*')
                .is('deleted_at', null)
                .order('nombre', { ascending: true });

            if (err) throw err;
            coordinators.value = data || [];
            isLoaded.value = true;
        } catch (err) {
            console.error('Error loading coordinators:', err);
            error.value = err.message;
            showError(`Error loading coordinators: ${err.message}`);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Create coordinator
    async function createCoordinator(coordinatorData) {
        isLoading.value = true;
        error.value = null;

        try {
            const { data, error: err } = await supabase
                .from('coordinadores')
                .insert([
                    {
                        nombre: coordinatorData.nombre,
                        rut: coordinatorData.rut,
                        email: coordinatorData.email || null,
                        telefono: coordinatorData.telefono || null,
                        activo:
                            coordinatorData.activo !== undefined
                                ? coordinatorData.activo
                                : true,
                    },
                ])
                .select()
                .single();

            if (err) throw err;

            coordinators.value.push(data);
            showSuccess('Coordinator created successfully');
            return data;
        } catch (err) {
            console.error('Error creating coordinator:', err);
            error.value = err.message;
            showError(`Error creating coordinator: ${err.message}`);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Update coordinator
    async function updateCoordinator(id, coordinatorData) {
        isLoading.value = true;
        error.value = null;

        try {
            const { data, error: err } = await supabase
                .from('coordinadores')
                .update({
                    nombre: coordinatorData.nombre,
                    rut: coordinatorData.rut,
                    email: coordinatorData.email || null,
                    telefono: coordinatorData.telefono || null,
                    activo: coordinatorData.activo,
                })
                .eq('id', id)
                .select()
                .single();

            if (err) throw err;

            const index = coordinators.value.findIndex((c) => c.id === id);
            if (index !== -1) {
                coordinators.value[index] = data;
            }

            showSuccess('Coordinator updated successfully');
            return data;
        } catch (err) {
            console.error('Error updating coordinator:', err);
            error.value = err.message;
            showError(`Error updating coordinator: ${err.message}`);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Delete coordinator (soft delete)
    async function deleteCoordinator(id) {
        isLoading.value = true;
        error.value = null;

        try {
            const { error: err } = await supabase
                .from('coordinadores')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (err) throw err;

            coordinators.value = coordinators.value.filter((c) => c.id !== id);
            showSuccess('Coordinator deleted successfully');
        } catch (err) {
            console.error('Error deleting coordinator:', err);
            error.value = err.message;
            showError(`Error deleting coordinator: ${err.message}`);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Get coordinator by ID
    function getCoordinatorById(id) {
        return coordinators.value.find((c) => c.id === id && !c.deleted_at);
    }

    // Validate unique RUT
    async function validateUniqueRut(rut, excludeId = null) {
        try {
            let query = supabase
                .from('coordinadores')
                .select('id')
                .eq('rut', rut)
                .is('deleted_at', null);

            if (excludeId) {
                query = query.neq('id', excludeId);
            }

            const { data, error: err } = await query;

            if (err) throw err;
            return data.length === 0; // true if unique
        } catch (err) {
            console.error('Error validating RUT:', err);
            throw err;
        }
    }

    return {
        // State
        coordinators,
        isLoading,
        error,
        isLoaded,

        // Computed
        activeCoordinators,
        totalCoordinators,

        // Actions
        loadCoordinators,
        createCoordinator,
        updateCoordinator,
        deleteCoordinator,
        getCoordinatorById,
        validateUniqueRut,
    };
});
