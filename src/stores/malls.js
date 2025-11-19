import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../composables/useNotifications';

export const useMallsStore = defineStore('malls', () => {
    const malls = ref([]);
    const zones = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const isLoaded = ref(false);

    const { showError, showSuccess } = useNotifications();

    // Computed
    const totalMalls = computed(() => malls.value.length);
    const activeMalls = computed(() => malls.value.filter((m) => m.activo !== false));

    // Load malls from Supabase
    async function loadMalls(forceReload = false) {
        if (isLoaded.value && !forceReload) return;

        isLoading.value = true;
        error.value = null;
        try {
            const { data, error: err } = await supabase
                .from('centros_comerciales')
                .select('*')
                .is('deleted_at', null)
                .order('nombre');

            if (err) throw err;
            malls.value = data || [];
            isLoaded.value = true;
        } catch (err) {
            error.value = err.message;
            showError(`Error loading malls: ${err.message}`);
            console.error('Error loading malls:', err);
        } finally {
            isLoading.value = false;
        }
    }

    // Load zones from Supabase
    async function loadZones(forceReload = false) {
        if (zones.value.length > 0 && !forceReload) return;

        isLoading.value = true;
        error.value = null;
        try {
            const { data, error: err } = await supabase
                .from('zonas')
                .select('*')
                .is('deleted_at', null)
                .order('nombre');

            if (err) throw err;
            zones.value = data || [];
        } catch (err) {
            error.value = err.message;
            showError(`Error loading zones: ${err.message}`);
            console.error('Error loading zones:', err);
        } finally {
            isLoading.value = false;
        }
    }

    // Add mall
    async function addMall(data) {
        isLoading.value = true;
        error.value = null;
        try {
            const { data: mall, error: err } = await supabase
                .from('centros_comerciales')
                .insert([
                    {
                        nombre: data.nombre,
                        direccion: data.direccion || null,
                        telefono: data.telefono || null,
                        email: data.email || null,
                    },
                ])
                .select()
                .single();

            if (err) throw err;
            malls.value.push(mall);
            showSuccess('Mall added successfully');
            return mall;
        } catch (err) {
            error.value = err.message;
            showError(`Error adding mall: ${err.message}`);
            console.error('Error adding mall:', err);
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    // Add zone
    async function addZone(mallId, zoneData) {
        isLoading.value = true;
        error.value = null;
        try {
            const { data: zone, error: err } = await supabase
                .from('zonas')
                .insert([
                    {
                        centro_comercial_id: mallId,
                        nombre: zoneData.nombre,
                        capacidad_maxima: zoneData.capacidadMaxima || null,
                        descripcion: zoneData.descripcion || null,
                    },
                ])
                .select()
                .single();

            if (err) throw err;
            zones.value.push(zone);
            showSuccess('Zone added successfully');
            return zone;
        } catch (err) {
            error.value = err.message;
            showError(`Error adding zone: ${err.message}`);
            console.error('Error adding zone:', err);
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    // Update mall
    async function updateMall(id, data) {
        isLoading.value = true;
        error.value = null;
        try {
            const { data: mall, error: err } = await supabase
                .from('centros_comerciales')
                .update({
                    nombre: data.nombre,
                    direccion: data.direccion,
                    telefono: data.telefono,
                    email: data.email,
                })
                .eq('id', id)
                .select()
                .single();

            if (err) throw err;

            const index = malls.value.findIndex((m) => m.id === id);
            if (index !== -1) {
                malls.value[index] = mall;
            }
            showSuccess('Mall updated successfully');
            return mall;
        } catch (err) {
            error.value = err.message;
            showError(`Error updating mall: ${err.message}`);
            console.error('Error updating mall:', err);
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    // Update zone
    async function updateZone(mallId, zoneId, data) {
        isLoading.value = true;
        error.value = null;
        try {
            const { data: zone, error: err } = await supabase
                .from('zonas')
                .update({
                    nombre: data.nombre,
                    capacidad_maxima: data.capacidadMaxima,
                    descripcion: data.descripcion,
                })
                .eq('id', zoneId)
                .select()
                .single();

            if (err) throw err;

            const index = zones.value.findIndex((z) => z.id === zoneId);
            if (index !== -1) {
                zones.value[index] = zone;
            }
            showSuccess('Zone updated successfully');
            return zone;
        } catch (err) {
            error.value = err.message;
            showError(`Error updating zone: ${err.message}`);
            console.error('Error updating zone:', err);
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    // Delete mall (soft delete)
    async function deleteMall(id) {
        isLoading.value = true;
        error.value = null;
        try {
            const { error: err } = await supabase
                .from('centros_comerciales')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (err) throw err;

            const index = malls.value.findIndex((m) => m.id === id);
            if (index !== -1) {
                malls.value.splice(index, 1);
            }
            showSuccess('Mall deleted successfully');
            return true;
        } catch (err) {
            error.value = err.message;
            showError(`Error deleting mall: ${err.message}`);
            console.error('Error deleting mall:', err);
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    // Delete zone (soft delete)
    async function deleteZone(mallId, zoneId) {
        isLoading.value = true;
        error.value = null;
        try {
            const { error: err } = await supabase
                .from('zonas')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', zoneId);

            if (err) throw err;

            const index = zones.value.findIndex((z) => z.id === zoneId);
            if (index !== -1) {
                zones.value.splice(index, 1);
            }
            showSuccess('Zone deleted successfully');
            return true;
        } catch (err) {
            error.value = err.message;
            showError(`Error deleting zone: ${err.message}`);
            console.error('Error deleting zone:', err);
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    // Get mall by ID
    function getMallById(id) {
        return malls.value.find((m) => m.id === id);
    }

    // Get zones by mall
    function getZonesByMall(mallId) {
        return zones.value.filter((z) => z.centro_comercial_id === mallId);
    }

    return {
        malls,
        zones,
        isLoading,
        error,
        isLoaded,
        totalMalls,
        activeMalls,
        loadMalls,
        loadZones,
        addMall,
        addZone,
        updateMall,
        updateZone,
        deleteMall,
        deleteZone,
        getMallById,
        getZonesByMall,
    };
});
