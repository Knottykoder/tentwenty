import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSalariesSheet, parseProjectPricesSheet, parseTimesheetSheet } from './excelParser.js';
import { validateAllUploads } from './validator.js';
import { store } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Two-Phase Pipeline: Parse ALL -> Validate ALL -> ONE Prisma Transaction -> Commit All', async () => {
  const sampleDir = path.resolve(__dirname, '../../../sample');

  // Step 1: Parse ALL files
  const salariesBuf = fs.readFileSync(path.join(sampleDir, 'salaries-2025.xlsx'));
  const pricesBuf = fs.readFileSync(path.join(sampleDir, 'project-prices-2025.xlsx'));
  const tsBuf = fs.readFileSync(path.join(sampleDir, 'timesheet-2025.xlsx'));

  const parsedSalaries = parseSalariesSheet(salariesBuf);
  const parsedPrices = parseProjectPricesSheet(pricesBuf);
  const parsedTimesheets = parseTimesheetSheet(tsBuf);

  assert.equal(parsedSalaries.length, 144, 'Parsed 144 salaries');
  assert.equal(parsedPrices.length, 11, 'Parsed 11 project prices');
  assert.equal(parsedTimesheets.length, 562, 'Parsed 562 timesheet rows');

  // Step 2: Validate ALL files (Valid case)
  const validResult = validateAllUploads({
    salaries: { filename: 'salaries-2025.xlsx', entries: parsedSalaries },
    prices: { filename: 'project-prices-2025.xlsx', entries: parsedPrices },
    timesheets: { filename: 'timesheet-2025.xlsx', entries: parsedTimesheets }
  });

  assert.equal(validResult.isValid, true, 'Sample files must be 100% valid');
  assert.equal(validResult.errors.length, 0, 'No validation errors expected');

  // Step 2b: Validate invalid batch - should abort BEFORE any DB transaction
  const invalidResult = validateAllUploads({
    salaries: {
      filename: 'corrupt-salaries.xlsx',
      entries: [
        { employeeNo: 'E99', employeeName: 'Tester', month: 'invalid-month', salary: -500 }
      ]
    }
  });

  assert.equal(invalidResult.isValid, false, 'Invalid data must fail validation');
  assert.ok(invalidResult.errors.length >= 2, 'Must report invalid month and negative salary');

  // Step 3 & 4: ONE Prisma Transaction commits everything
  const commitResult = await store.commitBatchTransaction({
    salaries: parsedSalaries,
    projectPrices: parsedPrices,
    timesheets: parsedTimesheets
  });

  assert.equal(commitResult.salaryCount, 144);
  assert.equal(commitResult.priceCount, 11);
  assert.equal(commitResult.timesheetCount, 562);

  // Verify that SQLite has the exact committed rows
  const dbData = await store.getData();

  assert.equal(dbData.salaries.length, 144, 'SQLite contains 144 salary records');
  assert.equal(dbData.projectPrices.length, 11, 'SQLite contains 11 price records');
  assert.equal(dbData.timesheets.length, 562, 'SQLite contains 562 timesheet records');
});
