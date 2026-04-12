<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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
  prefixIcon?: string
  stayOpen?: boolean
  allowCustom?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option...',
  disabled: false
})

const emit = defineEmits(['update:modelValue', 'change', 'add-custom'])

const isOpen = ref(false)
const searchQuery = ref('')
const activeIndex = ref(-1)
const isFocused = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const optionsListRef = ref<HTMLElement | null>(null)

const selectedOption = computed(() => 
  props.options.find(opt => opt.id === props.modelValue)
)

// Synchronize search query with selection initially or when selection changes
watch(() => props.modelValue, (newVal) => {
  const found = props.options.find(o => o.id === newVal)
  if (found) {
    searchQuery.value = found.label
  } else if (!newVal) {
    searchQuery.value = ''
  }
}, { immediate: true })

const filteredOptions = computed(() => {
  if (!searchQuery.value && !props.showOnlyOnSearch) return props.options
  if (!searchQuery.value && props.showOnlyOnSearch) return []
  
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(opt => 
    opt.label.toLowerCase().includes(query) || 
    opt.sublabel?.toLowerCase().includes(query)
  )
})

// Only show the dropdown if focused and there's a search term (or we want to show all)
const shouldShowDropdown = computed(() => {
  return isFocused.value && (searchQuery.value.length > 0 || props.showOnlyOnSearch)
})

watch(shouldShowDropdown, (val) => {
  isOpen.value = val
  if (val) {
    activeIndex.value = filteredOptions.value.length > 0 ? 0 : -1
  }
})

const handleFocus = () => {
  isFocused.value = true
  // Select all text on focus for easy replacement
  setTimeout(() => searchInput.value?.select(), 0)
}

const handleInput = () => {
  // If user clears the input, we might want to emit a null value? 
  // For now, just keep the dropdown state reactive
}

const selectOption = (option: Option) => {
  emit('update:modelValue', option.id)
  emit('change', option)
  
  if (props.stayOpen) {
    searchQuery.value = ''
    nextTick(() => searchInput.value?.focus())
  } else {
    searchQuery.value = option.label
    isOpen.value = false
    isFocused.value = false
    searchInput.value?.blur()
  }
}

const handleCustomAction = () => {
  if (!searchQuery.value) return
  emit('add-custom', searchQuery.value)
  
  if (!props.stayOpen) {
    isOpen.value = false
    isFocused.value = false
    searchInput.value?.blur()
  } else {
    // Keep focus and clear for next entry if stayOpen is true
    searchQuery.value = ''
    activeIndex.value = -1
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  const totalFiltered = filteredOptions.value.length
  const hasCustom = props.allowCustom && searchQuery.value && totalFiltered === 0

  if (!isOpen.value) {
    if (e.key === 'ArrowDown' && isFocused.value) {
      // Manual open if user wants to see list? 
      // But user said "do not show otherwise"
    }
    return
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      if (hasCustom) return
      activeIndex.value = (activeIndex.value + 1) % totalFiltered
      scrollToActive()
      break
    case 'ArrowUp':
      e.preventDefault()
      if (hasCustom) return
      activeIndex.value = (activeIndex.value - 1 + totalFiltered) % totalFiltered
      scrollToActive()
      break
    case 'Enter':
      e.preventDefault()
      if (hasCustom) {
        handleCustomAction()
      } else if (activeIndex.value >= 0 && totalFiltered > 0) {
        const selected = filteredOptions.value[activeIndex.value]
        if (selected) selectOption(selected)
      }
      break
    case 'Escape':
      isOpen.value = false
      isFocused.value = false
      searchInput.value?.blur()
      break
  }
}

const scrollToActive = () => {
  nextTick(() => {
    const activeEl = optionsListRef.value?.querySelector('.is-active')
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })
}

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isFocused.value = false
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
  <div class="search-select-container" ref="containerRef" @keydown="handleKeyDown">
    <label v-if="label" class="input-label">{{ label }}</label>
    
    <div 
      :class="['autocomplete-trigger', { 'is-active': isFocused || isOpen, 'has-error': error, 'is-disabled': disabled }]" 
      @click="searchInput?.focus()"
    >
      <div class="trigger-inner">
        <AppIcon v-if="prefixIcon" :name="(prefixIcon as any)" :size="16" :color="isFocused ? 'var(--color-primary)' : 'var(--text-muted)'" class="search-icon" />
        
        <input 
          ref="searchInput"
          type="text"
          v-model="searchQuery"
          class="main-input"
          :placeholder="placeholder"
          :disabled="disabled"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          @focus="handleFocus"
          @input="handleInput"
          @click.stop
        />
      </div>

      <AppIcon 
        v-if="!hideChevron"
        name="chevron-down" 
        :size="16" 
        :class="['drop-icon', { 'rotate': isOpen }]" 
      />
    </div>

    <transition name="dropdown-slide">
      <div v-if="isOpen && (filteredOptions.length > 0 || allowCustom)" class="dropdown-window glass-card" @click.stop>
        <div class="options-flow" ref="optionsListRef">
          <div 
            v-for="(option, index) in filteredOptions" 
            :key="option.id" 
            class="option-row"
            :class="{ 
              'is-active': index === activeIndex,
              'is-selected': option.id === modelValue 
            }"
            @mouseenter="activeIndex = index"
            @click="selectOption(option)"
          >
            <div class="option-row-info">
              <span class="option-row-label">{{ option.label }}</span>
              <span v-if="option.sublabel" class="option-row-sublabel">{{ option.sublabel }}</span>
            </div>
            <AppIcon v-if="option.id === modelValue" name="check" :size="14" class="check-icon" />
          </div>

          <!-- Custom Action Row -->
          <div 
            v-if="allowCustom && searchQuery && filteredOptions.length === 0" 
            class="option-row custom-row"
            :class="{ 'is-active': activeIndex === 0 || activeIndex === -1 }"
            @click="handleCustomAction"
          >
            <div class="option-row-info">
              <span class="option-row-label">Add "{{ searchQuery }}"</span>
              <span class="option-row-sublabel">Press Enter to create custom item</span>
            </div>
            <AppIcon name="plus" :size="16" class="plus-icon" />
          </div>
        </div>
      </div>
    </transition>
    
    <span v-if="error" class="error-msg">{{ error }}</span>
  </div>
</template>

<style scoped>
.search-select-container {
  position: relative;
  width: 100%;
}

.input-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.autocomplete-trigger {
  min-height: 44px;
  padding: 0 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: text;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.autocomplete-trigger.is-active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-glow);
  background: var(--bg-app);
}

.trigger-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-grow: 1;
}

.main-input {
  flex-grow: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-main);
  font-size: 0.95rem;
  font-weight: 500;
  padding: 8px 0;
  width: 100%;
}

.main-input::placeholder {
  color: var(--text-muted);
  font-weight: 400;
}

.search-icon {
  transition: color 0.2s;
  opacity: 0.7;
}

.drop-icon {
  color: var(--text-muted);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}
.drop-icon.rotate {
  transform: rotate(180deg);
  color: var(--color-primary);
}

/* Dropdown */
.dropdown-window {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  max-height: 350px;
}

.options-flow {
  overflow-y: auto;
  padding: 6px;
}

.option-row {
  padding: 10px 14px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.1s ease;
  margin-bottom: 2px;
}

.option-row.is-active {
  background: var(--color-primary-glow);
  transform: translateX(2px);
}

.option-row.is-selected {
  background: rgba(var(--color-primary-rgb), 0.08);
}

.option-row-info {
  display: flex;
  flex-direction: column;
}

.option-row-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-main);
}

.option-row-sublabel {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.check-icon { color: var(--color-primary); }

.custom-row {
  border: 1px dashed var(--color-primary);
  margin-top: 6px;
}

.custom-row.is-active {
  background: var(--color-primary);
}

.custom-row.is-active .option-row-label,
.custom-row.is-active .option-row-sublabel {
  color: white;
}

.error-msg {
  font-size: 0.75rem;
  color: var(--color-danger);
  margin-top: 4px;
  display: block;
}

.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Transitions */
.dropdown-slide-enter-active, .dropdown-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.dropdown-slide-enter-from { opacity: 0; transform: translateY(-8px); }
.dropdown-slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
