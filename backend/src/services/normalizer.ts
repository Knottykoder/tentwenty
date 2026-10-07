const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

const MONTH_ABBR = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
];

/**
 * Normalizes any messy month representation (e.g. "January 2025", "May '25", "January", "2025-01")
 * into canonical "YYYY-MM" format. Defaults to defaultYear (e.g. "2025") if year is omitted.
 */
export function normalizeMonth(raw: unknown, defaultYear: string = '2025'): string {
  if (!raw) return `${defaultYear}-01`;
  const str = String(raw).trim().toLowerCase();

  // If already YYYY-MM
  const yyyyMmMatch = str.match(/^(\d{4})[-/](0[1-9]|1[0-2])$/);
  if (yyyyMmMatch) {
    return `${yyyyMmMatch[1]}-${yyyyMmMatch[2]}`;
  }

  // Detect year: 4-digit (e.g. 2025) or 2-digit apostrophe (e.g. '25 or 25)
  let year = defaultYear;
  const fourDigitYear = str.match(/(20\d{2})/);
  if (fourDigitYear) {
    year = fourDigitYear[1];
  } else {
    const twoDigitYear = str.match(/'(\d{2})|\b(\d{2})\b/);
    if (twoDigitYear) {
      const yy = twoDigitYear[1] || twoDigitYear[2];
      year = `20${yy}`;
    }
  }

  // Detect month name
  for (let i = 0; i < 12; i++) {
    const full = MONTH_NAMES[i];
    const abbr = MONTH_ABBR[i];
    if (str.includes(full) || str.includes(abbr)) {
      const monthNum = String(i + 1).padStart(2, '0');
      return `${year}-${monthNum}`;
    }
  }

  // If purely number 1..12
  const num = parseInt(str, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    return `${year}-${String(num).padStart(2, '0')}`;
  }

  return `${year}-01`;
}

/**
 * Safe number parser: converts "-", empty string, "AED 18,000", null/undefined to clean number
 */
export function parseNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const s = String(val).trim().replace(/,/g, '').replace(/[^\d.-]/g, '');
  if (!s || s === '-') return 0;
  const num = parseFloat(s);
  return isNaN(num) ? 0 : num;
}

/**
 * Safe string trimmer
 */
export function cleanString(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

/**
 * Find header row index from raw 2D sheet data
 */
export function findHeaderRow(rows: unknown[][], anchorKeywords: string[]): number {
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;
    const rowStr = row.map((cell) => String(cell || '').toLowerCase()).join(' ');
    const allFound = anchorKeywords.every((kw) => rowStr.includes(kw.toLowerCase()));
    if (allFound) {
      return i;
    }
  }
  return 0;
}
