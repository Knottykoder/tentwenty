import { TimesheetEntry, SalaryEntry, ProjectPriceEntry } from '../types/index.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Validates parsed Timesheet entries before database commit.
 */
export function validateTimesheetEntries(entries: TimesheetEntry[], filename: string): string[] {
  const errors: string[] = [];
  if (entries.length === 0) {
    errors.push(`${filename}: No valid timesheet rows were found.`);
    return errors;
  }

  for (let i = 0; i < entries.length; i++) {
    const row = entries[i];
    const rowNum = i + 2; // Approximate Excel row number

    if (!row.employeeNo || row.employeeNo.trim() === '') {
      errors.push(`${filename} (Row ${rowNum}): Missing Employee Number.`);
    }

    if (!row.month || !MONTH_REGEX.test(row.month)) {
      errors.push(`${filename} (Row ${rowNum}): Invalid or missing month format "${row.month}". Expected YYYY-MM.`);
    }

    if (typeof row.hours !== 'number' || isNaN(row.hours) || row.hours < 0) {
      errors.push(`${filename} (Row ${rowNum}): Invalid logged hours value "${row.hours}". Must be a non-negative number.`);
    }

    if (errors.length >= 10) {
      errors.push(`${filename}: Too many validation errors encountered (truncated).`);
      break;
    }
  }

  return errors;
}

/**
 * Validates parsed Salary entries before database commit.
 */
export function validateSalaryEntries(entries: SalaryEntry[], filename: string): string[] {
  const errors: string[] = [];
  if (entries.length === 0) {
    errors.push(`${filename}: No valid salary entries found.`);
    return errors;
  }

  const seenKeys = new Set<string>();

  for (let i = 0; i < entries.length; i++) {
    const s = entries[i];
    const idx = i + 1;

    if (!s.employeeNo || s.employeeNo.trim() === '') {
      errors.push(`${filename} (Entry ${idx}): Missing Employee Number.`);
    }

    if (!s.month || !MONTH_REGEX.test(s.month)) {
      errors.push(`${filename} (Entry ${idx}): Invalid month format "${s.month}". Expected YYYY-MM.`);
    }

    if (typeof s.salary !== 'number' || isNaN(s.salary) || s.salary < 0) {
      errors.push(`${filename} (Entry ${idx}): Invalid salary amount "${s.salary}". Must be a non-negative number.`);
    }

    // Check for duplicate (employeeNo, month)
    const key = `${s.employeeNo}_${s.month}`;
    if (seenKeys.has(key)) {
      errors.push(`${filename}: Duplicate salary entry for employee #${s.employeeNo} in month ${s.month}.`);
    } else {
      seenKeys.add(key);
    }

    if (errors.length >= 10) {
      errors.push(`${filename}: Too many validation errors encountered (truncated).`);
      break;
    }
  }

  return errors;
}

/**
 * Validates parsed Project Price entries before database commit.
 */
export function validateProjectPriceEntries(entries: ProjectPriceEntry[], filename: string): string[] {
  const errors: string[] = [];
  if (entries.length === 0) {
    errors.push(`${filename}: No valid project price rows found.`);
    return errors;
  }

  for (let i = 0; i < entries.length; i++) {
    const p = entries[i];
    const rowNum = i + 2;

    if (!p.refCode || p.refCode.trim() === '') {
      errors.push(`${filename} (Row ${rowNum}): Missing project Ref Code.`);
    }

    if (typeof p.price !== 'number' || isNaN(p.price) || p.price < 0) {
      errors.push(`${filename} (Row ${rowNum}): Invalid contract price "${p.price}". Must be a non-negative number.`);
    }

    if (errors.length >= 10) {
      errors.push(`${filename}: Too many validation errors encountered (truncated).`);
      break;
    }
  }

  return errors;
}

/**
 * Validates the entire batch across all parsed files before any database transaction is initiated.
 */
export function validateAllUploads(batch: {
  timesheets?: { filename: string; entries: TimesheetEntry[] };
  salaries?: { filename: string; entries: SalaryEntry[] };
  prices?: { filename: string; entries: ProjectPriceEntry[] };
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!batch.timesheets && !batch.salaries && !batch.prices) {
    errors.push('No recognized spreadsheet files were provided in the upload.');
    return { isValid: false, errors, warnings };
  }

  if (batch.timesheets) {
    const tsErrors = validateTimesheetEntries(batch.timesheets.entries, batch.timesheets.filename);
    errors.push(...tsErrors);
  }

  if (batch.salaries) {
    const salErrors = validateSalaryEntries(batch.salaries.entries, batch.salaries.filename);
    errors.push(...salErrors);
  }

  if (batch.prices) {
    const prErrors = validateProjectPriceEntries(batch.prices.entries, batch.prices.filename);
    errors.push(...prErrors);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
