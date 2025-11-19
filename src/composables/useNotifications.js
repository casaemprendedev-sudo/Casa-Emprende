import { ref } from 'vue';

const notifications = ref([]);

export function useNotifications() {
    const addNotification = (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        notifications.value.push({ id, message, type });

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    };

    const removeNotification = (id) => {
        notifications.value = notifications.value.filter((n) => n.id !== id);
    };

    const showSuccess = (message) => addNotification(message, 'success');
    const showError = (message) => addNotification(message, 'error');
    const showInfo = (message) => addNotification(message, 'info');
    const showWarning = (message) => addNotification(message, 'warning');

    return {
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showInfo,
        showWarning,
    };
}
