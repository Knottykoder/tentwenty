export const MONTH_NAMES: Record<string, string> = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December'
};

/**
 * Format currency amount in AED with standard commas
 */
export function formatAed(amount: number, decimals = 0): string {
  if (isNaN(amount)) return 'AED 0';
  return `AED ${amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

/**
 * Format hours with 'h' suffix
 */
export function formatHours(hours: number, decimals = 1): string {
  if (isNaN(hours)) return '0h';
  return `${hours.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}h`;
}

/**
 * Format percentage with '%' suffix
 */
export function formatPercent(percent: number, decimals = 1): string {
  if (isNaN(percent)) return '0%';
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Converts 'YYYY-MM' (e.g. '2025-03') to formatted label ('03 - March')
 */
export function formatMonthLabel(monthStr: string): string {
  if (!monthStr || monthStr === 'all') return 'All Months';
  const monthPart = monthStr.includes('-') ? monthStr.split('-')[1] : monthStr;
  const name = MONTH_NAMES[monthPart];
  return name ? `${monthPart} - ${name}` : monthStr;
}
