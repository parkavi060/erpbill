<script setup lang="ts">
import { computed } from 'vue'
import type { Invoice, Client, BusinessProfile } from '../../types'
import { formatCurrency, numberToWords, formatDate } from '../../utils/formatters'
import { STATE_MAP } from '../../utils/constants'

interface Props {
  invoice: Invoice
  client?: Client
  business: BusinessProfile
  mini?: boolean
}

const props = defineProps<Props>()

const getStateLabel = (code?: string) => {
  if (!code) return 'Not Specified'
  const name = STATE_MAP[code]
  return name ? `${name} (${code})` : `Other (${code})`
}

const isInterState = computed(() => props.business.stateCode !== (props.client?.stateCode || props.invoice.placeOfSupply))

// Formal Export Declaration (Rule 46)
const exportDeclaration = computed(() => {
  if (props.invoice.clientType !== 'b2e') return ''
  return props.invoice.isTaxableExport 
    ? 'SUPPLY MEANT FOR EXPORT ON PAYMENT OF INTEGRATED TAX'
    : 'SUPPLY MEANT FOR EXPORT UNDER BOND OR LETTER OF UNDERTAKING WITHOUT PAYMENT OF INTEGRATED TAX'
})

// HSN Summary Calculation
const hsnSummary = computed(() => {
  const summary: Record<string, { hsn: string, taxable: number, cgst: number, sgst: number, igst: number, rate: number }> = {}
  
  props.invoice.items.forEach(item => {
    const hsn = item.hsnCode || 'N/A'
    if (!summary[hsn]) {
      summary[hsn] = { hsn, taxable: 0, cgst: 0, sgst: 0, igst: 0, rate: item.taxRate }
    }
    
    // Reverse calculate taxable base from the line total (which already includes proportional discount)
    const baseAmount = item.total / (1 + item.taxRate / 100)
    const taxAmount = item.total - baseAmount
    
    summary[hsn].taxable += baseAmount
    
    if (props.invoice.clientType === 'b2e' && !props.invoice.isTaxableExport) {
      // Zero-rated LUT export
    } else if (isInterState.value || props.invoice.clientType === 'b2e') {
      summary[hsn].igst += taxAmount
    } else {
      summary[hsn].cgst += taxAmount / 2
      summary[hsn].sgst += taxAmount / 2
    }
  })
  
  return Object.values(summary)
})
</script>

<template>
  <div class="invoice-preview-canvas" :class="{ 'is-mini': mini }">
    <div class="invoice-paper">
      <!-- 1. OFFICIAL HEADER -->
      <div class="paper-header">
        <div class="brand">
          <div v-if="business.logo" class="logo-circle">
             <img :src="business.logo" alt="Logo" />
          </div>
          <div class="brand-info">
            <h2 class="m-0">{{ business.name }}</h2>
            <p class="address">{{ business.address }}</p>
            <p><strong>GSTIN:</strong> {{ business.gstin }}</p>
            <p><strong>State:</strong> {{ getStateLabel(business.stateCode) }}</p>
            <p>{{ business.email }} | {{ business.phone }}</p>
          </div>
        </div>
        <div class="invoice-meta">
          <div class="document-type">{{ invoice.clientType === 'b2e' ? 'EXPORT INVOICE' : 'TAX INVOICE' }}</div>
          <div class="meta-grid mt-md">
            <div class="meta-item">
              <span class="label">Invoice No:</span>
              <span class="value">#{{ invoice.invoiceNumber }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Date:</span>
              <span class="value">{{ formatDate(invoice.date) }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Place of Supply:</span>
              <span class="value">{{ getStateLabel(client?.stateCode || invoice.placeOfSupply) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. BILLING INFO -->
      <div class="billing-grid">
        <div class="bill-box">
          <div class="section-title">BILL TO</div>
          <div v-if="client" class="details">
            <h4 class="m-0">{{ client.name }}</h4>
            <p>{{ client.address }}</p>
            <p v-if="client.gstin"><strong>GSTIN:</strong> {{ client.gstin }}</p>
            <p v-if="client.stateCode"><strong>State:</strong> {{ getStateLabel(client.stateCode) }}</p>
            <p v-if="invoice.clientType === 'b2e' && invoice.lutNumber"><strong>LUT No:</strong> {{ invoice.lutNumber }}</p>
          </div>
        </div>
        <div class="compliance-box text-right">
           <div class="compliance-item">
              <span class="label">Reverse Charge:</span>
              <span class="value">{{ invoice.reverseCharge ? 'Yes' : 'No' }}</span>
           </div>
        </div>
      </div>

      <!-- 3. ITEMS TABLE (Official Format) -->
      <table class="invoice-table">
        <thead>
          <tr>
            <th width="40">#</th>
            <th class="text-left">Description</th>
            <th width="100">HSN/SAC</th>
            <th class="text-right" width="60">Qty</th>
            <th class="text-right" width="100">Rate (Incl)</th>
            <th class="text-right" width="120">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in invoice.items" :key="item.id">
            <td class="text-center">{{ index + 1 }}</td>
            <td>
              <div class="item-name">{{ item.name }}</div>
            </td>
            <td class="text-center">{{ item.hsnCode || '-' }}</td>
            <td class="text-right">{{ item.quantity }}</td>
            <td class="text-right">{{ formatCurrency(item.price, invoice.currency) }}</td>
            <td class="text-right">{{ formatCurrency(item.total, invoice.currency) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 4. TOTALS & TAX SUMMARY -->
      <div class="footer-grid">
        <div class="left-col">
          <div v-if="exportDeclaration" class="export-note">
            {{ exportDeclaration }}
          </div>
          
          <!-- HSN Summary Table -->
          <div class="tax-summary-wrapper mt-md">
            <div class="summary-title">Tax Summary Breakdown</div>
            <table class="tax-table">
              <thead>
                <tr>
                  <th>HSN</th>
                  <th>Taxable Value</th>
                  <th v-if="!isInterState">CGST</th>
                  <th v-if="!isInterState">SGST</th>
                  <th v-if="isInterState">IGST</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="h in hsnSummary" :key="h.hsn">
                  <td>{{ h.hsn }}</td>
                  <td>{{ formatCurrency(h.taxable, invoice.currency) }}</td>
                  <td v-if="!isInterState">{{ formatCurrency(h.cgst, invoice.currency) }}</td>
                  <td v-if="!isInterState">{{ formatCurrency(h.sgst, invoice.currency) }}</td>
                  <td v-if="isInterState">{{ formatCurrency(h.igst, invoice.currency) }}</td>
                  <td>{{ formatCurrency(h.cgst + h.sgst + h.igst, invoice.currency) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="amount-words mt-md">
            <span class="label">Amount in Words:</span>
            <div class="value">{{ numberToWords(Math.round(invoice.totalAmount)) }}</div>
          </div>

          <div class="bank-details mt-lg" v-if="business.bankName">
             <div class="summary-title">Bank Details</div>
             <p><strong>Bank:</strong> {{ business.bankName }}</p>
             <p><strong>A/c No:</strong> {{ business.bankAccountNo }}</p>
             <p><strong>IFSC:</strong> {{ business.bankIFSC }}</p>
          </div>
        </div>

        <div class="right-col">
          <div class="totals-block">
             <div class="row">
               <span>Total Taxable Value</span>
               <span>{{ formatCurrency(invoice.subtotal, invoice.currency) }}</span>
             </div>
             <div class="row">
               <span>Total Tax Amount</span>
               <span>{{ formatCurrency(invoice.taxTotal, invoice.currency) }}</span>
             </div>
             <div class="row grand-total">
               <span>Grand Total</span>
               <span>{{ formatCurrency(invoice.totalAmount, invoice.currency) }}</span>
             </div>
          </div>
          
          <div class="signature-block mt-xxl">
             <div class="sig-space"></div>
             <p class="sig-label">Authorized Signatory</p>
             <p class="sig-company">For {{ business.name }}</p>
          </div>
        </div>
      </div>

      <div class="footer-disclaimer mt-xl">
        <p>Certified that the particulars given above are true and correct.</p>
        <p>This is a computer generated invoice.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invoice-preview-canvas { width: 100%; display: flex; justify-content: center; }
.invoice-preview-canvas.is-mini { padding: 0; transform: scale(0.6); transform-origin: top center; }

.invoice-paper {
  background: white; width: 800px; min-height: 1100px; padding: 40px;
  box-shadow: 0 0 20px rgba(0,0,0,0.1); color: #1a1a1a;
  font-family: 'Inter', sans-serif; display: flex; flex-direction: column;
}

.paper-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; }
.brand-info h2 { font-weight: 800; font-size: 1.4rem; color: #000; }
.brand-info p { margin: 2px 0; font-size: 0.85rem; color: #444; }
.logo-circle { width: 60px; height: 60px; background: #eee; border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
.logo-circle img { width: 100%; height: 100%; object-fit: contain; }

.document-type { font-size: 2rem; font-weight: 900; color: #000; text-align: right; }
.meta-grid { display: grid; gap: 4px; font-size: 0.85rem; }
.meta-item { display: flex; justify-content: flex-end; gap: 10px; }
.meta-item .label { color: #666; font-weight: 600; }
.meta-item .value { font-weight: 700; color: #000; }

.billing-grid { display: grid; grid-template-columns: 1fr 1fr; margin-top: 30px; gap: 20px; }
.section-title { font-weight: 800; font-size: 0.75rem; color: #888; border-bottom: 1px solid #eee; margin-bottom: 8px; }
.details p { margin: 2px 0; font-size: 0.85rem; }

.compliance-item { font-size: 0.85rem; margin-top: 25px; }
.compliance-item .label { color: #666; margin-right: 8px; }
.compliance-item .value { font-weight: 700; }

.invoice-table { width: 100%; border-collapse: collapse; margin-top: 30px; border: 1px solid #000; }
.invoice-table th { padding: 8px; background: #f8f8f8; font-size: 0.75rem; border: 1px solid #000; }
.invoice-table td { padding: 10px 8px; border: 1px solid #000; font-size: 0.85rem; }

.footer-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; margin-top: 30px; flex: 1; }
.export-note { font-size: 0.75rem; font-style: italic; color: #444; border-left: 3px solid #000; padding-left: 10px; }

.tax-table { width: 100%; border-collapse: collapse; font-size: 0.7rem; border: 1px solid #eee; }
.tax-table th, .tax-table td { border: 1px solid #eee; padding: 4px; text-align: right; }
.tax-table th { background: #fafafa; text-align: center; }

.amount-words { font-size: 0.8rem; font-style: italic; color: #555; }
.amount-words .label { font-size: 0.7rem; font-weight: 700; color: #999; text-transform: uppercase; }

.totals-block { display: flex; flex-direction: column; gap: 8px; border: 1px solid #000; padding: 15px; }
.totals-block .row { display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 500; }
.totals-block .grand-total { border-top: 2px solid #000; padding-top: 10px; font-weight: 800; color: #000; font-size: 1.1rem; }

.signature-block { text-align: right; }
.sig-space { height: 60px; }
.sig-label { font-weight: 800; font-size: 0.9rem; margin: 0; }
.sig-company { font-size: 0.75rem; color: #666; margin-top: 2px; }

.footer-disclaimer { border-top: 1px dashed #ccc; padding-top: 15px; text-align: center; font-size: 0.7rem; color: #888; }
</style>
