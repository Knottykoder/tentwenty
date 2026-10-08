import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from '../db/prisma.js';
import {
  TimesheetEntry,
  SalaryEntry,
  ProjectPriceEntry,
  AppConfig
} from '../types/index.js';
import { DEFAULT_CONFIG } from './calculations.js';
import {
  parseSalariesSheet,
  parseProjectPricesSheet,
  parseTimesheetSheet
} from './excelParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAMPLE_DIR = path.resolve(__dirname, '../../../sample');

export interface AppStoreData {
  timesheets: TimesheetEntry[];
  salaries: SalaryEntry[];
  projectPrices: ProjectPriceEntry[];
  config: AppConfig;
  lastUpdated: string;
}

class Store {
  /**
   * Fetch all application data from SQLite via Prisma
   */
  public async getData(): Promise<AppStoreData> {
    const [timesheetRecords, salaryRecords, priceRecords, configRecord] = await Promise.all([
      prisma.timesheet.findMany({ orderBy: { id: 'asc' } }),
      prisma.salary.findMany({ orderBy: { id: 'asc' } }),
      prisma.projectPrice.findMany({ orderBy: { refCode: 'asc' } }),
      prisma.systemConfig.findFirst({ where: { id: 1 } })
    ]);

    const timesheets: TimesheetEntry[] = timesheetRecords.map((t) => ({
      id: String(t.id),
      month: t.month,
      rawMonth: t.rawMonth,
      employeeNo: t.employeeNo,
      employeeName: t.employeeName,
      expenseType: t.expenseType,
      department: t.department,
      designation: t.designation,
      category: t.category,
      refCode: t.refCode,
      taskOrProjectName: t.taskOrProjectName,
      companyName: t.companyName,
      description: t.description,
      hours: t.hours
    }));

    const salaries: SalaryEntry[] = salaryRecords.map((s) => ({
      employeeNo: s.employeeNo,
      employeeName: s.employeeName,
      month: s.month,
      salary: s.salary
    }));

    const projectPrices: ProjectPriceEntry[] = priceRecords.map((p) => ({
      refCode: p.refCode,
      projectName: p.projectName,
      price: p.price,
      salesMonth: p.salesMonth,
      category: p.category,
      status: p.status
    }));

    let config: AppConfig = { ...DEFAULT_CONFIG };
    if (configRecord) {
      try {
        const parsedCategories = JSON.parse(configRecord.billableCategories);
        config = {
          monthlyOverhead: configRecord.monthlyOverhead,
          billableCategories: Array.isArray(parsedCategories)
            ? parsedCategories
            : DEFAULT_CONFIG.billableCategories
        };
      } catch {
        config = {
          monthlyOverhead: configRecord.monthlyOverhead,
          billableCategories: DEFAULT_CONFIG.billableCategories
        };
      }
    }

    return {
      timesheets,
      salaries,
      projectPrices,
      config,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Update configuration in SQLite
   */
  public async updateConfig(newConfig: Partial<AppConfig>): Promise<AppConfig> {
    const existing = await prisma.systemConfig.findFirst({ where: { id: 1 } });
    const currentCategories: string[] = existing
      ? JSON.parse(existing.billableCategories)
      : DEFAULT_CONFIG.billableCategories;
    const currentOverhead = existing ? existing.monthlyOverhead : DEFAULT_CONFIG.monthlyOverhead;

    const updatedCategories = newConfig.billableCategories ?? currentCategories;
    const updatedOverhead = newConfig.monthlyOverhead ?? currentOverhead;

    await prisma.systemConfig.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        monthlyOverhead: updatedOverhead,
        billableCategories: JSON.stringify(updatedCategories)
      },
      update: {
        monthlyOverhead: updatedOverhead,
        billableCategories: JSON.stringify(updatedCategories)
      }
    });

    return {
      monthlyOverhead: updatedOverhead,
      billableCategories: updatedCategories
    };
  }

  /**
   * Upsert timesheets. Replaces months present in uploaded data.
   */
  public async upsertTimesheets(newEntries: TimesheetEntry[], targetMonth?: string) {
    if (newEntries.length === 0) return;

    const monthsToDelete = targetMonth
      ? [targetMonth]
      : Array.from(new Set(newEntries.map((t) => t.month)));

    await prisma.$transaction(async (tx) => {
      await tx.timesheet.deleteMany({
        where: {
          month: { in: monthsToDelete }
        }
      });

      await tx.timesheet.createMany({
        data: newEntries.map((t) => ({
          month: t.month,
          rawMonth: t.rawMonth || '',
          employeeNo: t.employeeNo,
          employeeName: t.employeeName,
          expenseType: t.expenseType || '',
          department: t.department || '',
          designation: t.designation || '',
          category: t.category || '',
          refCode: t.refCode || '',
          taskOrProjectName: t.taskOrProjectName || '',
          companyName: t.companyName || '',
          description: t.description || '',
          hours: t.hours
        }))
      });
    });
  }

  /**
   * Upsert salaries. Replaces months present in uploaded data.
   */
  public async upsertSalaries(newEntries: SalaryEntry[]) {
    if (newEntries.length === 0) return;

    const uploadedMonths = Array.from(new Set(newEntries.map((s) => s.month)));

    await prisma.$transaction(async (tx) => {
      await tx.salary.deleteMany({
        where: {
          month: { in: uploadedMonths }
        }
      });

      await tx.salary.createMany({
        data: newEntries.map((s) => ({
          employeeNo: s.employeeNo,
          employeeName: s.employeeName,
          month: s.month,
          salary: s.salary
        }))
      });
    });
  }

  /**
   * Upsert project prices into SQLite.
   */
  public async upsertProjectPrices(newEntries: ProjectPriceEntry[]) {
    for (const p of newEntries) {
      await prisma.projectPrice.upsert({
        where: { refCode: p.refCode },
        create: {
          refCode: p.refCode,
          projectName: p.projectName,
          price: p.price,
          salesMonth: p.salesMonth || '',
          category: p.category || '',
          status: p.status || 'in progress'
        },
        update: {
          projectName: p.projectName,
          price: p.price,
          salesMonth: p.salesMonth || '',
          category: p.category || '',
          status: p.status || 'in progress'
        }
      });
    }
  }

  /**
   * Load sample Excel files directly into SQLite
   */
  public async loadSampleData(): Promise<{ success: boolean; message: string }> {
    try {
      const salPath = path.join(SAMPLE_DIR, 'salaries-2025.xlsx');
      const pricesPath = path.join(SAMPLE_DIR, 'project-prices-2025.xlsx');
      const tsPath = path.join(SAMPLE_DIR, 'timesheet-2025.xlsx');

      if (!fs.existsSync(salPath) || !fs.existsSync(pricesPath) || !fs.existsSync(tsPath)) {
        return { success: false, message: 'Sample files not found at ' + SAMPLE_DIR };
      }

      const salariesBuf = fs.readFileSync(salPath);
      const pricesBuf = fs.readFileSync(pricesPath);
      const tsBuf = fs.readFileSync(tsPath);

      const salaries = parseSalariesSheet(salariesBuf);
      const projectPrices = parseProjectPricesSheet(pricesBuf);
      const timesheets = parseTimesheetSheet(tsBuf);

      await this.clearAll();

      await prisma.$transaction(async (tx) => {
        // 1. Insert salaries
        await tx.salary.createMany({
          data: salaries.map((s) => ({
            employeeNo: s.employeeNo,
            employeeName: s.employeeName,
            month: s.month,
            salary: s.salary
          }))
        });

        // 2. Insert project prices
        await tx.projectPrice.createMany({
          data: projectPrices.map((p) => ({
            refCode: p.refCode,
            projectName: p.projectName,
            price: p.price,
            salesMonth: p.salesMonth || '',
            category: p.category || '',
            status: p.status || 'in progress'
          }))
        });

        // 3. Insert timesheets
        await tx.timesheet.createMany({
          data: timesheets.map((t) => ({
            month: t.month,
            rawMonth: t.rawMonth || '',
            employeeNo: t.employeeNo,
            employeeName: t.employeeName,
            expenseType: t.expenseType || '',
            department: t.department || '',
            designation: t.designation || '',
            category: t.category || '',
            refCode: t.refCode || '',
            taskOrProjectName: t.taskOrProjectName || '',
            companyName: t.companyName || '',
            description: t.description || '',
            hours: t.hours
          }))
        });

        // 4. Default config
        await tx.systemConfig.upsert({
          where: { id: 1 },
          create: {
            id: 1,
            monthlyOverhead: DEFAULT_CONFIG.monthlyOverhead,
            billableCategories: JSON.stringify(DEFAULT_CONFIG.billableCategories)
          },
          update: {
            monthlyOverhead: DEFAULT_CONFIG.monthlyOverhead,
            billableCategories: JSON.stringify(DEFAULT_CONFIG.billableCategories)
          }
        });
      });

      return {
        success: true,
        message: `Sample data loaded into SQLite: ${salaries.length} salaries, ${projectPrices.length} projects, ${timesheets.length} timesheets`
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: 'Failed to load sample data into SQLite: ' + msg };
    }
  }

  /**
   * Clear all records from SQLite
   */
  public async clearAll() {
    await prisma.$transaction([
      prisma.timesheet.deleteMany(),
      prisma.salary.deleteMany(),
      prisma.projectPrice.deleteMany(),
      prisma.systemConfig.deleteMany()
    ]);
  }
}

export const store = new Store();
