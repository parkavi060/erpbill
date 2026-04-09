<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '../atoms/AppIcon.vue'

export interface Column {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
}

interface Props {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: 'No data found.'
})

const hasData = computed(() => props.data && props.data.length > 0)
</script>

<template>
  <div class="table-container glass-card">
    <table class="app-table">
      <thead>
        <tr>
          <th 
            v-for="col in columns" 
            :key="col.key"
            :style="{ textAlign: col.align || 'left' }"
          >
            {{ col.label }}
          </th>
          <th class="actions-head">Actions</th>
        </tr>
      </thead>
      
      <tbody>
        <template v-if="loading">
          <tr v-for="i in 3" :key="i" class="skeleton-row">
            <td v-for="col in columns" :key="col.key">
              <div class="skeleton-line"></div>
            </td>
            <td><div class="skeleton-line"></div></td>
          </tr>
        </template>
        
        <template v-else-if="hasData">
          <tr v-for="(row, index) in data" :key="row.id || index">
            <td 
              v-for="col in columns" 
              :key="col.key"
              :style="{ textAlign: col.align || 'left' }"
            >
              <slot :name="`col-${col.key}`" :row="row">
                {{ row[col.key] }}
              </slot>
            </td>
            <td class="actions-cell">
              <div class="actions-wrapper">
                <slot name="actions" :row="row"></slot>
              </div>
            </td>
          </tr>
        </template>
        
        <tr v-else>
          <td :colspan="columns.length + 1" class="empty-cell">
            <div class="empty-state">
              <AppIcon name="box" :size="48" color="var(--text-muted)" />
              <p>{{ emptyMessage }}</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-md);
}

.app-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
  font-weight: 700;
}

td {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 0.9375rem;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

tr:last-child td {
  border-bottom: none;
}

tr:not(.skeleton-row):hover td {
  background-color: rgba(99, 102, 241, 0.05);
}

.actions-head {
  text-align: right;
  width: 120px;
}

.actions-cell {
  text-align: right;
}

.actions-wrapper {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.empty-cell {
  padding: var(--spacing-xl);
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-muted);
}

/* Skeleton animation */
.skeleton-line {
  height: 1rem;
  background: var(--border-color);
  border-radius: var(--radius-sm);
  width: 100%;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}
</style>
