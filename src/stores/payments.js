import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabase';
import { useParticipationsStore } from './participations';
import { useNotifications } from '../composables/useNotifications';

export const usePaymentsStore = defineStore('payments', () => {
    const payments = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const isLoaded = ref(false);

    const { showError, showSuccess } = useNotifications();

    // Computed
    const totalPayments = computed(() => payments.value.length);

    // Load payments
    async function loadPayments(forceReload = false) {
        if (isLoaded.value && !forceReload) return;

        try {
            isLoading.value = true;
            error.value = null;

            const { data, error: err } = await supabase
                .from('abonos')
                .select(
                    `
          *,
          participacion:participaciones(
            id,
            numero_puesto,
            monto_final,
            feria:ferias(id, nombre),
            emprendimiento:emprendimientos(id, nombre_emprendimiento)
          )
        `
                )
                .order('fecha', { ascending: false });

            if (err) throw err;
            payments.value = data || [];
            isLoaded.value = true;
        } catch (err) {
            error.value = err.message;
            showError(`Error loading payments: ${err.message}`);
            console.error('Error loading payments:', err);
        } finally {
            isLoading.value = false;
        }
    }

    // Register payment
    async function registerPayment(data) {
        try {
            isLoading.value = true;
            error.value = null;

            // 1. Get next payment number
            const { data: existingPayments, error: countErr } = await supabase
                .from('abonos')
                .select('numero_abono')
                .eq('participacion_id', data.participacionId)
                .order('numero_abono', { ascending: false })
                .limit(1);

            if (countErr) throw countErr;

            const nextNumber =
                existingPayments.length > 0 ? existingPayments[0].numero_abono + 1 : 1;

            // 2. Create payment
            const { data: payment, error: err } = await supabase
                .from('abonos')
                .insert({
                    participacion_id: data.participacionId,
                    numero_abono: nextNumber,
                    fecha: data.fecha,
                    monto: data.monto,
                    banco: data.banco || null,
                    numero_operacion: data.numeroOperacion || null,
                    comprobante_url: data.comprobanteUrl || null,
                    notas: data.notas || null,
                })
                .select()
                .single();

            if (err) throw err;

            // 3. Update paid amount in participation
            const participationsStore = useParticipationsStore();
            const { data: participation } = await supabase
                .from('participaciones')
                .select('monto_pagado')
                .eq('id', data.participacionId)
                .single();

            const newPaidAmount = (participation?.monto_pagado || 0) + data.monto;
            await participationsStore.updatePaidAmount(
                data.participacionId,
                newPaidAmount
            );

            await loadPayments(true);
            showSuccess('Payment registered successfully');
            return payment;
        } catch (err) {
            error.value = err.message;
            showError(`Error registering payment: ${err.message}`);
            console.error('Error registering payment:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Update payment
    async function updatePayment(id, data) {
        try {
            isLoading.value = true;
            error.value = null;

            // 1. Get previous payment
            const { data: previousPayment } = await supabase
                .from('abonos')
                .select('monto, participacion_id')
                .eq('id', id)
                .single();

            if (!previousPayment) throw new Error('Payment not found');

            // 2. Update payment
            const { error: err } = await supabase
                .from('abonos')
                .update({
                    fecha: data.fecha,
                    monto: data.monto,
                    banco: data.banco,
                    numero_operacion: data.numeroOperacion,
                    comprobante_url: data.comprobanteUrl,
                    notas: data.notas,
                })
                .eq('id', id);

            if (err) throw err;

            // 3. Adjust paid amount if amount changed
            const amountDifference = data.monto - previousPayment.monto;
            if (amountDifference !== 0) {
                const participationsStore = useParticipationsStore();
                const { data: participation } = await supabase
                    .from('participaciones')
                    .select('monto_pagado')
                    .eq('id', previousPayment.participacion_id)
                    .single();

                const newPaidAmount =
                    (participation?.monto_pagado || 0) + amountDifference;
                await participationsStore.updatePaidAmount(
                    previousPayment.participacion_id,
                    newPaidAmount
                );
            }

            await loadPayments(true);
            showSuccess('Payment updated successfully');
        } catch (err) {
            error.value = err.message;
            showError(`Error updating payment: ${err.message}`);
            console.error('Error updating payment:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Delete payment
    async function deletePayment(id) {
        try {
            isLoading.value = true;
            error.value = null;

            // 1. Get payment data before deleting
            const { data: payment } = await supabase
                .from('abonos')
                .select('monto, participacion_id')
                .eq('id', id)
                .single();

            if (!payment) throw new Error('Payment not found');

            // 2. Delete payment
            const { error: err } = await supabase
                .from('abonos')
                .delete()
                .eq('id', id);

            if (err) throw err;

            // 3. Update paid amount in participation
            const participationsStore = useParticipationsStore();
            const { data: participation } = await supabase
                .from('participaciones')
                .select('monto_pagado')
                .eq('id', payment.participacion_id)
                .single();

            const newPaidAmount = (participation?.monto_pagado || 0) - payment.monto;
            await participationsStore.updatePaidAmount(
                payment.participacion_id,
                newPaidAmount
            );

            await loadPayments(true);
            showSuccess('Payment deleted successfully');
        } catch (err) {
            error.value = err.message;
            showError(`Error deleting payment: ${err.message}`);
            console.error('Error deleting payment:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Upload receipt (Supabase Storage)
    async function uploadReceipt(paymentId, file) {
        try {
            // Validate file
            if (!file || !file.name) {
                throw new Error('Invalid file');
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${paymentId}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error: err } = await supabase.storage
                .from('comprobantes')
                .upload(filePath, file);

            if (err) throw err;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('comprobantes')
                .getPublicUrl(filePath);

            // Update payment with receipt URL
            await supabase
                .from('abonos')
                .update({ comprobante_url: urlData.publicUrl })
                .eq('id', paymentId);

            await loadPayments(true);
            showSuccess('Receipt uploaded successfully');
            return urlData.publicUrl;
        } catch (err) {
            showError(`Error uploading receipt: ${err.message}`);
            console.error('Error uploading receipt:', err);
            throw err;
        }
    }

    // Delete receipt
    async function deleteReceipt(url) {
        try {
            // Extract path from URL
            const parts = url.split('/object/public/comprobantes/');
            if (parts.length < 2) return;
            const fileName = parts[1];

            const { error: err } = await supabase.storage
                .from('comprobantes')
                .remove([fileName]);

            if (err) throw err;
            showSuccess('Receipt deleted successfully');
        } catch (err) {
            console.error('Error deleting receipt:', err);
            showError(`Error deleting receipt: ${err.message}`);
        }
    }

    // Get payments by participation
    function getPaymentsByParticipation(participationId) {
        return payments.value.filter((p) => p.participacion_id === participationId);
    }

    // Calculate total payments
    function calculateTotalPayments(participationId) {
        const participationPayments = getPaymentsByParticipation(participationId);
        return participationPayments.reduce((sum, p) => sum + (p.monto || 0), 0);
    }

    return {
        payments,
        isLoading,
        error,
        isLoaded,
        totalPayments,
        loadPayments,
        registerPayment,
        updatePayment,
        deletePayment,
        uploadReceipt,
        deleteReceipt,
        getPaymentsByParticipation,
        calculateTotalPayments,
    };
});
