import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../composables/useNotifications';

export const useParticipationsStore = defineStore('participations', () => {
    const participations = ref([]);
    const furnitureItems = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const isLoaded = ref(false);

    const { showError, showSuccess } = useNotifications();

    // Computed
    const totalParticipations = computed(
        () => participations.value.filter((p) => !p.deleted_at).length
    );

    // Load furniture items
    async function loadFurnitureItems(forceReload = false) {
        if (furnitureItems.value.length > 0 && !forceReload) return;

        try {
            const { data, error: err } = await supabase
                .from('items_mobiliario')
                .select('*')
                .eq('activo', true)
                .order('nombre', { ascending: true });

            if (err) throw err;
            furnitureItems.value = data || [];
        } catch (err) {
            console.error('Error loading furniture items:', err);
            showError(`Error loading furniture items: ${err.message}`);
        }
    }

    // Load participations
    async function loadParticipations(forceReload = false) {
        if (isLoaded.value && !forceReload) return;

        try {
            isLoading.value = true;
            error.value = null;

            const { data, error: err } = await supabase
                .from('participaciones')
                .select(
                    `
          *,
          feria:ferias(id, nombre, fecha_inicio, fecha_fin),
          emprendimiento:emprendimientos(id, nombre_emprendimiento, nombre_emprendedor),
          mobiliario:participacion_mobiliario(
            id,
            cantidad,
            item:items_mobiliario(id, nombre, precio)
          )
        `
                )
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (err) throw err;
            participations.value = data || [];
            isLoaded.value = true;
        } catch (err) {
            error.value = err.message;
            showError(`Error loading participations: ${err.message}`);
            console.error('Error loading participations:', err);
        } finally {
            isLoading.value = false;
        }
    }

    // Add participation
    async function addParticipation(data) {
        try {
            isLoading.value = true;
            error.value = null;

            // 1. Create participation
            const { data: participation, error: err } = await supabase
                .from('participaciones')
                .insert({
                    feria_id: data.feriaId,
                    emprendimiento_id: data.emprendimientoId,
                    numero_puesto: data.numeroPuesto,
                    precio_base: data.precioBase || 0,
                    descuento_porcentaje: data.descuento || 0,
                    descuento_monto: data.descuentoMonto || 0,
                    subtotal: data.subtotal || 0,
                    cargo_mobiliario: data.cargoMobiliario || 0,
                    precio_neto: data.precioNeto || 0,
                    iva: data.iva || 0,
                    total: data.total || 0,
                    monto_final: data.montoFinal || 0,
                    monto_pagado: 0,
                    estado_pago: 'Pendiente',
                    mobiliario_extra: data.mobiliarioExtra || null,
                    observaciones: data.observaciones || null,
                })
                .select()
                .single();

            if (err) throw err;

            // 2. Associate selected furniture
            if (data.mobiliarioItems && data.mobiliarioItems.length > 0) {
                const furnitureInserts = data.mobiliarioItems.map((item) => ({
                    participacion_id: participation.id,
                    item_mobiliario_id: item.itemId,
                    cantidad: item.cantidad || 1,
                }));

                const { error: furnitureErr } = await supabase
                    .from('participacion_mobiliario')
                    .insert(furnitureInserts);

                if (furnitureErr) throw furnitureErr;
            }

            await loadParticipations(true);
            showSuccess('Participation added successfully');
            return participation;
        } catch (err) {
            error.value = err.message;
            showError(`Error adding participation: ${err.message}`);
            console.error('Error adding participation:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Update participation
    async function updateParticipation(id, data) {
        try {
            isLoading.value = true;
            error.value = null;

            const { error: err } = await supabase
                .from('participaciones')
                .update({
                    numero_puesto: data.numeroPuesto,
                    precio_base: data.precioBase,
                    descuento_porcentaje: data.descuento,
                    descuento_monto: data.descuentoMonto,
                    subtotal: data.subtotal,
                    cargo_mobiliario: data.cargoMobiliario,
                    precio_neto: data.precioNeto,
                    iva: data.iva,
                    total: data.total,
                    monto_final: data.montoFinal,
                    mobiliario_extra: data.mobiliarioExtra,
                    observaciones: data.observaciones,
                })
                .eq('id', id);

            if (err) throw err;

            // Update furniture if provided
            if (data.mobiliarioItems !== undefined) {
                // Delete existing furniture
                await supabase
                    .from('participacion_mobiliario')
                    .delete()
                    .eq('participacion_id', id);

                // Insert new furniture
                if (data.mobiliarioItems.length > 0) {
                    const furnitureInserts = data.mobiliarioItems.map((item) => ({
                        participacion_id: id,
                        item_mobiliario_id: item.itemId,
                        cantidad: item.cantidad || 1,
                    }));

                    await supabase
                        .from('participacion_mobiliario')
                        .insert(furnitureInserts);
                }
            }

            await loadParticipations(true);
            showSuccess('Participation updated successfully');
        } catch (err) {
            error.value = err.message;
            showError(`Error updating participation: ${err.message}`);
            console.error('Error updating participation:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Delete participation (soft delete)
    async function deleteParticipation(id) {
        try {
            isLoading.value = true;
            error.value = null;

            const { error: err } = await supabase
                .from('participaciones')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (err) throw err;

            await loadParticipations(true);
            showSuccess('Participation deleted successfully');
        } catch (err) {
            error.value = err.message;
            showError(`Error deleting participation: ${err.message}`);
            console.error('Error deleting participation:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Update paid amount
    async function updatePaidAmount(participationId, newAmount) {
        try {
            isLoading.value = true;
            error.value = null;

            const participation = participations.value.find(
                (p) => p.id === participationId
            );
            if (!participation) throw new Error('Participation not found');

            let paymentStatus = 'Pendiente';
            if (newAmount >= participation.monto_final) {
                paymentStatus = 'Completo';
            } else if (newAmount > 0) {
                paymentStatus = 'Parcial';
            }

            const { error: err } = await supabase
                .from('participaciones')
                .update({
                    monto_pagado: newAmount,
                    estado_pago: paymentStatus,
                })
                .eq('id', participationId);

            if (err) throw err;

            await loadParticipations(true);
        } catch (err) {
            error.value = err.message;
            showError(`Error updating paid amount: ${err.message}`);
            console.error('Error updating paid amount:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Get participation by ID
    function getParticipationById(id) {
        return participations.value.find((p) => p.id === id);
    }

    // Get participations by fair
    function getParticipationsByFair(fairId) {
        return participations.value.filter(
            (p) => !p.deleted_at && p.feria_id === fairId
        );
    }

    // Get participations by business
    function getParticipationsByBusiness(businessId) {
        return participations.value.filter(
            (p) => !p.deleted_at && p.emprendimiento_id === businessId
        );
    }

    // Calculate fair income
    function calculateFairIncome(fairId) {
        const fairParticipations = getParticipationsByFair(fairId);
        return fairParticipations.reduce(
            (sum, p) => sum + (p.monto_pagado || 0),
            0
        );
    }

    // Calculate expected income
    function calculateExpectedIncome(fairId) {
        const fairParticipations = getParticipationsByFair(fairId);
        return fairParticipations.reduce(
            (sum, p) => sum + (p.monto_final || 0),
            0
        );
    }

    // Calculate prices
    function calculatePrices(
        basePrice,
        discountPercentage,
        furnitureCharge = 0
    ) {
        const discountAmount = (basePrice * discountPercentage) / 100;
        const subtotal = basePrice - discountAmount;
        const netPrice = subtotal + furnitureCharge;
        const tax = netPrice * 0.19;
        const total = netPrice + tax;

        return {
            basePrice,
            discountPercentage,
            discountAmount: Math.round(discountAmount),
            subtotal: Math.round(subtotal),
            furnitureCharge,
            netPrice: Math.round(netPrice),
            tax: Math.round(tax),
            total: Math.round(total),
            finalAmount: Math.round(total),
        };
    }

    return {
        participations,
        furnitureItems,
        isLoading,
        error,
        isLoaded,
        totalParticipations,
        loadFurnitureItems,
        loadParticipations,
        addParticipation,
        updateParticipation,
        deleteParticipation,
        updatePaidAmount,
        getParticipationById,
        getParticipationsByFair,
        getParticipationsByBusiness,
        calculateFairIncome,
        calculateExpectedIncome,
        calculatePrices,
    };
});
