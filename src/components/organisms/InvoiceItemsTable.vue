<script setup lang="ts">
import { ref, computed } from 'vue'
import type { InvoiceItem, Product } from '../../types'
import BaseSearchSelect from '../atoms/BaseSearchSelect.vue'
import BaseInput from '../atoms/BaseInput.vue'
import AppIcon from '../atoms/AppIcon.vue'
import { formatCurrency } from '../../utils/formatters'

const props = defineProps<{
  items: InvoiceItem[]
  products: Product[]
  currency: string
}>()

const emit = defineEmits(['add-item', 'remove-item', 'update-item'])

const productOptions = computed(() => 
  props.products.map(p => ({ 
    id: p.id, 
    label: p.name, 
    sublabel: `${formatCurrency(p.price)} | HSN: ${p.hsnCode || '-'}` 
  }))
)

const handleProductSelect = (opt: any) => {
  const product = props.products.find(p => p.id === opt.id)
  if (product) {
    emit('add-item', product)
  }
}

const handleCustomAdd = (name: string) => {
  // Create a synthetic product for addition
  const customProduct: Product = {
    id: `custom-${Date.now()}`,
    name: name,
    description: 'Custom added item',
    price: 0,
    unit: 'pcs',
    taxRate: 18, // Default GST rate
    hsnCode: ''
  }
  emit('add-item', customProduct)
}
</script>

<template>
  <div class="invoice-items-table glass-card overflow-hidden">
    <div class="table-header-box">
      <div class="section-title">
        <AppIcon name="box" :size="18" class="text-theme" />
        <h3>Items & Pricing</h3>
      </div>
      
      <div class="product-picker-wrapper">
        <BaseSearchSelect 
          model-value=""
          :options="productOptions"
          placeholder="Type to search products or services..."
          prefix-icon="search"
          stay-open
          allow-custom
          hide-chevron
          @change="handleProductSelect"
          @add-custom="handleCustomAdd"
          class="picker-input"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="items-grid">
        <thead>
          <tr>
            <th class="col-hsn">HSN</th>
            <th class="col-name text-left">Item Details</th>
            <th class="col-qty text-right">Qty</th>
            <th class="col-price text-right">Price (Incl)</th>
            <th class="col-total text-right">Line Total</th>
            <th class="col-actions"></th>
          </tr>
        </thead>
        <TransitionGroup name="list" tag="tbody">
          <tr v-for="item in items" :key="item.id" class="item-row">
            <td class="col-hsn">
              <input v-model="item.hsnCode" class="inline-input text-center" placeholder="HSN" @input="emit('update-item')" />
            </td>
            <td class="col-name">
              <div class="product-info">
                <span class="product-name">{{ item.name }}</span>
              </div>
            </td>
            <td class="col-qty">
              <input v-model.number="item.quantity" type="number" class="inline-input text-right" min="1" @input="emit('update-item')" />
            </td>
            <td class="col-price">
              <input v-model.number="item.price" type="number" class="inline-input text-right" @input="emit('update-item')" />
            </td>
            <td class="col-total font-mono text-right">
              {{ formatCurrency(item.total, currency) }}
            </td>
            <td class="col-actions">
              <button class="btn-remove" @click="emit('remove-item', item.id)">
                 <AppIcon name="trash" :size="14" />
              </button>
            </td>
          </tr>
          
          <tr v-if="items.length === 0">
             <td colspan="6" class="empty-state">
                <p>No items added yet. Start by searching for a product above.</p>
             </td>
          </tr>
        </TransitionGroup>
      </table>
    </div>
  </div>
</template>

<style scoped>
.invoice-items-table { border: none; }

.table-header-box {
  padding: 24px 32px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.section-title { display: flex; align-items: center; gap: 10px; }
.section-title h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.text-theme { color: var(--theme-primary); }

.product-picker-wrapper { flex-grow: 1; max-width: 500px; }
:deep(.picker-input .select-trigger) { border-color: rgba(255,255,255,0.05); }

.table-responsive { width: 100%; overflow-x: auto; }
.items-grid { width: 100%; border-collapse: collapse; }

.items-grid th {
  padding: 12px 24px;
  background: rgba(0,0,0,0.1);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-color);
}

.item-row { transition: all 0.2s; border-bottom: 1px solid var(--border-color); }
.item-row:hover { background: rgba(var(--theme-primary-rgb), 0.03); }

.item-row td { padding: 16px 24px; vertical-align: middle; }

/* Inline Editors */
.inline-input {
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  padding: 6px 10px;
  border-radius: 6px;
  color: var(--text-main);
  transition: all 0.2s;
  font-size: 0.9rem;
}
.inline-input:focus {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--theme-primary);
  outline: none;
}

.product-name { font-weight: 600; color: var(--text-main); }
.empty-state { padding: 64px 0; text-align: center; color: var(--text-muted); font-size: 0.9rem; }

.btn-remove {
  width: 32px; height: 32px; border-radius: 8px; border: none;
  background: transparent; color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.btn-remove:hover { background: var(--color-danger); color: white; }

.text-right { text-align: right; }
.text-center { text-align: center; }

/* Transitions */
.list-enter-active, .list-leave-active { transition: all 0.2s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-10px); }

@media (max-width: 800px) {
  .table-header-box { flex-direction: column; align-items: flex-start; }
  .product-picker-wrapper { max-width: 100%; }
}
</style>
