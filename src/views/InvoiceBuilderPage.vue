<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useClientStore } from '../stores/clients'
import { useProductStore } from '../stores/products'
import { useInvoiceStore } from '../stores/invoices'
import { useSettingsStore } from '../stores/settings'
import { useInvoiceBuilder } from '../composables/useInvoiceBuilder'
import { formatCurrency } from '../utils/formatters'

import BaseButton from '../components/atoms/BaseButton.vue'
import AppIcon from '../components/atoms/AppIcon.vue'

// Modular Components
import InvoiceClientSection from '../components/organisms/InvoiceClientSection.vue'
import InvoiceItemsTable from '../components/organisms/InvoiceItemsTable.vue'
import InvoiceTotalsSection from '../components/organisms/InvoiceTotalsSection.vue'

const router = useRouter()
const clientStore = useClientStore()
const productStore = useProductStore()
const invoiceStore = useInvoiceStore()
const settingsStore = useSettingsStore()

const workflowStep = ref<'type-selection' | 'editor'>('type-selection')

const { invoice, isInterState, addItem, removeItem, calculateTotals } = useInvoiceBuilder(
  undefined, 
  invoiceStore.getNextInvoiceNumber()
)

const isSaved = ref(false)

// Dynamic Theme Mapping
const themeColor = computed(() => {
  switch (invoice.value.clientType) {
    case 'b2b': return '#6366f1' // Indigo
    case 'b2c': return '#10b981' // Emerald
    case 'b2e': return '#8b5cf6' // Violet/Global
    default: return '#6366f1'
  }
})

const themeStyles = computed(() => ({
  '--theme-primary': themeColor.value,
  '--theme-primary-glow': `${themeColor.value}40` // 25% opacity
}))

const selectedClient = computed(() => 
  clientStore.clients.find(c => c.id === invoice.value.clientId)
)

const selectType = (type: 'b2b' | 'b2c' | 'b2e') => {
  invoice.value.clientType = type
  invoice.value.clientId = ''
  workflowStep.value = 'editor'
}

const handleClientChange = (client: any) => {
  invoice.value.clientId = client.id
  invoice.value.clientType = client.type
  invoice.value.currency = client.currency || 'INR'
  invoice.value.placeOfSupply = client.stateCode || ''
  invoice.value.lutNumber = client.lutNumber || ''
  invoice.value.isTaxableExport = client.isTaxableExport || false
  
  isInterState.value = settingsStore.profile.stateCode !== client.stateCode
  calculateTotals()
}

const handleSave = () => {
  if (!invoice.value.clientId || invoice.value.items.length === 0) {
    alert('Please select a client and add at least one item.')
    return
  }
  
  const finalInvoice = {
    ...invoice.value,
    id: Date.now().toString(),
    invoiceNumber: invoiceStore.getNextInvoiceNumber(),
  }
  
  invoiceStore.saveInvoice(finalInvoice as any)
  isSaved.value = true
}

const handleClose = () => {
  router.push('/invoices')
}

onMounted(() => {
  calculateTotals()
})
</script>

<template>
  <div class="unified-builder-container" :style="themeStyles">
    <!-- 1. Type Selection Screen -->
    <Transition name="fast-fade" mode="out-in">
      <div v-if="workflowStep === 'type-selection'" class="selection-view">
        <div class="selection-container">
          <header class="selection-header">
            <div class="header-badge">New Transaction</div>
            <h1>Generate Invoice</h1>
            <p>Choose the correct channel for tax compliance.</p>
          </header>

          <div class="type-grid">
            <button class="type-card glass-card ripple" @click="selectType('b2b')">
              <div class="type-indicator indigo"></div>
              <div class="icon-box b2b">
                <AppIcon name="users" :size="32" />
              </div>
              <div class="card-body">
                <h3>B2B</h3>
                <p>Tax invoice for business entities with GSTIN registration.</p>
              </div>
              <div class="card-footer">Select Type <AppIcon name="arrow-left" :size="14" class="rotate-180" /></div>
            </button>

            <button class="type-card glass-card ripple" @click="selectType('b2c')">
              <div class="type-indicator emerald"></div>
              <div class="icon-box b2c">
                <AppIcon name="box" :size="32" />
              </div>
              <div class="card-body">
                <h3>B2C</h3>
                <p>Retail bill for consumers or unregistered persons.</p>
              </div>
              <div class="card-footer">Select Type <AppIcon name="arrow-left" :size="14" class="rotate-180" /></div>
            </button>

            <button class="type-card glass-card ripple" @click="selectType('b2e')">
              <div class="type-indicator violet"></div>
              <div class="icon-box b2e">
                <AppIcon name="file-text" :size="32" />
              </div>
              <div class="card-body">
                <h3>B2E / Export</h3>
                <p>Foreign trade or SEZ supplies (Zero-rated or LUT).</p>
              </div>
              <div class="card-footer">Select Type <AppIcon name="arrow-left" :size="14" class="rotate-180" /></div>
            </button>
          </div>

          <div class="selection-footer">
            <button @click="router.back()" class="btn-cancel">Cancel and return</button>
          </div>
        </div>
      </div>

      <!-- 2. Main Builder Workspace -->
      <div v-else class="main-workspace">
        <header class="workspace-header">
          <div class="header-left">
            <button @click="workflowStep = 'type-selection'" class="btn-step-back">
              <AppIcon name="arrow-left" :size="16" />
            </button>
            <div class="type-identity">
              <span class="type-badge" :class="invoice.clientType">
                {{ invoice.clientType === 'b2e' ? 'Export' : invoice.clientType?.toUpperCase() }}
              </span>
              <span class="invoice-title">New Invoice #{{ invoice.invoiceNumber }}</span>
            </div>
          </div>
          <div class="action-bar">
             <BaseButton variant="ghost" @click="router.back()">Discard</BaseButton>
             <button class="btn-save-primary" @click="handleSave">
               <AppIcon name="check" :size="18" />
               <span>Save Invoice</span>
             </button>
          </div>
        </header>

        <div class="workspace-content">
          <div class="editor-grid">
             <div class="editor-main">
               <InvoiceClientSection 
                 v-model="invoice" 
                 :clients="clientStore.clients"
                 @client-change="handleClientChange"
               />

               <InvoiceItemsTable 
                 :items="invoice.items"
                 :products="productStore.products"
                 :currency="invoice.currency || 'INR'"
                 @add-item="addItem"
                 @remove-item="removeItem"
                 @update-item="calculateTotals"
                 class="mt-lg"
               />

               <InvoiceTotalsSection 
                 v-model="invoice"
                 :is-inter-state="isInterState"
                 @recalculate="calculateTotals"
                 class="mt-lg"
               />

               <div class="final-submit-zone mt-xl">
                 <button class="btn-finalize" @click="handleSave">
                   Finalize and Generate PDF
                 </button>
               </div>
             </div>

             <aside class="editor-summary">
               <div class="summary-card glass-card sticky-top">
                 <div class="summary-header">
                   <h3>Live Summary</h3>
                   <div class="status-pulse"></div>
                 </div>
                 
                 <div class="summary-content">
                    <div class="stat-row">
                      <span class="label">Client</span>
                      <span class="value">{{ selectedClient?.name || 'Not Selected' }}</span>
                    </div>
                    <div class="stat-row">
                      <span class="label">Subtotal</span>
                      <span class="value">{{ formatCurrency(invoice.subtotal, invoice.currency) }}</span>
                    </div>
                    <div class="stat-row">
                      <span class="label">Tax (GST)</span>
                      <span class="value text-theme">{{ formatCurrency(invoice.taxTotal, invoice.currency) }}</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-row grand-total">
                      <div class="total-label">Grand Total</div>
                      <div class="total-amount">{{ formatCurrency(invoice.totalAmount, invoice.currency) }}</div>
                    </div>
                 </div>

                 <div class="summary-actions">
                   <BaseButton variant="ghost" class="full-width" icon="eye" @click="calculateTotals">Refresh Preview</BaseButton>
                 </div>
               </div>
             </aside>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Success Overlay -->
    <Transition name="fast-fade">
      <div v-if="isSaved" class="success-screen">
        <div class="success-card glass-card">
          <div class="success-icon"><AppIcon name="check" :size="48" /></div>
          <h2>Invoice Created!</h2>
          <p>#{{ invoice.invoiceNumber }} has been added to your records.</p>
          <div class="success-actions">
             <BaseButton variant="glow" @click="handleClose">Return to Invoices</BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.unified-builder-container { 
  min-height: 100vh; 
  background: var(--bg-app); 
  color: var(--text-main);
}

/* Selection Screen */
.selection-view {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.selection-container { max-width: 1000px; width: 100%; }

.selection-header { text-align: center; margin-bottom: 48px; }
.header-badge { display: inline-block; padding: 4px 12px; border-radius: 50px; background: rgba(99, 102, 241, 0.1); color: #6366f1; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 12px; }
.selection-header h1 { font-size: 2.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 8px; }
.selection-header p { color: var(--text-muted); font-size: 1.1rem; }

.type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

.type-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 32px 24px;
  background: var(--bg-surface-glass);
  border: 1px solid var(--border-color);
  text-align: left;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.2s ease-out;
}

.type-card:hover { transform: translateY(-4px); border-color: var(--theme-primary); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }

.type-indicator { position: absolute; top: 0; left: 0; right: 0; height: 4px; }
.type-indicator.indigo { background: #6366f1; }
.type-indicator.emerald { background: #10b981; }
.type-indicator.violet { background: #8b5cf6; }

.icon-box {
  width: 56px; height: 56px; border-radius: 12px;
  display: flex; justify-content: center; align-items: center;
  margin-bottom: 24px;
}
.icon-box.b2b { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
.icon-box.b2c { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.icon-box.b2e { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

.type-card h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 12px; }
.type-card p { font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 24px; flex-grow: 1; }

.card-footer { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
.type-card:hover .card-footer { color: var(--theme-primary); }
.rotate-180 { transform: rotate(180deg); }

.selection-footer { text-align: center; margin-top: 40px; }
.btn-cancel { background: transparent; border: none; color: var(--text-muted); cursor: pointer; text-decoration: underline; font-weight: 500; }

/* Workspace UI */
.main-workspace { max-width: 1400px; margin: 0 auto; padding: 0 24px; min-height: 100vh; }
.workspace-header { 
  display: flex; border-bottom: 1px solid var(--border-color);
  justify-content: space-between; align-items: center; padding: 20px 0; margin-bottom: 32px; 
}
.header-left { display: flex; align-items: center; gap: 16px; }
.btn-step-back { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border-color); background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-muted); }
.btn-step-back:hover { background: var(--border-color); color: var(--text-main); }

.type-identity { display: flex; align-items: center; gap: 12px; }
.type-badge { padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.7rem; color: #fff; }
.type-badge.b2b { background: #6366f1; }
.type-badge.b2c { background: #10b981; }
.type-badge.b2e { background: #8b5cf6; }
.invoice-title { font-weight: 700; font-size: 1.1rem; }

.btn-save-primary {
  display: flex; align-items: center; gap: 8px; padding: 8px 20px;
  background: var(--theme-primary); color: white; border: none; border-radius: 8px;
  font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: transform 0.1s;
}
.btn-save-primary:hover { box-shadow: 0 0 15px var(--theme-primary-glow); transform: translateY(-1px); }

.workspace-content { padding-bottom: 60px; }
.editor-grid { display: grid; grid-template-columns: 1fr 320px; gap: 32px; }

/* HUD Sidebar */
.summary-card { padding: 24px; border-top: 4px solid var(--theme-primary); }
.summary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.summary-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
.status-pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--theme-primary); box-shadow: 0 0 8px var(--theme-primary); }

.stat-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95rem; }
.stat-row .label { color: var(--text-muted); }
.stat-row .value { font-weight: 600; text-align: right; }
.text-theme { color: var(--theme-primary); }
.stat-divider { height: 1px; background: var(--border-color); margin: 20px 0; }

.grand-total { flex-direction: column; gap: 4px; }
.total-label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
.total-amount { font-size: 1.75rem; font-weight: 800; color: var(--text-main); }

.summary-actions { margin-top: 24px; }

.final-submit-zone { text-align: center; }
.btn-finalize {
  width: 100%; padding: 16px; border-radius: 12px; border: 2px dashed var(--theme-primary);
  background: transparent; color: var(--theme-primary); font-weight: 700; 
  cursor: pointer; transition: all 0.2s;
}
.btn-finalize:hover { background: var(--theme-primary); color: white; border-style: solid; }

/* Transitions */
.fast-fade-enter-active, .fast-fade-leave-active { transition: opacity 0.15s ease; }
.fast-fade-enter-from, .fast-fade-leave-to { opacity: 0; }

.success-screen { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; }
.success-card { max-width: 400px; padding: 40px; text-align: center; border-top: 8px solid var(--theme-primary); }
.success-icon { width: 80px; height: 80px; border-radius: 50%; background: var(--bg-app); border: 2px solid var(--theme-primary); color: var(--theme-primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }

.mt-xl { margin-top: 40px; }
.full-width { width: 100%; }

@media (max-width: 1100px) {
  .editor-grid { grid-template-columns: 1fr; }
  .editor-summary { display: none; }
}
</style>
