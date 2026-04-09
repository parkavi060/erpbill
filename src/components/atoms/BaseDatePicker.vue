<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

interface Props {
  modelValue: number | string
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const dateValue = computed({
  get: () => {
    if (typeof props.modelValue === 'number') {
      return new Date(props.modelValue).toISOString().split('T')[0]
    }
    return props.modelValue
  },
  set: (val) => {
    if (val) {
      emit('update:modelValue', new Date(val).getTime())
    }
  }
})
</script>

<template>
  <div class="date-picker-container">
    <label v-if="label" class="input-label">{{ label }}</label>
    <div :class="['input-wrapper', { 'is-disabled': disabled, 'has-error': error }]">
      <AppIcon name="calendar" :size="18" class="date-icon" />
      <input 
        type="date" 
        v-model="dateValue" 
        class="date-input" 
        :disabled="disabled"
      />
    </div>
    <span v-if="error" class="error-text">{{ error }}</span>
  </div>
</template>

<style scoped>
.date-picker-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0 var(--spacing-md);
  min-height: 44px;
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-glow);
}

.date-icon {
  color: var(--text-muted);
}

.date-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-main);
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  padding: 8px 0;
  cursor: pointer;
}

.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.has-error {
  border-color: var(--color-danger);
}

.error-text {
  font-size: 0.75rem;
  color: var(--color-danger);
}

/* Customizing the picker icon for Webkit browsers */
::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.5);
  padding: 4px;
}
</style>
