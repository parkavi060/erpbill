<script setup lang="ts">
import { computed } from 'vue'
import type { Invoice, Client } from '../../types'
import BaseSearchSelect from '../atoms/BaseSearchSelect.vue'
import BaseDatePicker from '../atoms/BaseDatePicker.vue'
import BaseBadge from '../atoms/BaseBadge.vue'
import BaseInput from '../atoms/BaseInput.vue'
import BaseButton from '../atoms/BaseButton.vue'
import AppIcon from '../atoms/AppIcon.vue'

const props = defineProps<{
  modelValue: Omit<Invoice, 'id'>
  clients: Client[]
}>()

const emit = defineEmits(['update:modelValue', 'client-change'])

const clientOptions = computed(() => 
  props.clients
    .filter(c => c.type === props.modelValue.clientType)
    .map(c => ({ id: c.id, label: c.name, sublabel: c.email }))
)

const selectedClient = computed(() => 
  props.clients.find(c => c.id === props.modelValue.clientId)
)

const handleClientSelect = (opt: any) => {
  const client = props.clients.find(c => c.id === opt.id)
  if (client) {
    emit('client-change', client)
  }
}
</script>

<template>
  <section class="invoice-client-section glass-card theme-border">
    <div class="section-indicator"></div>
    <div class="section-title">
      <AppIcon name="users" :size="18" class="text-theme" />
      <h3>Client & Date Selection</h3>
    </div>

    <div class="client-grid">
      <!-- Client Search -->
      <div class="field-main">
        <BaseSearchSelect 
          :model-value="modelValue.clientId" 
          label="Select Registered Client"
          :options="clientOptions"
          placeholder="Search for a name or GSTIN..."
          prefix-icon="search"
          hide-chevron
          @change="handleClientSelect"
        />
        
        <div class="helper-info mt-2" v-if="!selectedClient && clientOptions.length === 0">
           <div class="no-client-alert glass-card">
              <p class="text-xs m-0">No {{ modelValue.clientType?.toUpperCase() }} clients found.</p>
              <BaseButton variant="ghost" size="sm" @click="$router.push('/clients')">Add Client</BaseButton>
           </div>
        </div>

        <Transition name="fade">
          <div v-if="selectedClient" class="client-info-ribbon mt-3">
            <div class="ribbon-summary">
              <span class="client-name">{{ selectedClient.name }}</span>
              <BaseBadge :text="selectedClient.gstin || 'No GSTIN'" variant="info" />
            </div>
            
            <div v-if="selectedClient.type === 'b2e'" class="export-details mt-2 p-2 rounded bg-dark-subtle">
               <div class="grid-2">
                 <BaseInput v-model="modelValue.lutNumber" label="LUT / Bond No." placeholder="Enter LUT..." />
                 <div class="toggle-control">
                   <label>Taxable Export?</label>
                   <div class="radio-inline">
                     <label><input type="radio" :value="true" v-model="modelValue.isTaxableExport"> Yes</label>
                     <label><input type="radio" :value="false" v-model="modelValue.isTaxableExport"> No</label>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Dates -->
      <div class="field-dates">
        <div class="grid-2">
          <BaseDatePicker v-model="modelValue.date" label="Invoice Date" />
          <BaseDatePicker v-model="modelValue.dueDate" label="Due Date" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.invoice-client-section {
  position: relative;
  padding: 32px;
  overflow: hidden;
}

.section-indicator {
  position: absolute;
  top: 0; left: 0; width: 4px; height: 100%;
  background: var(--theme-primary);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.section-title h3 { margin: 0; font-size: 1rem; font-weight: 700; color: var(--text-main); }
.text-theme { color: var(--theme-primary); }

.client-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;
}

.client-info-ribbon {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px dashed var(--border-color);
}

.ribbon-summary { display: flex; align-items: center; gap: 12px; }
.client-name { font-weight: 700; font-size: 0.95rem; }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.export-details { font-size: 0.8rem; }
.toggle-control label { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px; }
.radio-inline { display: flex; gap: 12px; }

.no-client-alert {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(var(--color-warning-rgb), 0.05);
  border: 1px dashed var(--color-warning);
}

.m-0 { margin: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }

.text-xs { font-size: 0.75rem; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 16px; }

@media (max-width: 900px) {
  .client-grid { grid-template-columns: 1fr; gap: 24px; }
}
</style>
