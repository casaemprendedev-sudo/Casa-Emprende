<template>
  <div v-if="visible" class="confirm-dialog-overlay" @click.self="onCancel">
    <div class="confirm-dialog" :class="`confirm-${type}`">
      <div class="confirm-header">
        <div class="confirm-icon">
          <i :class="iconClass"></i>
        </div>
        <h5 class="confirm-title">{{ title }}</h5>
      </div>
      <div class="confirm-body">
        <p>{{ message }}</p>
      </div>
      <div class="confirm-footer">
        <button
          type="button"
          class="btn btn-secondary"
          @click="onCancel"
        >
          {{ cancelText }}
        </button>
        <button
          type="button"
          :class="['btn', confirmButtonClass]"
          @click="onConfirm"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm mr-1"></span>
          {{ loading ? loadingText : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirm Action',
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'warning',
    validator: (value) => ['info', 'warning', 'danger', 'success'].includes(value),
  },
  confirmText: {
    type: String,
    default: 'Confirm',
  },
  cancelText: {
    type: String,
    default: 'Cancel',
  },
  loadingText: {
    type: String,
    default: 'Processing...',
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['confirm', 'cancel']);

const iconClass = computed(() => {
  const icons = {
    info: 'fas fa-info-circle text-info',
    warning: 'fas fa-exclamation-triangle text-warning',
    danger: 'fas fa-exclamation-circle text-danger',
    success: 'fas fa-check-circle text-success',
  };
  return icons[props.type];
});

const confirmButtonClass = computed(() => {
  const classes = {
    info: 'btn-info',
    warning: 'btn-warning',
    danger: 'btn-danger',
    success: 'btn-success',
  };
  return classes[props.type];
});

function onConfirm() {
  emit('confirm');
}

function onCancel() {
  if (!props.loading) {
    emit('cancel');
  }
}
</script>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.confirm-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.confirm-header {
  padding: 24px 24px 16px;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

.confirm-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.confirm-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #212529;
}

.confirm-body {
  padding: 20px 24px;
}

.confirm-body p {
  margin: 0;
  color: #6c757d;
  font-size: 15px;
  line-height: 1.6;
}

.confirm-footer {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e9ecef;
}

.confirm-footer .btn {
  min-width: 100px;
}

/* Responsive */
@media (max-width: 576px) {
  .confirm-dialog {
    width: 95%;
  }

  .confirm-footer {
    flex-direction: column-reverse;
  }

  .confirm-footer .btn {
    width: 100%;
  }
}
</style>
