/* src/utils/taxUtils.ts */

export interface TaxBreakdown {
  cgst: number
  sgst: number
  igst: number
  totalTax: number
}

/**
 * Calculate GST breakdown based on amount and rate
 * @param amount The base amount
 * @param rate Total GST rate (e.g. 18 for 18%)
 * @param isInterState Whether it's an inter-state sale (IGST) or intra-state (CGST/SGST)
 */
export const calculateGST = (
  amount: number, 
  rate: number, 
  isInterState: boolean = false
): TaxBreakdown => {
  const totalTax = (amount * rate) / 100
  
  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: totalTax,
      totalTax
    }
  }

  // Intra-state split (50/50)
  const halfTax = totalTax / 2
  return {
    cgst: halfTax,
    sgst: halfTax,
    igst: 0,
    totalTax
  }
}

/**
 * Simple calculation for non-GST taxes
 */
export const calculateTax = (amount: number, rate: number): number => {
  return (amount * rate) / 100
}
