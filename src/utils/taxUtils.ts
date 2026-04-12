/* src/utils/taxUtils.ts */

/**
 * Interface for GST Calculation Result
 */
export interface GSTResult {
  baseAmount: number
  totalTax: number
  cgst: number
  sgst: number
  igst: number
  rate: number
}

/**
 * Calculate GST from a Tax Inclusive amount
 * Formula: Base = Total / (1 + Rate/100)
 */
export const calculateGST = (
  grossAmount: number, 
  rate: number, 
  clientType: string = 'b2b',
  isInterState: boolean = false,
  isTaxableExport: boolean = false
): GSTResult => {
  // If Export and using LUT (not taxable), tax is 0
  if (clientType === 'b2e' && !isTaxableExport) {
    return {
      baseAmount: grossAmount,
      totalTax: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      rate: rate
    }
  }

  const baseAmount = grossAmount / (1 + rate / 100)
  const totalTax = grossAmount - baseAmount

  if (isInterState || clientType === 'b2e') {
    return {
      baseAmount,
      totalTax,
      cgst: 0,
      sgst: 0,
      igst: totalTax,
      rate
    }
  }

  return {
    baseAmount,
    totalTax,
    cgst: totalTax / 2,
    sgst: totalTax / 2,
    igst: 0,
    rate
  }
}

/**
 * Check if a B2C transaction is "Large" (Exceeds ₹2.5 Lakhs and is Inter-state)
 * According to GSTR-1 Table 5 standards.
 */
export const isB2CLarge = (totalAmount: number, isInterState: boolean, clientType: string) => {
  return clientType === 'b2c' && isInterState && totalAmount > 250000
}
