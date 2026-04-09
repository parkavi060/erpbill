<script setup lang="ts">
import AppIcon from '../atoms/AppIcon.vue'
import BaseButton from '../atoms/BaseButton.vue'

interface Props {
  show: boolean
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="emit('close')">
        <div :class="['modal-container', `modal-${size}`, 'glass-card']">
          <header class="modal-header">
            <h3>{{ title }}</h3>
            <BaseButton variant="ghost" size="sm" @click="emit('close')">
              <AppIcon name="plus" style="transform: rotate(45deg)" />
            </BaseButton>
          </header>
          
          <section class="modal-body">
            <slot></slot>
          </section>
          
          <footer class="modal-footer">
            <slot name="footer">
              <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
              <BaseButton variant="primary" @click="emit('confirm')">Confirm</BaseButton>
            </slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modal-container {
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
  animation: modal-slide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-sm { max-width: 400px; }
.modal-md { max-width: 600px; }
.modal-lg { max-width: 800px; }
.modal-xl { max-width: 1100px; }

.modal-header {
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
}

.modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex-grow: 1;
}

.modal-footer {
  padding: var(--spacing-lg);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

/* Animations */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

@keyframes modal-slide {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
