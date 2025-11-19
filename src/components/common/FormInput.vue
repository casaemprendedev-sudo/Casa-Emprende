<template>
  <div class="form-group">
    <label v-if="label" :for="inputId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <div class="input-wrapper" :class="{ 'has-icon': icon }">
      <i v-if="icon" :class="['input-icon', icon]"></i>
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        @input="onInput"
        @blur="onBlur"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :class="inputClass"
        :min="min"
        :max="max"
        :step="step"
      />
      <i v-if="validationIcon" :class="['validation-icon', validationIcon]"></i>
    </div>
    <small v-if="hint && !error" class="form-text text-muted">{{ hint }}</small>
    <small v-if="error" class="form-text text-danger">
      <i class="fas fa-exclamation-circle mr-1"></i>{{ error }}
    </small>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  min: {
    type: [String, Number],
    default: undefined,
  },
  max: {
    type: [String, Number],
    default: undefined,
  },
  step: {
    type: [String, Number],
    default: undefined,
  },
  validation: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'blur']);

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`);

const inputClass = computed(() => {
  const classes = ['form-control'];
  if (props.icon) classes.push('has-icon-left');
  if (props.error) classes.push('is-invalid');
  if (props.modelValue && !props.error && props.validation) classes.push('is-valid');
  return classes.join(' ');
});

const validationIcon = computed(() => {
  if (!props.modelValue) return '';
  if (props.error) return 'fas fa-times-circle text-danger';
  if (props.validation) return 'fas fa-check-circle text-success';
  return '';
});

function onInput(event) {
  emit('update:modelValue', event.target.value);
}

function onBlur(event) {
  emit('blur', event.target.value);
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #212529;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  z-index: 2;
}

.form-control.has-icon-left {
  padding-left: 38px;
}

.validation-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 2;
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control.is-valid {
  border-color: #28a745;
  padding-right: 38px;
}

.form-control.is-valid:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
  padding-right: 38px;
}

.form-control.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.form-control:disabled {
  background-color: #e9ecef;
  opacity: 1;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}
</style>
