<template>
  <div class="data-table-wrapper">
    <!-- Search Bar -->
    <div v-if="searchable" class="data-table-search mb-3">
      <div class="input-group">
        <span class="input-group-text">
          <i class="fas fa-search"></i>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          class="form-control"
          :placeholder="searchPlaceholder"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="table table-hover data-table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="{ 'sortable': sortable && column.sortable !== false }"
              @click="sortable && column.sortable !== false && toggleSort(column.key)"
            >
              {{ column.label }}
              <i
                v-if="sortable && column.sortable !== false"
                :class="getSortIcon(column.key)"
                class="ml-1"
              ></i>
            </th>
            <th v-if="actions && actions.length" class="actions-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedData.length === 0">
            <td :colspan="columns.length + (actions ? 1 : 0)" class="text-center py-5">
              <div class="empty-state">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <p class="text-muted">{{ emptyMessage }}</p>
              </div>
            </td>
          </tr>
          <tr v-for="(row, index) in paginatedData" :key="index" class="data-row">
            <td v-for="column in columns" :key="column.key">
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ formatCell(row[column.key], column) }}
              </slot>
            </td>
            <td v-if="actions && actions.length" class="actions-cell">
              <div class="btn-group btn-group-sm">
                <button
                  v-for="action in actions"
                  :key="action.name"
                  :class="['btn', action.class || 'btn-primary']"
                  :title="action.label"
                  @click="action.handler(row)"
                >
                  <i v-if="action.icon" :class="action.icon"></i>
                  <span v-if="!action.icon">{{ action.label }}</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="paginated && filteredData.length > perPage" class="data-table-pagination">
      <div class="pagination-info">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} entries
      </div>
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">
              <i class="fas fa-chevron-left"></i>
            </a>
          </li>
          <li
            v-for="page in visiblePages"
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">
              <i class="fas fa-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  searchable: {
    type: Boolean,
    default: true,
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...',
  },
  sortable: {
    type: Boolean,
    default: true,
  },
  paginated: {
    type: Boolean,
    default: true,
  },
  perPage: {
    type: Number,
    default: 10,
  },
  actions: {
    type: Array,
    default: () => [],
  },
  emptyMessage: {
    type: String,
    default: 'No data available',
  },
});

const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref('asc');
const currentPage = ref(1);

// Filtered data based on search
const filteredData = computed(() => {
  if (!searchQuery.value) return props.data;

  const query = searchQuery.value.toLowerCase();
  return props.data.filter((row) => {
    return props.columns.some((column) => {
      const value = row[column.key];
      return value && value.toString().toLowerCase().includes(query);
    });
  });
});

// Sorted data
const sortedData = computed(() => {
  if (!sortKey.value) return filteredData.value;

  return [...filteredData.value].sort((a, b) => {
    const aVal = a[sortKey.value];
    const bVal = b[sortKey.value];

    if (aVal === bVal) return 0;

    const comparison = aVal > bVal ? 1 : -1;
    return sortOrder.value === 'asc' ? comparison : -comparison;
  });
});

// Paginated data
const totalPages = computed(() => Math.ceil(filteredData.value.length / props.perPage));
const startIndex = computed(() => (currentPage.value - 1) * props.perPage);
const endIndex = computed(() => Math.min(startIndex.value + props.perPage, filteredData.value.length));

const paginatedData = computed(() => {
  if (!props.paginated) return sortedData.value;
  return sortedData.value.slice(startIndex.value, endIndex.value);
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

function toggleSort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

function getSortIcon(key) {
  if (sortKey.value !== key) return 'fas fa-sort text-muted';
  return sortOrder.value === 'asc' ? 'fas fa-sort-up text-primary' : 'fas fa-sort-down text-primary';
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function formatCell(value, column) {
  if (column.format) {
    return column.format(value);
  }
  return value;
}
</script>

<style scoped>
.data-table-wrapper {
  background: white;
  border-radius: 8px;
  padding: 1rem;
}

.data-table-search .input-group-text {
  background-color: #f8f9fa;
  border-right: 0;
}

.data-table-search .form-control {
  border-left: 0;
}

.data-table-search .form-control:focus {
  box-shadow: none;
  border-color: #ced4da;
}

.table-responsive {
  border-radius: 4px;
  overflow: hidden;
}

.data-table {
  margin-bottom: 0;
}

.data-table thead th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  padding: 12px;
  white-space: nowrap;
}

.data-table thead th.sortable {
  cursor: pointer;
  user-select: none;
}

.data-table thead th.sortable:hover {
  background-color: #e9ecef;
}

.data-table tbody td {
  padding: 12px;
  vertical-align: middle;
}

.data-table .data-row {
  transition: background-color 0.2s;
}

.data-table .data-row:hover {
  background-color: #f8f9fa;
}

.actions-column {
  width: 120px;
  text-align: center;
}

.actions-cell {
  text-align: center;
}

.empty-state {
  padding: 2rem;
}

.data-table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .data-table-pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-info {
    order: 2;
  }
}
</style>
