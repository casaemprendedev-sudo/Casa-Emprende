import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../composables/useNotifications';

export const FAIR_STATES = [
    'Planificada',
    'Montada',
    'En Curso',
    'Desmontada',
    'Cancelada',
];

export const useFairsStore = defineStore('fairs', () => {
    const fairs = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const isLoaded = ref(false);

    const { showError, showSuccess } = useNotifications();

    // Computed
    const totalFairs = computed(() => fairs.value.filter((f) => !f.deleted_at).length);

    const activeFairs = computed(() => {
        return fairs.value.filter(
            (f) => !f.deleted_at && (f.estado === 'En Curso' || f.estado === 'Montada')
        );
    });

    // Load fairs
    async function loadFairs(forceReload = false) {
        if (isLoaded.value && !forceReload) return;

        try {
            isLoading.value = true;
            error.value = null;

            const { data, error: err } = await supabase
                .from('ferias')
                .select(
                    `
          *,
          centro:centros_comerciales(id, nombre),
          zona:zonas(id, nombre),
          coordinador:coordinadores(id, nombre, rut, telefono, email),
          gastos:gastos_feria(*)
        `
                )
                .is('deleted_at', null)
                .order('fecha_inicio', { ascending: false });

            if (err) throw err;
            fairs.value = data || [];
            isLoaded.value = true;
        } catch (err) {
            error.value = err.message;
            showError(`Error loading fairs: ${err.message}`);
            console.error('Error loading fairs:', err);
        } finally {
            isLoading.value = false;
        }
    }

    // Add fair
    async function addFair(data) {
        try {
            isLoading.value = true;
            error.value = null;

            // 1. Create fair
            const { data: fair, error: err } = await supabase
                .from('ferias')
                .insert({
                    nombre: data.nombre,
                    fecha_inicio: data.fechaInicio,
                    fecha_fin: data.fechaFin,
                    centro_comercial_id: data.centroComercialId,
                    zona_id: data.zonaId,
                    coordinador_id: data.coordinadorId || null,
                    limite_puestos: data.limitePuestos,
                    precio_base_puesto: data.precioBasePuesto || 0,
                    moneda: data.moneda || 'CLP',
                    valor_uf: data.valorUF || null,
                    estado: 'Planificada',
                    notas: data.notas || null,
                })
                .select(
                    `
          *,
          centro:centros_comerciales(id, nombre),
          zona:zonas(id, nombre),
          coordinador:coordinadores(id, nombre, rut, telefono, email)
        `
                )
                .single();

            if (err) throw err;

            // 2. Create initial expenses if provided
            if (data.gastos) {
                const expenses = [];
                if (data.gastos.coordinadores > 0) {
                    expenses.push({
                        feria_id: fair.id,
                        categoria: 'coordinadores',
                        monto: data.gastos.coordinadores,
                        descripcion: 'Coordinator expenses',
                    });
                }
                if (data.gastos.montaje > 0) {
                    expenses.push({
                        feria_id: fair.id,
                        categoria: 'montaje',
                        monto: data.gastos.montaje,
                        descripcion: 'Setup expenses',
                    });
                }
                if (data.gastos.flete > 0) {
                    expenses.push({
                        feria_id: fair.id,
                        categoria: 'flete',
                        monto: data.gastos.flete,
                        descripcion: 'Freight expenses',
                    });
                }
                if (data.gastos.otros > 0) {
                    expenses.push({
                        feria_id: fair.id,
                        categoria: 'otros',
                        monto: data.gastos.otros,
                        descripcion: 'Other expenses',
                    });
                }

                if (expenses.length > 0) {
                    await supabase.from('gastos_feria').insert(expenses);
                }
            }

            await loadFairs(true);
            showSuccess('Fair added successfully');
            return fair;
        } catch (err) {
            error.value = err.message;
            showError(`Error adding fair: ${err.message}`);
            console.error('Error adding fair:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Update fair
    async function updateFair(id, data) {
        try {
            isLoading.value = true;
            error.value = null;

            const { error: err } = await supabase
                .from('ferias')
                .update({
                    nombre: data.nombre,
                    fecha_inicio: data.fechaInicio,
                    fecha_fin: data.fechaFin,
                    centro_comercial_id: data.centroComercialId,
                    zona_id: data.zonaId,
                    coordinador_id: data.coordinadorId || null,
                    limite_puestos: data.limitePuestos,
                    precio_base_puesto: data.precioBasePuesto,
                    moneda: data.moneda,
                    valor_uf: data.valorUF,
                    notas: data.notas,
                })
                .eq('id', id);

            if (err) throw err;

            await loadFairs(true);
            showSuccess('Fair updated successfully');
        } catch (err) {
            error.value = err.message;
            showError(`Error updating fair: ${err.message}`);
            console.error('Error updating fair:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Change state
    async function changeState(id, newState) {
        try {
            if (!FAIR_STATES.includes(newState)) {
                throw new Error('Invalid state');
            }

            isLoading.value = true;
            error.value = null;

            // Trigger registrar_cambio_estado_feria will automatically
            // insert into historial_estados_feria
            const { error: err } = await supabase
                .from('ferias')
                .update({ estado: newState })
                .eq('id', id);

            if (err) throw err;

            await loadFairs(true);
            showSuccess('Fair state changed successfully');
        } catch (err) {
            error.value = err.message;
            showError(`Error changing state: ${err.message}`);
            console.error('Error changing state:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Delete fair (soft delete)
    async function deleteFair(id) {
        try {
            isLoading.value = true;
            error.value = null;

            const { error: err } = await supabase
                .from('ferias')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (err) throw err;

            await loadFairs(true);
            showSuccess('Fair deleted successfully');
        } catch (err) {
            error.value = err.message;
            showError(`Error deleting fair: ${err.message}`);
            console.error('Error deleting fair:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Add expense
    async function addExpense(fairId, expense) {
        try {
            isLoading.value = true;
            error.value = null;

            const { error: err } = await supabase.from('gastos_feria').insert({
                feria_id: fairId,
                categoria: expense.categoria,
                descripcion: expense.descripcion,
                monto: expense.monto,
                fecha: expense.fecha || new Date().toISOString().split('T')[0],
                comprobante_url: expense.comprobanteUrl || null,
            });

            if (err) throw err;

            await loadFairs(true);
            showSuccess('Expense added successfully');
        } catch (err) {
            error.value = err.message;
            showError(`Error adding expense: ${err.message}`);
            console.error('Error adding expense:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Update expense
    async function updateExpense(expenseId, data) {
        try {
            isLoading.value = true;
            error.value = null;

            const { error: err } = await supabase
                .from('gastos_feria')
                .update({
                    categoria: data.categoria,
                    descripcion: data.descripcion,
                    monto: data.monto,
                    fecha: data.fecha,
                    comprobante_url: data.comprobanteUrl,
                })
                .eq('id', expenseId);

            if (err) throw err;

            await loadFairs(true);
            showSuccess('Expense updated successfully');
        } catch (err) {
            error.value = err.message;
            showError(`Error updating expense: ${err.message}`);
            console.error('Error updating expense:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Delete expense
    async function deleteExpense(expenseId) {
        try {
            isLoading.value = true;
            error.value = null;

            const { error: err } = await supabase
                .from('gastos_feria')
                .delete()
                .eq('id', expenseId);

            if (err) throw err;

            await loadFairs(true);
            showSuccess('Expense deleted successfully');
        } catch (err) {
            error.value = err.message;
            showError(`Error deleting expense: ${err.message}`);
            console.error('Error deleting expense:', err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Get state history
    async function getStateHistory(fairId) {
        try {
            const { data, error: err } = await supabase
                .from('historial_estados_feria')
                .select('*')
                .eq('feria_id', fairId)
                .order('fecha_cambio', { ascending: false });

            if (err) throw err;
            return data || [];
        } catch (err) {
            console.error('Error getting state history:', err);
            return [];
        }
    }

    // Get fair by ID
    function getFairById(id) {
        return fairs.value.find((f) => f.id === id);
    }

    // Calculate total expenses
    function calculateTotalExpenses(fair) {
        if (!fair.gastos || fair.gastos.length === 0) return 0;
        return fair.gastos.reduce((total, expense) => total + (expense.monto || 0), 0);
    }

    // Load coordinator attendance
    async function loadAttendance(fairId) {
        try {
            const { data, error: err } = await supabase
                .from('asistencia_coordinadores')
                .select('*')
                .eq('feria_id', fairId)
                .order('fecha', { ascending: true });

            if (err) throw err;
            return data || [];
        } catch (err) {
            console.error('Error loading attendance:', err);
            throw err;
        }
    }

    // Save attendance
    async function saveAttendance(
        fairId,
        coordinatorId,
        date,
        attended,
        observations = null
    ) {
        try {
            // Try to update first
            const { data: existing } = await supabase
                .from('asistencia_coordinadores')
                .select('id')
                .eq('feria_id', fairId)
                .eq('coordinador_id', coordinatorId)
                .eq('fecha', date)
                .single();

            if (existing) {
                // Update existing
                const { error: err } = await supabase
                    .from('asistencia_coordinadores')
                    .update({
                        asistio: attended,
                        observaciones: observations,
                    })
                    .eq('id', existing.id);

                if (err) throw err;
            } else {
                // Create new
                const { error: err } = await supabase
                    .from('asistencia_coordinadores')
                    .insert({
                        feria_id: fairId,
                        coordinador_id: coordinatorId,
                        fecha: date,
                        asistio: attended,
                        observaciones: observations,
                    });

                if (err) throw err;
            }
            showSuccess('Attendance saved successfully');
        } catch (err) {
            console.error('Error saving attendance:', err);
            showError(`Error saving attendance: ${err.message}`);
            throw err;
        }
    }

    // Save multiple attendances
    async function saveMultipleAttendances(attendances) {
        try {
            const { error: err } = await supabase
                .from('asistencia_coordinadores')
                .upsert(
                    attendances.map((a) => ({
                        feria_id: a.feria_id,
                        coordinador_id: a.coordinador_id,
                        fecha: a.fecha,
                        asistio: a.asistio,
                        observaciones: a.observaciones || null,
                    })),
                    {
                        onConflict: 'feria_id,coordinador_id,fecha',
                    }
                );

            if (err) throw err;
            showSuccess('Attendances saved successfully');
        } catch (err) {
            console.error('Error saving multiple attendances:', err);
            showError(`Error saving attendances: ${err.message}`);
            throw err;
        }
    }

    return {
        fairs,
        isLoading,
        error,
        isLoaded,
        totalFairs,
        activeFairs,
        loadFairs,
        addFair,
        updateFair,
        changeState,
        deleteFair,
        addExpense,
        updateExpense,
        deleteExpense,
        getStateHistory,
        getFairById,
        calculateTotalExpenses,
        loadAttendance,
        saveAttendance,
        saveMultipleAttendances,
        FAIR_STATES,
    };
});
