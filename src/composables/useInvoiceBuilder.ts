import { ref, watch } from 'vue'
import type { Invoice, InvoiceItem, Product } from '../types'
import { generateId } from '../utils/formatters'
import { calculateGST, isB2CLarge } from '../utils/taxUtils'

export function useInvoiceBuilder(initialInvoice?: Invoice, nextNumber?: string) {
  const invoice = ref<Omit<Invoice, 'id'>>({
    invoiceNumber: initialInvoice?.invoiceNumber || nextNumber || '',
    date: initialInvoice?.date || Date.now(),
    dueDate: initialInvoice?.dueDate || (Date.now() + 7 * 24 * 60 * 60 * 1000),
    clientId: initialInvoice?.clientId || '',
    clientType: initialInvoice?.clientType || 'b2b',
    currency: initialInvoice?.currency || 'INR',
    lutNumber: initialInvoice?.lutNumber || '',
    isTaxableExport: initialInvoice?.isTaxableExport || false,
    reverseCharge: initialInvoice?.reverseCharge || false,
    placeOfSupply: initialInvoice?.placeOfSupply || '',
    items: initialInvoice?.items || [],
    subtotal: initialInvoice?.subtotal || 0,
    taxTotal: initialInvoice?.taxTotal || 0,
    discount: initialInvoice?.discount || 0,
    discountType: initialInvoice?.discountType || 'percentage',
    totalAmount: initialInvoice?.totalAmount || 0,
    isRounded: initialInvoice?.isRounded || false,
    status: initialInvoice?.status || 'draft',
    notes: initialInvoice?.notes || '',
    terms: initialInvoice?.terms || ''
  })

  // Auto-sync due date (keep 7 day gap) when issue date changes
  watch(() => invoice.value.date, (newDate, oldDate) => {
    if (newDate !== oldDate) {
      invoice.value.dueDate = newDate + (7 * 24 * 60 * 60 * 1000)
    }
  })

  const isInterState = ref(false)

  const addItem = (product: Product) => {
    const item: InvoiceItem = {
      id: generateId(),
      productId: product.id,
      name: product.name,
      hsnCode: product.hsnCode,
      quantity: 1,
      price: product.price, // Tax Inclusive
      taxRate: product.taxRate,
      taxAmount: 0,
      total: 0
    }
    invoice.value.items.push(item)
    calculateTotals()
  }

  const removeItem = (id: string) => {
    invoice.value.items = invoice.value.items.filter(i => i.id !== id)
    calculateTotals()
  }

  const calculateTotals = () => {
    let subtotalSum = 0
    let taxSum = 0
    
    // 1. Calculate the total weight of original gross amount to apply fixed discount proportionally
    const totalOriginalGross = invoice.value.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    invoice.value.items.forEach(item => {
      const originalItemGross = item.price * item.quantity
      
      // 2. Determine the discount for this specific item
      let itemDiscountValue = 0
      if (invoice.value.discount > 0) {
        if (invoice.value.discountType === 'percentage') {
          itemDiscountValue = (originalItemGross * invoice.value.discount) / 100
        } else if (totalOriginalGross > 0) {
          // Weighted distribution for fixed discount
          itemDiscountValue = (originalItemGross / totalOriginalGross) * invoice.value.discount
        }
      }

      // 3. LEGALLY CORRECT: Apply discount to the gross amount BEFORE reverse-calculating tax
      const netItemGross = Math.max(0, originalItemGross - itemDiscountValue)
      
      const taxResult = calculateGST(
        netItemGross, 
        item.taxRate, 
        invoice.value.clientType, 
        isInterState.value,
        invoice.value.isTaxableExport
      )
      
      item.taxAmount = taxResult.totalTax
      item.total = netItemGross // Final line total (inclusive)
      
      subtotalSum += taxResult.baseAmount
      taxSum += taxResult.totalTax
    })
    
    invoice.value.subtotal = subtotalSum
    invoice.value.taxTotal = taxSum
    
    const rawTotal = subtotalSum + taxSum
    
    // B2C Large Detection (Inter-state & value > 2.5L)
    invoice.value.isB2CLarge = isB2CLarge(rawTotal, isInterState.value, invoice.value.clientType || 'b2c')
    
    // Rounding
    invoice.value.totalAmount = invoice.value.isRounded ? Math.round(rawTotal) : rawTotal
  }

  watch(() => invoice.value.isRounded, () => calculateTotals())
  watch(() => invoice.value.discount, () => calculateTotals())
  watch(() => invoice.value.discountType, () => calculateTotals())
  watch([isInterState, () => invoice.value.isTaxableExport], () => calculateTotals())

  return {
    invoice,
    isInterState,
    addItem,
    removeItem,
    calculateTotals
  }
}
