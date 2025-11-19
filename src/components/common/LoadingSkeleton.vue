<template>
  <div v-if="visible" class="skeleton-loader">
    <!-- Table Skeleton -->
    <div v-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-row skeleton-header">
        <div v-for="i in columns" :key="'header-' + i" class="skeleton-cell skeleton-shimmer"></div>
      </div>
      <div v-for="i in rows" :key="'row-' + i" class="skeleton-row">
        <div v-for="j in columns" :key="'cell-' + j" class="skeleton-cell skeleton-shimmer"></div>
      </div>
    </div>

    <!-- Card Skeleton -->
    <div v-else-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-card-header skeleton-shimmer"></div>
      <div class="skeleton-card-body">
        <div v-for="i in rows" :key="'line-' + i" class="skeleton-line skeleton-shimmer"></div>
      </div>
    </div>

    <!-- Stats Skeleton -->
    <div v-else-if="type === 'stats'" class="skeleton-stats">
      <div v-for="i in 4" :key="'stat-' + i" class="skeleton-stat-box">
        <div class="skeleton-stat-value skeleton-shimmer"></div>
        <div class="skeleton-stat-label skeleton-shimmer"></div>
      </div>
    </div>

    <!-- Form Skeleton -->
    <div v-else-if="type === 'form'" class="skeleton-form">
      <div v-for="i in rows" :key="'field-' + i" class="skeleton-form-field">
        <div class="skeleton-label skeleton-shimmer"></div>
        <div class="skeleton-input skeleton-shimmer"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'table',
    validator: (value) => ['table', 'card', 'stats', 'form'].includes(value),
  },
  rows: {
    type: Number,
    default: 5,
  },
  columns: {
    type: Number,
    default: 4,
  },
  visible: {
    type: Boolean,
    default: true,
  },
});
</script>

<style scoped>
.skeleton-loader {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Shimmer animation */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 20%,
    #f0f0f0 40%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}

/* Table Skeleton */
.skeleton-table {
  width: 100%;
  border-collapse: collapse;
}

.skeleton-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.skeleton-header .skeleton-cell {
  height: 40px;
  background: linear-gradient(
    90deg,
    #e0e0e0 0%,
    #d0d0d0 20%,
    #e0e0e0 40%,
    #e0e0e0 100%
  );
}

.skeleton-cell {
  flex: 1;
  height: 50px;
  border-radius: 4px;
}

/* Card Skeleton */
.skeleton-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-card-header {
  height: 60px;
  border-bottom: 1px solid #e0e0e0;
}

.skeleton-card-body {
  padding: 20px;
}

.skeleton-line {
  height: 16px;
  margin-bottom: 12px;
  border-radius: 4px;
}

.skeleton-line:last-child {
  width: 60%;
}

/* Stats Skeleton */
.skeleton-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.skeleton-stat-box {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.skeleton-stat-value {
  height: 40px;
  width: 80px;
  margin-bottom: 12px;
  border-radius: 4px;
}

.skeleton-stat-label {
  height: 20px;
  width: 120px;
  border-radius: 4px;
}

/* Form Skeleton */
.skeleton-form {
  max-width: 600px;
}

.skeleton-form-field {
  margin-bottom: 20px;
}

.skeleton-label {
  height: 16px;
  width: 120px;
  margin-bottom: 8px;
  border-radius: 4px;
}

.skeleton-input {
  height: 40px;
  width: 100%;
  border-radius: 4px;
}
</style>
