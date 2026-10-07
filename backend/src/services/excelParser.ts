import * as XLSX from 'xlsx';
import { TimesheetEntry, SalaryEntry, ProjectPriceEntry } from '../types/index.js';
import { normalizeMonth, parseNumber, cleanString, findHeaderRow } from './normalizer.js';

export function parseSalariesSheet(buffer: Buffer): SalaryEntry[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rawData: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Locate header row containing "employee" and at least one month
  const headerIdx = findHeaderRow(rawData, ['employee']);
  const headers = rawData[headerIdx] as string[];

  // Find column indices
  let empNoCol = -1;
  let empNameCol = -1;
  const monthCols: { colIndex: number; monthName: string }[] = [];

  const MONTH_NAMES = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  headers.forEach((h, colIdx) => {
    const str = String(h || '').trim().toLowerCase();
    if (str.includes('no') || str.includes('id') || str.includes('code')) {
      empNoCol = colIdx;
    } else if (str.includes('employee') || str.includes('name')) {
      empNameCol = colIdx;
    }

    // Check if this column is a month
    for (const m of MONTH_NAMES) {
      if (str.includes(m)) {
        monthCols.push({ colIndex: colIdx, monthName: str });
        break;
      }
    }
  });

  if (empNameCol === -1) {
    empNameCol = 1; // Default fallback to column B
  }
  if (empNoCol === -1) {
    empNoCol = 0; // Default fallback to column A
  }

  const entries: SalaryEntry[] = [];

  for (let r = headerIdx + 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!Array.isArray(row)) continue;

    const empNo = cleanString(row[empNoCol]);
    const empName = cleanString(row[empNameCol]);
    if (!empName && !empNo) continue;

    for (const mCol of monthCols) {
      const normalizedMonth = normalizeMonth(mCol.monthName, '2025');
      const salary = parseNumber(row[mCol.colIndex]);
      entries.push({
        employeeNo: empNo || empName,
        employeeName: empName || empNo,
        month: normalizedMonth,
        salary
      });
    }
  }

  return entries;
}

export function parseProjectPricesSheet(buffer: Buffer): ProjectPriceEntry[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rawData: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const headerIdx = findHeaderRow(rawData, ['ref']);
  const headers = rawData[headerIdx] as string[];

  let refCol = 0;
  let nameCol = 1;
  let priceCol = 2;
  let monthCol = 3;
  let catCol = 4;
  let statusCol = 5;

  headers.forEach((h, idx) => {
    const s = String(h || '').toLowerCase();
    if (s.includes('ref')) refCol = idx;
    else if (s.includes('project') || s.includes('name')) nameCol = idx;
    else if (s.includes('price')) priceCol = idx;
    else if (s.includes('sales') || s.includes('month')) monthCol = idx;
    else if (s.includes('category')) catCol = idx;
    else if (s.includes('status')) statusCol = idx;
  });

  const entries: ProjectPriceEntry[] = [];

  for (let r = headerIdx + 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!Array.isArray(row)) continue;

    const refCode = cleanString(row[refCol]);
    if (!refCode) continue;

    const projectName = cleanString(row[nameCol]) || refCode;
    const price = parseNumber(row[priceCol]);
    const salesMonth = cleanString(row[monthCol]);
    const category = cleanString(row[catCol]) || 'Projects';
    const status = cleanString(row[statusCol]) || 'in progress';

    entries.push({
      refCode,
      projectName,
      price,
      salesMonth,
      category,
      status
    });
  }

  return entries;
}

export function parseTimesheetSheet(buffer: Buffer): TimesheetEntry[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rawData: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const headerIdx = findHeaderRow(rawData, ['employee', 'hours']);
  const headers = rawData[headerIdx] as string[];

  let monthCol = -1;
  let empNoCol = -1;
  let empNameCol = -1;
  let expenseCol = -1;
  let deptCol = -1;
  let desigCol = -1;
  let catCol = -1;
  let refCol = -1;
  let taskCol = -1;
  let companyCol = -1;
  let descCol = -1;
  let hoursCol = -1;

  headers.forEach((h, idx) => {
    const s = String(h || '').toLowerCase();
    if (s.includes('month') && monthCol === -1) monthCol = idx;
    else if ((s.includes('employee no') || s.includes('emp no')) && empNoCol === -1) empNoCol = idx;
    else if (s.includes('employee name') && empNameCol === -1) empNameCol = idx;
    else if (s.includes('expense') && expenseCol === -1) expenseCol = idx;
    else if (s.includes('department') && deptCol === -1) deptCol = idx;
    else if (s.includes('designation') && desigCol === -1) desigCol = idx;
    else if (s.includes('category') && catCol === -1) catCol = idx;
    else if (s.includes('ref code') && refCol === -1) refCol = idx;
    else if ((s.includes('project') || s.includes('task')) && taskCol === -1) taskCol = idx;
    else if (s.includes('company') && companyCol === -1) companyCol = idx;
    else if (s.includes('description') && descCol === -1) descCol = idx;
    else if (s.includes('hours') && hoursCol === -1) hoursCol = idx;
  });

  const entries: TimesheetEntry[] = [];

  for (let r = headerIdx + 1; r < rawData.length; r++) {
    const row = rawData[r];
    if (!Array.isArray(row)) continue;

    const rawMonth = cleanString(row[monthCol]);
    const empName = cleanString(row[empNameCol]);
    const hours = parseNumber(row[hoursCol]);

    if (!empName && hours === 0) continue;

    const normalizedMonth = normalizeMonth(rawMonth, '2025');

    entries.push({
      month: normalizedMonth,
      rawMonth,
      employeeNo: cleanString(row[empNoCol]),
      employeeName: empName,
      expenseType: cleanString(row[expenseCol]) || 'DL',
      department: cleanString(row[deptCol]) || 'General',
      designation: cleanString(row[desigCol]) || 'Staff',
      category: cleanString(row[catCol]) || 'Other',
      refCode: cleanString(row[refCol]),
      taskOrProjectName: cleanString(row[taskCol]),
      companyName: cleanString(row[companyCol]),
      description: cleanString(row[descCol]),
      hours
    });
  }

  return entries;
}
