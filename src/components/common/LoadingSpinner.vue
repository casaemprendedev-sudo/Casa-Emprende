<template>
  <div v-if="visible" class="loading-spinner-overlay" :class="{ 'overlay-fullscreen': fullscreen }">
    <div class="spinner-container">
      <div class="spinner" :class="sizeClass">
        <div class="spinner-border" :class="colorClass" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <p v-if="message" class="spinner-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'danger', 'warning', 'info'].includes(value),
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
});

const sizeClass = computed(() => {
  const sizes = {
    small: 'spinner-sm',
    medium: 'spinner-md',
    large: 'spinner-lg',
  };
  return sizes[props.size];
});

const colorClass = computed(() => `text-${props.color}`);
</script>

<style scoped>
.loading-spinner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 1000;
  border-radius: 4px;
}

.overlay-fullscreen {
  position: fixed;
  border-radius: 0;
}

.spinner-container {
  text-align: center;
}

.spinner {
  display: inline-block;
}

.spinner-sm .spinner-border {
  width: 1.5rem;
  height: 1.5rem;
  border-width: 0.2em;
}

.spinner-md .spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
}

.spinner-lg .spinner-border {
  width: 4rem;
  height: 4rem;
  border-width: 0.4em;
}

.spinner-message {
  margin-top: 16px;
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
