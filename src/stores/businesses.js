import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../composables/useNotifications';

export const useBusinessesStore = defineStore('businesses', () => {
    const businesses = ref([]);
    const categories = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const isLoaded = ref(false);

    const { showError, showSuccess } = useNotifications();

    // Computed
    const totalBusinesses = computed(
        () => businesses.value.filter((b) => !b.deleted_at && b.activo).length
    );

    const businessesByCategory = computed(() => {
        return businesses.value
            .filter((b) => !b.deleted_at && b.activo)
            .reduce((acc, business) => {
                const categoryName = business.categoria?.nombre || 'Uncategorized';
                if (!acc[categoryName]) acc[categoryName] = [];
                acc[categoryName].push(business);
                return acc;
            }, {});
    });

    // Load categories
    async function loadCategories(forceReload = false) {
        if (categories.value.length > 0 && !forceReload) return;

        try {
            isLoading.value = true;
            error.value = null;

            const { data, error: err } = await supabase
                .from('categorias_emprendimiento')
                .select('*')
                .eq('activo', true)
                .order('orden', { ascending: true });

            if (err) throw err;
            categories.value = data || [];
        } catch (err) {
            error.value = err.message;
            showError(`Error loading categories: ${err.message}`);
            console.error('Error loading categories:', err);
        } finally {
            isLoading.value = false;
        }
    }

    // Load businesses
    async function loadBusinesses(forceReload = false) {
        if (isLoaded.value && !forceReload) return;

        try {
            isLoading.value = true;
            error.value = null;

            const { data, error: err } = await supabase
                .from('emprendimientos')
                .select(
                    `
          *,
          categoria:categorias_emprendimiento(id, nombre),
          contactos(*)
        `
                )
                .is('deleted_at', null)
                .order('nombre_emprendimiento', { ascending: true });

            if (err) throw err;
            businesses.value = data || [];
            isLoaded.value = true;
        } catch (err) {
            error.value = err.message;
            showError(`Error loading businesses: ${err.message}`);
            console.error('Error loading businesses:', err);
        } finally {
            isLoading.value = false;
        }
    }

    // Add business
    async function addBusiness(data) {
        try {
            isLoading.value = true;
            error.value = null;

            // 1. Create business
            const { data: business, error: err } = await supabase
                .from('emprendimientos')
                .insert({
                    nombre_emprendedor: data.nombreEmprendedor,
                    rut: data.rut,
                    email: data.correo,
                    telefono: data.telefono,
                    nombre_emprendimiento: data.nombreEmprendimiento,
                    categoria_id: data.categoriaId,
                    descripcion: data.descripcion || null,
                    instagram: data.instagram || null,
                    activo: true,
                })
                .select(
                    `
          *,
          categoria:categorias_emprendimiento(id, nombre)
        `
                )
                .single();

            if (err) throw err;

            // 2. Create main contact
            const { error: mainContactErr } = await supabase
                .from('contactos')
                .insert({
                    emprendimiento_id: business.id,
                    tipo: 'principal',
                    nombre: data.nombreEmprendedor,
                    telefono: data.telefono,
                    email: data.correo,
                    es_principal: true,
                });

            if (mainContactErr) throw mainContactErr;

            // 3. Create payment contact if different
            if (data.contactoPagos?.nombre) {
                const { error: paymentContactErr } = await supabase
                    .from('contactos')
                    .insert({
                        emprendimiento_id: business.id,
                        tipo: 'pagos',
                        nombre: data.contactoPagos.nombre,
                        telefono: data.contactoPagos.telefono || null,
                        email: data.contactoPagos.correo || null,
                        es_principal: false,
                    });

                if (paymentContactErr) throw paymentContactErr;
            }

            await loadBusinesses(true);
            showSuccess('Business added successfully');
            return business;
        } catch (err) {
            error.value = err.message;
            showError(`Error adding business: ${err.message}`);
            console.error('Error adding business:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Update business
    async function updateBusiness(id, data) {
        try {
            isLoading.value = true;
            error.value = null;

            // 1. Update business
            const { error: err } = await supabase
                .from('emprendimientos')
                .update({
                    nombre_emprendedor: data.nombreEmprendedor,
                    rut: data.rut,
                    email: data.correo,
                    telefono: data.telefono,
                    nombre_emprendimiento: data.nombreEmprendimiento,
                    categoria_id: data.categoriaId,
                    descripcion: data.descripcion,
                    instagram: data.instagram,
                    activo: data.activo,
                })
                .eq('id', id);

            if (err) throw err;

            // 2. Update main contact
            const { error: mainContactErr } = await supabase
                .from('contactos')
                .update({
                    nombre: data.nombreEmprendedor,
                    telefono: data.telefono,
                    email: data.correo,
                })
                .eq('emprendimiento_id', id)
                .eq('tipo', 'principal');

            if (mainContactErr) throw mainContactErr;

            // 3. Update or create payment contact
            if (data.contactoPagos?.nombre) {
                const { data: existing } = await supabase
                    .from('contactos')
                    .select('id')
                    .eq('emprendimiento_id', id)
                    .eq('tipo', 'pagos')
                    .single();

                if (existing) {
                    await supabase
                        .from('contactos')
                        .update({
                            nombre: data.contactoPagos.nombre,
                            telefono: data.contactoPagos.telefono,
                            email: data.contactoPagos.correo,
                        })
                        .eq('id', existing.id);
                } else {
                    await supabase.from('contactos').insert({
                        emprendimiento_id: id,
                        tipo: 'pagos',
                        nombre: data.contactoPagos.nombre,
                        telefono: data.contactoPagos.telefono,
                        email: data.contactoPagos.correo,
                        es_principal: false,
                    });
                }
            }

            await loadBusinesses(true);
            showSuccess('Business updated successfully');
        } catch (err) {
            error.value = err.message;
            showError(`Error updating business: ${err.message}`);
            console.error('Error updating business:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Delete business (soft delete)
    async function deleteBusiness(id) {
        try {
            isLoading.value = true;
            error.value = null;

            const { error: err } = await supabase
                .from('emprendimientos')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (err) throw err;

            await loadBusinesses(true);
            showSuccess('Business deleted successfully');
        } catch (err) {
            error.value = err.message;
            showError(`Error deleting business: ${err.message}`);
            console.error('Error deleting business:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Get business by ID
    function getBusinessById(id) {
        return businesses.value.find((b) => b.id === id);
    }

    // Search by name
    function searchByName(text) {
        const search = text.toLowerCase();
        return businesses.value.filter(
            (b) =>
                !b.deleted_at &&
                (b.nombre_emprendimiento?.toLowerCase().includes(search) ||
                    b.nombre_emprendedor?.toLowerCase().includes(search) ||
                    b.rut?.toLowerCase().includes(search))
        );
    }

    return {
        businesses,
        categories,
        isLoading,
        error,
        isLoaded,
        totalBusinesses,
        businessesByCategory,
        loadCategories,
        loadBusinesses,
        addBusiness,
        updateBusiness,
        deleteBusiness,
        getBusinessById,
        searchByName,
    };
});
