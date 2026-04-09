<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppIcon from './AppIcon.vue'

interface Option {
  id: string | number
  label: string
  sublabel?: string
  [key: string]: any
}

interface Props {
  modelValue: string | number | null | undefined
  options: Option[]
  placeholder?: string
  label?: string
  disabled?: boolean
  error?: string
  hideChevron?: boolean
  showOnlyOnSearch?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option...',
  disabled: false
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const searchQuery = ref('')
const containerRef = ref<HTMLElement | null>(null)

const selectedOption = computed(() => 
  props.options.find(opt => opt.id === props.modelValue)
)

const filteredOptions = computed(() => {
  if (!searchQuery.value && !props.showOnlyOnSearch) return props.options
  if (!searchQuery.value && props.showOnlyOnSearch) return []
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(opt => 
    opt.label.toLowerCase().includes(query) || 
    opt.sublabel?.toLowerCase().includes(query)
  )
})

const isDropdownVisible = computed(() => {
  if (!isOpen.value) return false
  if (props.showOnlyOnSearch && !searchQuery.value) return false
  return filteredOptions.value.length > 0 || props.showOnlyOnSearch
})

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
  }
}

const selectOption = (option: Option) => {
  emit('update:modelValue', option.id)
  emit('change', option)
  isOpen.value = false
  searchQuery.value = ''
}

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="search-select-container" ref="containerRef">
    <label v-if="label" class="input-label">{{ label }}</label>
    
    <div 
      :class="['select-trigger', { 'is-open': isOpen, 'is-disabled': disabled, 'has-error': error }]" 
      @click="toggleDropdown"
    >
      <div v-if="selectedOption && !isOpen" class="selected-content">
        <span class="selected-label">{{ selectedOption.label }}</span>
        <span v-if="selectedOption.sublabel" class="selected-sublabel">{{ selectedOption.sublabel }}</span>
      </div>
      <span v-else-if="!isOpen" class="placeholder">{{ placeholder }}</span>
      
      <div v-if="isOpen" class="search-input-wrapper">
        <AppIcon name="search" :size="16" class="search-icon" color="var(--color-primary)" />
        <input 
          type="text" 
          v-model="searchQuery" 
          class="search-input" 
          autofocus 
          placeholder="Type to search..."
          @click.stop
        />
      </div>
      
      <AppIcon 
        v-if="!hideChevron"
        name="chevron-down" 
        :size="18" 
        :class="['chevron-icon', { 'rotate': isOpen }]" 
      />
    </div>

    <transition name="slide-up">
      <div v-if="isDropdownVisible" class="dropdown-menu glass-card">
        <div v-if="filteredOptions.length === 0" class="no-options">
          No matches found
        </div>
        <div 
          v-for="option in filteredOptions" 
          :key="option.id" 
          class="option-item"
          :class="{ 'is-selected': option.id === modelValue }"
          @click="selectOption(option)"
        >
          <div class="option-info">
            <span class="option-label">{{ option.label }}</span>
            <span v-if="option.sublabel" class="option-sublabel">{{ option.sublabel }}</span>
          </div>
          <AppIcon v-if="option.id === modelValue" name="plus" :size="16" color="var(--color-primary)" />
        </div>
      </div>
    </transition>
    <span v-if="error" class="error-text">{{ error }}</span>
  </div>
</template>

<style scoped>
.search-select-container {
  position: relative;
  width: 100%;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: var(--spacing-xs);
  display: block;
}

.select-trigger {
  min-height: 44px;
  padding: 0 var(--spacing-md);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: var(--spacing-sm);
}

.select-trigger:hover:not(.is-disabled) {
  border-color: var(--color-primary-glow);
  box-shadow: 0 0 0 4px var(--color-primary-glow);
}

.select-trigger.is-open {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-glow);
}

.select-trigger.has-error {
  border-color: var(--color-danger);
}

.selected-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.selected-label {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-sublabel {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.placeholder {
  color: var(--text-muted);
}

.search-input-wrapper {
  flex-grow: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.search-input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--text-main);
  padding: 0;
  outline: none;
  font-size: 1rem;
}

.chevron-icon {
  color: var(--text-muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chevron-icon.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  z-index: 9999;
  padding: 6px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
}

.option-item {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-item:hover {
  background: var(--bg-app);
}

.option-item.is-selected {
  background: var(--color-primary-glow);
}

.option-info {
  display: flex;
  flex-direction: column;
}

.option-label {
  font-weight: 500;
}

.option-sublabel {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.no-options {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.error-text {
  font-size: 0.75rem;
  color: var(--color-danger);
  margin-top: 4px;
  display: block;
}

.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.2s ease-out;
}
.slide-up-enter-from { opacity: 0; transform: translateY(10px); }
.slide-up-leave-to { opacity: 0; transform: translateY(10px); }
</style>
