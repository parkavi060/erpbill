<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

interface Props {
  variant?: 'primary' | 'glow' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: 'home' | 'invoice' | 'users' | 'box' | 'settings' | 'plus' | 'trash' | 'edit' | 'sun' | 'moon' | 'menu' | 'arrow-left' | 'search' | 'chevron-down' | 'calendar' | 'download' | 'printer' | 'percent' | 'file-text' | 'eye' | 'eye-off'
  iconPosition?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  iconPosition: 'left'
})

const classes = computed(() => [
  'base-button',
  `variant-${props.variant}`,
  `size-${props.size}`,
  { 'is-loading': props.loading, 'is-disabled': props.disabled }
])

const iconSize = computed(() => {
  if (props.size === 'sm') return 16
  if (props.size === 'lg') return 24
  return 20
})
</script>

<template>
  <button :class="classes" :disabled="disabled || loading" class="btn-ripple">
    <span v-if="loading" class="spinner"></span>
    <template v-else>
      <AppIcon 
        v-if="icon && iconPosition === 'left'" 
        :name="icon" 
        :size="iconSize" 
        class="btn-icon left" 
      />
      <slot></slot>
      <AppIcon 
        v-if="icon && iconPosition === 'right'" 
        :name="icon" 
        :size="iconSize" 
        class="btn-icon right" 
      />
    </template>
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

/* Sizes */
.size-sm { padding: 0.4rem 0.8rem; font-size: 0.875rem; }
.size-md { padding: 0.6rem 1.2rem; font-size: 1rem; }
.size-lg { padding: 0.8rem 1.6rem; font-size: 1.125rem; }

/* Variants */
.variant-primary {
  background: var(--color-primary);
  color: white;
}
.variant-primary:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 4px 12px var(--color-primary-glow);
}

.variant-glow {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 0 15px var(--color-primary-glow);
}
.variant-glow:hover:not(:disabled) {
  box-shadow: 0 0 25px var(--color-primary-glow);
  transform: translateY(-1px);
}

.variant-ghost {
  background: transparent;
  color: var(--text-main);
  border-color: var(--border-color);
}
.variant-ghost:hover:not(:disabled) {
  background: var(--border-color);
}

.variant-danger {
  background: var(--color-danger);
  color: white;
}
.variant-danger:hover:not(:disabled) {
  filter: brightness(1.1);
}

.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 1.2em;
  height: 1.2em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: rotate 0.8s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-icon.left { margin-right: 2px; }
.btn-icon.right { margin-left: 2px; }
</style>
