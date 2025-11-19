<script setup>
import { useNotifications } from '../../composables/useNotifications';

const { notifications, removeNotification } = useNotifications();

const getTypeClass = (type) => {
  switch (type) {
    case 'success': return 'bg-success';
    case 'error': return 'bg-danger';
    case 'warning': return 'bg-warning';
    case 'info': return 'bg-info';
    default: return 'bg-primary';
  }
};

const getIconClass = (type) => {
  switch (type) {
    case 'success': return 'fas fa-check-circle';
    case 'error': return 'fas fa-exclamation-circle';
    case 'warning': return 'fas fa-exclamation-triangle';
    case 'info': return 'fas fa-info-circle';
    default: return 'fas fa-bell';
  }
};
</script>

<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="toast show"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div :class="['toast-header text-white', getTypeClass(notification.type)]">
        <i :class="[getIconClass(notification.type), 'me-2']"></i>
        <strong class="me-auto">Casa Emprende</strong>
        <button
          type="button"
          class="btn-close btn-close-white"
          @click="removeNotification(notification.id)"
          aria-label="Close"
        ></button>
      </div>
      <div class="toast-body bg-white text-dark">
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  pointer-events: none;
}
.toast {
  pointer-events: auto;
  margin-bottom: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}
</style>
