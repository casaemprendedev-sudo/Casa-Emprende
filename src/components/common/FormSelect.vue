<template>
  <div class="form-group">
    <label v-if="label" :for="selectId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <div class="select-wrapper">
      <select
        :id="selectId"
        :value="modelValue"
        @change="onChange"
        :required="required"
        :disabled="disabled"
        :class="selectClass"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>
      <i class="select-arrow fas fa-chevron-down"></i>
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
  options: {
    type: Array,
    required: true,
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  placeholder: {
    type: String,
    default: 'Select an option...',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const selectId = computed(() => `select-${Math.random().toString(36).substr(2, 9)}`);

const selectClass = computed(() => {
  const classes = ['form-control', 'form-select'];
  if (props.error) classes.push('is-invalid');
  return classes.join(' ');
});

function getOptionValue(option) {
  return typeof option === 'object' ? option[props.valueKey] : option;
}

function getOptionLabel(option) {
  return typeof option === 'object' ? option[props.labelKey] : option;
}

function onChange(event) {
  const value = event.target.value;
  emit('update:modelValue', value);
  emit('change', value);
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

.select-wrapper {
  position: relative;
}

.form-select {
  display: block;
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  appearance: none;
  cursor: pointer;
}

.form-select:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-select.is-invalid {
  border-color: #dc3545;
}

.form-select.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.form-select:disabled {
  background-color: #e9ecef;
  opacity: 1;
  cursor: not-allowed;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  font-size: 12px;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}
</style>
