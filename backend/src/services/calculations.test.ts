import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSalariesSheet, parseProjectPricesSheet, parseTimesheetSheet } from './excelParser.js';
import { calculateDashboardMetrics, calculateProjectMetrics, DEFAULT_CONFIG } from './calculations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Domain Math & Self-Check Reconciles to 0.00 AED on Sample 2025 Data', () => {
  const sampleDir = path.resolve(__dirname, '../../../sample');

  const salariesBuf = fs.readFileSync(path.join(sampleDir, 'salaries-2025.xlsx'));
  const pricesBuf = fs.readFileSync(path.join(sampleDir, 'project-prices-2025.xlsx'));
  const tsBuf = fs.readFileSync(path.join(sampleDir, 'timesheet-2025.xlsx'));

  const salaries = parseSalariesSheet(salariesBuf);
  const prices = parseProjectPricesSheet(pricesBuf);
  const timesheet = parseTimesheetSheet(tsBuf);

  // Assert counts
  assert.equal(salaries.length, 12 * 12, '12 employees * 12 months = 144 salary entries');
  assert.equal(prices.length, 11, '11 projects in prices sheet');
  assert.equal(timesheet.length, 562, '562 timesheet rows in sample');

  // Total salaries calculation
  const totalSalaries = salaries.reduce((sum, s) => sum + s.salary, 0);
  assert.equal(totalSalaries, 2400000, 'Total company salaries should be 2,400,000 AED');

  // Full year dashboard metrics with overhead = 0
  const { metrics, monthlyReconciliations } = calculateDashboardMetrics(
    timesheet,
    prices,
    salaries,
    { ...DEFAULT_CONFIG, monthlyOverhead: 0 }
  );

  assert.equal(metrics.reconciliationAudit.isReconciled, true, 'Audit must reconcile');
  assert.equal(
    metrics.reconciliationAudit.difference,
    0,
    'Self-check difference must be 0 to the dirham'
  );
  assert.equal(
    metrics.reconciliationAudit.totalProjectCost,
    2400000,
    'Total billable project costs must equal total salaries (2,400,000)'
  );

  // Verify project metrics calculation
  const projectMetrics = calculateProjectMetrics(
    timesheet,
    prices,
    new Map(), // will recompute or use contexts
    DEFAULT_CONFIG
  );
  assert.ok(projectMetrics.length >= 11, 'Projects metrics computed');

  console.log('Self-check verified: Total Salaries == Total Project Cost (Diff = 0.00 AED)');
});
