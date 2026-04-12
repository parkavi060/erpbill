<script setup lang="ts">
import { computed } from 'vue'
import type { Invoice } from '../../types'
import BaseInput from '../atoms/BaseInput.vue'
import AppIcon from '../atoms/AppIcon.vue'
import { formatCurrency } from '../../utils/formatters'

const props = defineProps<{
  modelValue: Omit<Invoice, 'id'>
  isInterState: boolean
}>()

const emit = defineEmits(['update:modelValue', 'recalculate'])

const discountLabel = computed(() => {
  return props.modelValue.discountType === 'percentage' ? 'Discount (%)' : 'Discount (Fixed)'
})

const toggleDiscountType = () => {
  const newType = props.modelValue.discountType === 'percentage' ? 'fixed' : 'percentage'
  emit('update:modelValue', { ...props.modelValue, discountType: newType })
  emit('recalculate')
}
</script>

<template>
  <div class="invoice-adjustments-grid">
    <!-- Extra Settings -->
    <section class="invoice-totals-section glass-card">
      <div class="section-title">
        <AppIcon name="settings" :size="18" class="text-theme" />
        <h3>Additional Controls</h3>
      </div>

      <div class="controls-stack">
        <div class="control-row">
          <div class="info">
            <span class="label">Reverse Charge</span>
            <p class="help">Flag for supplies subject to reverse charge.</p>
          </div>
          <div class="input-wrap">
            <label class="toggle-switch">
              <input type="checkbox" v-model="modelValue.reverseCharge" @change="emit('recalculate')" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="control-row">
           <div class="info">
             <span class="label">Round Off Total</span>
             <p class="help">Automatically round grand total to nearest ₹1.</p>
           </div>
           <div class="input-wrap">
             <label class="toggle-switch">
               <input type="checkbox" v-model="modelValue.isRounded" @change="emit('recalculate')" />
               <span class="slider"></span>
             </label>
           </div>
        </div>
      </div>
    </section>

    <!-- Adjustments -->
    <section class="invoice-totals-section glass-card">
      <div class="section-title">
        <AppIcon name="percent" :size="18" class="text-theme" />
        <h3>Adjustments & Discounts</h3>
      </div>

      <div class="adjustments-form">
        <div class="discount-input-group">
          <div class="input-header">
            <span class="label">{{ discountLabel }}</span>
            <button class="btn-toggle-type" @click="toggleDiscountType">
              Switch to {{ modelValue.discountType === 'percentage' ? 'Fixed' : 'Percent' }}
            </button>
          </div>
          <BaseInput 
            v-model.number="modelValue.discount" 
            type="number" 
            placeholder="0.00"
            @input="emit('recalculate')"
          />
        </div>

        <div class="notes-field mt-3">
          <label class="input-label">Invoice Notes</label>
          <textarea 
            v-model="modelValue.notes" 
            class="custom-textarea" 
            placeholder="Add any specific instructions or bank details reminder..."
          ></textarea>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.invoice-adjustments-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.invoice-totals-section { padding: 24px; }

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}
.section-title h3 { margin: 0; font-size: 0.95rem; font-weight: 700; }
.text-theme { color: var(--theme-primary); }

.controls-stack { display: flex; flex-direction: column; gap: 20px; }
.control-row { display: flex; justify-content: space-between; align-items: flex-start; }
.control-row .info { flex: 1; }
.control-row .label { display: block; font-weight: 700; font-size: 0.9rem; color: var(--text-main); }
.control-row .help { font-size: 0.75rem; color: var(--text-muted); margin: 2px 0 0; }

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.2); transition: .3s; border-radius: 34px;
}
.slider:before {
  position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
  background-color: white; transition: .3s; border-radius: 50%;
}
input:checked + .slider { background-color: var(--theme-primary); }
input:checked + .slider:before { transform: translateX(20px); }

.discount-input-group { display: flex; flex-direction: column; gap: 8px; }
.input-header { display: flex; justify-content: space-between; align-items: center; }
.input-header .label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
.btn-toggle-type { font-size: 0.7rem; color: var(--theme-primary); background: transparent; border: none; font-weight: 700; cursor: pointer; padding: 0; text-decoration: underline; }

.input-label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
.custom-textarea {
  width: 100%; height: 80px; background: rgba(0,0,0,0.1); border: 1px solid var(--border-color);
  border-radius: 8px; padding: 12px; color: var(--text-main); font-size: 0.9rem; resize: none;
}
.custom-textarea:focus { border-color: var(--theme-primary); outline: none; }

.mt-3 { margin-top: 16px; }

@media (max-width: 900px) {
  .invoice-adjustments-grid { grid-template-columns: 1fr; }
}
</style>
