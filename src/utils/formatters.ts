/* src/utils/formatters.ts */

/**
 * Format a number dynamically based on currency
 */
export const formatCurrency = (amount: number, currencyCode: string = 'INR'): string => {
  const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format date to string (DD-MM-YYYY)
 */
export const formatDate = (timestamp: number): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(timestamp))
}

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Convert number to Indian currency words
 */
export const numberToWords = (num: number): string => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numStr = Math.floor(num).toString();
  if (numStr.length > 9) return 'Overflow';
  
  const padded = ('000000000' + numStr).substring(numStr.length);
  const n = padded.match(/^(\d{2})(\d{1,2})?(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  
  // Re-adjust regex matching groups for Indian system: Crore(2), Lakh(2), Thousand(2), Hundred(1), Tens/Ones(2)
  // Wait, let's use a simpler iterative approach for safety
  const units = [
    { label: 'Crore', value: 10000000 },
    { label: 'Lakh', value: 100000 },
    { label: 'Thousand', value: 1000 },
    { label: 'Hundred', value: 100 }
  ];

  let remaining = Math.floor(num);
  let words = '';

  if (remaining === 0) return 'Zero Only';

  for (const { label, value } of units) {
    if (remaining >= value) {
      const count = Math.floor(remaining / value);
      words += convertSection(count, a, b) + label + ' ';
      remaining %= value;
    }
  }

  if (remaining > 0) {
    if (words !== '') words += 'and ';
    words += convertSection(remaining, a, b);
  }

  return words.trim() + ' Only';
}

function convertSection(n: number, a: string[], b: string[]): string {
  if (n < 20) return a[n] || '';
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return (b[tens] || '') + ' ' + (a[ones] || '');
}
