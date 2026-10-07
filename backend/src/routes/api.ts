import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { store } from '../services/store.js';
import {
  calculateDashboardMetrics,
  calculateProjectMetrics,
  computeMonthlyContexts
} from '../services/calculations.js';
import {
  parseSalariesSheet,
  parseProjectPricesSheet,
  parseTimesheetSheet
} from '../services/excelParser.js';

export async function apiRoutes(fastify: FastifyInstance) {
  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Load sample data in 1-click
  fastify.post('/sample-data', async () => {
    const res = store.loadSampleData();
    return res;
  });

  // Reset/Clear data to return to Welcome screen
  fastify.post('/reset', async () => {
    store.clearAll();
    return { success: true, message: 'Data cleared successfully' };
  });

  // Upload spreadsheets
  fastify.post('/upload', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const parts = req.parts();
      let timesheetCount = 0;
      let salaryCount = 0;
      let priceCount = 0;
      const errors: string[] = [];

      for await (const part of parts) {
        if (part.type === 'file') {
          const buf = await part.toBuffer();
          const filename = part.filename.toLowerCase();
          const fieldname = part.fieldname.toLowerCase();

          try {
            if (fieldname.includes('salary') || filename.includes('salary')) {
              const entries = parseSalariesSheet(buf);
              if (entries.length === 0) {
                errors.push(`${part.filename}: No valid salary entries found.`);
              } else {
                store.upsertSalaries(entries);
                salaryCount += entries.length;
              }
            } else if (fieldname.includes('price') || filename.includes('price')) {
              const entries = parseProjectPricesSheet(buf);
              if (entries.length === 0) {
                errors.push(`${part.filename}: No valid project price rows found.`);
              } else {
                store.upsertProjectPrices(entries);
                priceCount += entries.length;
              }
            } else if (fieldname.includes('timesheet') || filename.includes('timesheet') || filename.includes('time')) {
              const entries = parseTimesheetSheet(buf);
              if (entries.length === 0) {
                errors.push(`${part.filename}: No valid timesheet rows found.`);
              } else {
                store.upsertTimesheets(entries);
                timesheetCount += entries.length;
              }
            } else {
              // Try to sniff by columns
              errors.push(`Unrecognized file type: ${part.filename}. Expected timesheet, salary, or project price file.`);
            }
          } catch (fileErr: unknown) {
            const msg = fileErr instanceof Error ? fileErr.message : String(fileErr);
            errors.push(`Error parsing ${part.filename}: ${msg}`);
          }
        }
      }

      return {
        success: errors.length === 0 || (timesheetCount > 0 || salaryCount > 0 || priceCount > 0),
        message: `Parsed: ${timesheetCount} timesheet rows, ${salaryCount} salary entries, ${priceCount} projects.`,
        errors
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      reply.status(500);
      return { success: false, message: 'Upload failed: ' + msg };
    }
  });

  // Settings
  fastify.get('/settings', async () => {
    const data = store.getData();
    // Get list of all available categories in timesheet
    const categories = Array.from(new Set(data.timesheets.map((t) => t.category))).sort();
    return {
      config: data.config,
      availableCategories: categories
    };
  });

  fastify.post('/settings', async (req: FastifyRequest<{ Body: { monthlyOverhead?: number; billableCategories?: string[] } }>) => {
    const updated = store.updateConfig(req.body);
    return { success: true, config: updated };
  });

  // Dashboard Overview
  fastify.get('/dashboard', async (req: FastifyRequest<{ Querystring: { month?: string; year?: string } }>) => {
    const { month, year } = req.query;
    const data = store.getData();

    let filterMonth: string | undefined = undefined;
    if (month && month !== 'all') {
      filterMonth = month;
    }

    const { metrics, monthlyReconciliations } = calculateDashboardMetrics(
      data.timesheets,
      data.projectPrices,
      data.salaries,
      data.config,
      filterMonth
    );

    // Monthly breakdown for charts
    const monthlyContexts = computeMonthlyContexts(data.timesheets, data.salaries, data.config);
    const months = Array.from(monthlyContexts.keys()).sort();
    const monthlyTrends = months.map((m) => {
      const mMetrics = calculateDashboardMetrics(data.timesheets, data.projectPrices, data.salaries, data.config, m);
      return {
        month: m,
        totalHours: mMetrics.metrics.totalHours,
        billableHours: mMetrics.metrics.billableHours,
        cost: mMetrics.metrics.totalCost,
        revenue: mMetrics.metrics.totalRevenue,
        profit: mMetrics.metrics.totalProfit,
        margin: mMetrics.metrics.grossMarginPercent
      };
    });

    // Available filters
    const availableMonths = Array.from(new Set(data.timesheets.map((t) => t.month))).sort();

    return {
      metrics,
      monthlyReconciliations,
      monthlyTrends,
      availableMonths,
      hasData: data.timesheets.length > 0
    };
  });

  // Projects list
  fastify.get('/projects', async (req: FastifyRequest<{ Querystring: { month?: string; category?: string; status?: string } }>) => {
    const data = store.getData();
    const monthlyContexts = computeMonthlyContexts(data.timesheets, data.salaries, data.config);
    let projects = calculateProjectMetrics(data.timesheets, data.projectPrices, monthlyContexts, data.config);

    if (req.query.category && req.query.category !== 'all') {
      projects = projects.filter((p) => p.category.toLowerCase() === req.query.category?.toLowerCase());
    }
    if (req.query.status && req.query.status !== 'all') {
      projects = projects.filter((p) => p.status.toLowerCase() === req.query.status?.toLowerCase());
    }

    return { projects };
  });

  // Single Project Deep Dive
  fastify.get('/projects/:refCode', async (req: FastifyRequest<{ Params: { refCode: string } }>, reply: FastifyReply) => {
    const { refCode } = req.params;
    const data = store.getData();
    const monthlyContexts = computeMonthlyContexts(data.timesheets, data.salaries, data.config);
    const projects = calculateProjectMetrics(data.timesheets, data.projectPrices, monthlyContexts, data.config);

    const project = projects.find((p) => p.refCode.toLowerCase() === refCode.toLowerCase());
    if (!project) {
      reply.status(404);
      return { success: false, message: 'Project not found' };
    }

    // Also get month-by-month hours and costs for this project
    const billableSet = new Set(data.config.billableCategories);
    const projectTs = data.timesheets.filter((t) => t.refCode.toLowerCase() === refCode.toLowerCase() && billableSet.has(t.category));
    const monthlyBreakdown = new Map<string, { hours: number; cost: number }>();

    for (const row of projectTs) {
      const ctx = monthlyContexts.get(row.month);
      const dr = ctx?.directRates.get(row.employeeName) || 0;
      const ir = ctx?.indirectRatePerHour || 0;
      const rowCost = row.hours * (dr + ir);

      const curr = monthlyBreakdown.get(row.month) || { hours: 0, cost: 0 };
      curr.hours += row.hours;
      curr.cost += rowCost;
      monthlyBreakdown.set(row.month, curr);
    }

    const timeline = Array.from(monthlyBreakdown.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([m, vals]) => ({
        month: m,
        hours: Number(vals.hours.toFixed(1)),
        cost: Number(vals.cost.toFixed(2))
      }));

    return {
      project,
      timeline
    };
  });

  // Productivity
  fastify.get('/productivity', async (req: FastifyRequest<{ Querystring: { month?: string } }>) => {
    const { month } = req.query;
    const data = store.getData();
    const billableSet = new Set(data.config.billableCategories);

    let ts = data.timesheets;
    if (month && month !== 'all') {
      ts = ts.filter((t) => t.month === month);
    }

    const monthlyContexts = computeMonthlyContexts(data.timesheets, data.salaries, data.config);

    // Group by employee
    const empMap = new Map<
      string,
      {
        employeeNo: string;
        employeeName: string;
        department: string;
        designation: string;
        totalHours: number;
        billableHours: number;
        nonBillableHours: number;
      }
    >();

    for (const row of ts) {
      const curr = empMap.get(row.employeeName) || {
        employeeNo: row.employeeNo,
        employeeName: row.employeeName,
        department: row.department,
        designation: row.designation,
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0
      };

      curr.totalHours += row.hours;
      if (billableSet.has(row.category)) {
        curr.billableHours += row.hours;
      } else {
        curr.nonBillableHours += row.hours;
      }
      empMap.set(row.employeeName, curr);
    }

    const productivityList = Array.from(empMap.values()).map((emp) => {
      const ratio = emp.totalHours > 0 ? (emp.billableHours / emp.totalHours) * 100 : 0;
      return {
        ...emp,
        totalHours: Number(emp.totalHours.toFixed(1)),
        billableHours: Number(emp.billableHours.toFixed(1)),
        nonBillableHours: Number(emp.nonBillableHours.toFixed(1)),
        productivityRate: Number(ratio.toFixed(1))
      };
    });

    // Sort by productivity descending
    productivityList.sort((a, b) => b.productivityRate - a.productivityRate);

    return { productivity: productivityList };
  });

  // Categories
  fastify.get('/categories', async (req: FastifyRequest<{ Querystring: { month?: string } }>) => {
    const { month } = req.query;
    const data = store.getData();
    const billableSet = new Set(data.config.billableCategories);

    let ts = data.timesheets;
    if (month && month !== 'all') {
      ts = ts.filter((t) => t.month === month);
    }

    const catHours = new Map<string, number>();
    let totalHours = 0;

    for (const row of ts) {
      totalHours += row.hours;
      catHours.set(row.category, (catHours.get(row.category) || 0) + row.hours);
    }

    const categories = Array.from(catHours.entries()).map(([cat, hours]) => {
      const isBillable = billableSet.has(cat);
      const share = totalHours > 0 ? (hours / totalHours) * 100 : 0;
      return {
        category: cat,
        isBillable,
        hours: Number(hours.toFixed(1)),
        sharePercent: Number(share.toFixed(1))
      };
    });

    categories.sort((a, b) => b.hours - a.hours);

    return {
      totalHours: Number(totalHours.toFixed(1)),
      categories
    };
  });

  // Department Drill-down
  fastify.get('/departments', async (req: FastifyRequest<{ Querystring: { month?: string } }>) => {
    const { month } = req.query;
    const data = store.getData();
    const monthlyContexts = computeMonthlyContexts(data.timesheets, data.salaries, data.config);
    const billableSet = new Set(data.config.billableCategories);

    let ts = data.timesheets;
    if (month && month !== 'all') {
      ts = ts.filter((t) => t.month === month);
    }

    const deptMap = new Map<
      string,
      {
        department: string;
        totalHours: number;
        billableHours: number;
        cost: number;
        employees: Map<
          string,
          {
            employeeNo: string;
            employeeName: string;
            designation: string;
            hours: number;
            billableHours: number;
            cost: number;
          }
        >;
      }
    >();

    for (const row of ts) {
      if (!deptMap.has(row.department)) {
        deptMap.set(row.department, {
          department: row.department,
          totalHours: 0,
          billableHours: 0,
          cost: 0,
          employees: new Map()
        });
      }

      const d = deptMap.get(row.department)!;
      d.totalHours += row.hours;

      const isBillable = billableSet.has(row.category);
      if (isBillable) {
        d.billableHours += row.hours;
      }

      // Cost calculation
      const ctx = monthlyContexts.get(row.month);
      const dr = ctx?.directRates.get(row.employeeName) || 0;
      const ir = isBillable ? (ctx?.indirectRatePerHour || 0) : 0;
      const rowCost = row.hours * (dr + ir);
      d.cost += rowCost;

      const empEntry = d.employees.get(row.employeeName) || {
        employeeNo: row.employeeNo,
        employeeName: row.employeeName,
        designation: row.designation,
        hours: 0,
        billableHours: 0,
        cost: 0
      };
      empEntry.hours += row.hours;
      if (isBillable) empEntry.billableHours += row.hours;
      empEntry.cost += rowCost;
      d.employees.set(row.employeeName, empEntry);
    }

    const departments = Array.from(deptMap.values()).map((d) => {
      const emps = Array.from(d.employees.values()).map((e) => ({
        ...e,
        hours: Number(e.hours.toFixed(1)),
        billableHours: Number(e.billableHours.toFixed(1)),
        cost: Number(e.cost.toFixed(2))
      })).sort((a, b) => b.hours - a.hours);

      return {
        department: d.department,
        totalHours: Number(d.totalHours.toFixed(1)),
        billableHours: Number(d.billableHours.toFixed(1)),
        cost: Number(d.cost.toFixed(2)),
        employeeCount: emps.length,
        employees: emps
      };
    });

    departments.sort((a, b) => b.totalHours - a.totalHours);

    return { departments };
  });

  // Audit view: monthly breakdown of rates and reconciliation
  fastify.get('/audit', async () => {
    const data = store.getData();
    const monthlyContexts = computeMonthlyContexts(data.timesheets, data.salaries, data.config);
    const months = Array.from(monthlyContexts.keys()).sort();

    const auditMonths = months.map((m) => {
      const ctx = monthlyContexts.get(m)!;
      const directRatesObj: Record<string, number> = {};
      ctx.directRates.forEach((val, key) => {
        directRatesObj[key] = Number(val.toFixed(2));
      });

      return {
        month: m,
        totalSalaries: ctx.totalSalaries,
        supportStaffSalaries: ctx.supportStaffSalaries,
        nonbillableDirectCost: Number(ctx.nonbillableDirectCost.toFixed(2)),
        monthlyOverhead: ctx.monthlyOverhead,
        indirectCostPool: Number(ctx.indirectCostPool.toFixed(2)),
        monthBillableHours: Number(ctx.monthBillableHours.toFixed(1)),
        indirectRatePerHour: Number(ctx.indirectRatePerHour.toFixed(2)),
        directRates: directRatesObj
      };
    });

    const fullYear = calculateDashboardMetrics(data.timesheets, data.projectPrices, data.salaries, data.config);

    return {
      auditMonths,
      fullYearReconciliation: fullYear.metrics.reconciliationAudit
    };
  });

  // Employee x Category Pivot Matrix (Stretch feature)
  fastify.get('/matrix', async (req: FastifyRequest<{ Querystring: { month?: string } }>) => {
    const { month } = req.query;
    const data = store.getData();

    let ts = data.timesheets;
    if (month && month !== 'all') {
      ts = ts.filter((t) => t.month === month);
    }

    const categories = Array.from(new Set(ts.map((t) => t.category))).sort();
    const employeeMap = new Map<string, { employeeNo: string; employeeName: string; department: string; hoursByCat: Record<string, number>; total: number }>();

    for (const row of ts) {
      const curr = employeeMap.get(row.employeeName) || {
        employeeNo: row.employeeNo,
        employeeName: row.employeeName,
        department: row.department,
        hoursByCat: {},
        total: 0
      };
      curr.hoursByCat[row.category] = (curr.hoursByCat[row.category] || 0) + row.hours;
      curr.total += row.hours;
      employeeMap.set(row.employeeName, curr);
    }

    const employees = Array.from(employeeMap.values()).map((e) => {
      const roundedCats: Record<string, number> = {};
      for (const cat of categories) {
        roundedCats[cat] = Number((e.hoursByCat[cat] || 0).toFixed(1));
      }
      return {
        ...e,
        hoursByCat: roundedCats,
        total: Number(e.total.toFixed(1))
      };
    });

    employees.sort((a, b) => b.total - a.total);

    // Compute column totals
    const columnTotals: Record<string, number> = {};
    let grandTotal = 0;
    for (const cat of categories) {
      const sum = employees.reduce((acc, e) => acc + (e.hoursByCat[cat] || 0), 0);
      columnTotals[cat] = Number(sum.toFixed(1));
      grandTotal += sum;
    }

    return {
      categories,
      employees,
      columnTotals,
      grandTotal: Number(grandTotal.toFixed(1))
    };
  });
}
