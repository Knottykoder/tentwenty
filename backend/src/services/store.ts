import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const SAMPLE_DIR = path.resolve(__dirname, '../../../sample');

export interface AppStoreData {
  timesheets: TimesheetEntry[];
  salaries: SalaryEntry[];
  projectPrices: ProjectPriceEntry[];
  config: AppConfig;
  lastUpdated: string;
}

class Store {
  private data: AppStoreData;

  constructor() {
    this.data = {
      timesheets: [],
      salaries: [],
      projectPrices: [],
      config: { ...DEFAULT_CONFIG },
      lastUpdated: new Date().toISOString()
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error initializing store:', err);
    }
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      this.data.lastUpdated = new Date().toISOString();
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save store to disk:', err);
    }
  }

  public getData(): AppStoreData {
    return this.data;
  }

  public updateConfig(newConfig: Partial<AppConfig>) {
    this.data.config = {
      ...this.data.config,
      ...newConfig
    };
    this.save();
    return this.data.config;
  }

  /**
   * Upsert timesheets. If targetMonth is provided, replaces that month's rows without destroying the rest.
   * Otherwise deduplicates by unique key.
   */
  public upsertTimesheets(newEntries: TimesheetEntry[], targetMonth?: string) {
    if (targetMonth) {
      // Keep everything EXCEPT targetMonth
      const filtered = this.data.timesheets.filter((t) => t.month !== targetMonth);
      this.data.timesheets = [...filtered, ...newEntries];
    } else {
      // Find which months are in newEntries
      const uploadedMonths = new Set(newEntries.map((t) => t.month));
      // Remove those months from existing and insert new
      const filtered = this.data.timesheets.filter((t) => !uploadedMonths.has(t.month));
      this.data.timesheets = [...filtered, ...newEntries];
    }
    this.save();
  }

  /**
   * Upsert salaries. Replaces months present in uploaded data.
   */
  public upsertSalaries(newEntries: SalaryEntry[]) {
    const uploadedMonths = new Set(newEntries.map((s) => s.month));
    const filtered = this.data.salaries.filter((s) => !uploadedMonths.has(s.month));
    this.data.salaries = [...filtered, ...newEntries];
    this.save();
  }

  /**
   * Upsert project prices. Updates existing by refCode or appends.
   */
  public upsertProjectPrices(newEntries: ProjectPriceEntry[]) {
    const priceMap = new Map(this.data.projectPrices.map((p) => [p.refCode, p]));
    for (const p of newEntries) {
      priceMap.set(p.refCode, p);
    }
    this.data.projectPrices = Array.from(priceMap.values());
    this.save();
  }

  /**
   * Load the 3 sample files bundled in the repo
   */
  public loadSampleData(): { success: boolean; message: string } {
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

      this.data.salaries = parseSalariesSheet(salariesBuf);
      this.data.projectPrices = parseProjectPricesSheet(pricesBuf);
      this.data.timesheets = parseTimesheetSheet(tsBuf);
      this.data.config = { ...DEFAULT_CONFIG };
      this.save();

      return {
        success: true,
        message: `Sample data loaded: ${this.data.salaries.length} salaries, ${this.data.projectPrices.length} projects, ${this.data.timesheets.length} timesheets`
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: 'Failed to load sample data: ' + msg };
    }
  }

  public clearAll() {
    this.data = {
      timesheets: [],
      salaries: [],
      projectPrices: [],
      config: { ...DEFAULT_CONFIG },
      lastUpdated: new Date().toISOString()
    };
    this.save();
  }
}

export const store = new Store();
