import {
  TimesheetEntry,
  SalaryEntry,
  ProjectPriceEntry,
  AppConfig,
  DashboardMetrics,
  ProjectMetric,
  EmployeeContribution,
  MonthlyReconciliation
} from '../types/index.js';

export const DEFAULT_CONFIG: AppConfig = {
  billableCategories: ['Projects', 'Enhancements', 'Hosting'],
  monthlyOverhead: 0
};

export interface MonthCalculationContext {
  month: string;
  totalSalaries: number;
  supportStaffSalaries: number;
  nonbillableDirectCost: number;
  monthlyOverhead: number;
  indirectCostPool: number;
  monthBillableHours: number;
  indirectRatePerHour: number;
  directRates: Map<string, number>; // employeeName -> direct rate
  employeeLoggedHours: Map<string, number>;
  employeeBillableHours: Map<string, number>;
  employeeNonBillableHours: Map<string, number>;
}

export function computeMonthlyContexts(
  timesheets: TimesheetEntry[],
  salaries: SalaryEntry[],
  config: AppConfig
): Map<string, MonthCalculationContext> {
  const billableSet = new Set(config.billableCategories);

  // Group salaries by month and employeeName
  // key: `${month}::${employeeName}`
  const salaryByMonthEmp = new Map<string, number>();
  const allMonths = new Set<string>();
  const employeesByMonth = new Map<string, Set<string>>();

  for (const sal of salaries) {
    salaryByMonthEmp.set(`${sal.month}::${sal.employeeName}`, sal.salary);
    allMonths.add(sal.month);
    if (!employeesByMonth.has(sal.month)) {
      employeesByMonth.set(sal.month, new Set());
    }
    employeesByMonth.get(sal.month)!.add(sal.employeeName);
  }

  // Also include any months present in timesheets
  for (const ts of timesheets) {
    allMonths.add(ts.month);
    if (!employeesByMonth.has(ts.month)) {
      employeesByMonth.set(ts.month, new Set());
    }
    employeesByMonth.get(ts.month)!.add(ts.employeeName);
  }

  const contexts = new Map<string, MonthCalculationContext>();

  for (const month of Array.from(allMonths).sort()) {
    const monthTs = timesheets.filter((t) => t.month === month);
    const monthEmps = employeesByMonth.get(month) || new Set();

    const empLoggedHours = new Map<string, number>();
    const empBillableHours = new Map<string, number>();
    const empNonBillableHours = new Map<string, number>();

    let totalMonthBillableHours = 0;

    for (const row of monthTs) {
      const isBillable = billableSet.has(row.category);
      const currTotal = empLoggedHours.get(row.employeeName) || 0;
      empLoggedHours.set(row.employeeName, currTotal + row.hours);

      if (isBillable) {
        const currBill = empBillableHours.get(row.employeeName) || 0;
        empBillableHours.set(row.employeeName, currBill + row.hours);
        totalMonthBillableHours += row.hours;
      } else {
        const currNon = empNonBillableHours.get(row.employeeName) || 0;
        empNonBillableHours.set(row.employeeName, currNon + row.hours);
      }
    }

    const directRates = new Map<string, number>();
    let totalSalaries = 0;
    let supportStaffSalaries = 0;
    let nonbillableDirectCost = 0;

    for (const emp of monthEmps) {
      const salary = salaryByMonthEmp.get(`${month}::${emp}`) || 0;
      totalSalaries += salary;
      const logged = empLoggedHours.get(emp) || 0;

      if (logged === 0) {
        // Employee logged no hours -> Support staff
        supportStaffSalaries += salary;
        directRates.set(emp, 0);
      } else {
        const dr = salary / logged;
        directRates.set(emp, dr);
        const nonBillHours = empNonBillableHours.get(emp) || 0;
        nonbillableDirectCost += nonBillHours * dr;
      }
    }

    const indirectCostPool =
      supportStaffSalaries + nonbillableDirectCost + (config.monthlyOverhead || 0);

    const indirectRatePerHour =
      totalMonthBillableHours > 0 ? indirectCostPool / totalMonthBillableHours : 0;

    contexts.set(month, {
      month,
      totalSalaries,
      supportStaffSalaries,
      nonbillableDirectCost,
      monthlyOverhead: config.monthlyOverhead || 0,
      indirectCostPool,
      monthBillableHours: totalMonthBillableHours,
      indirectRatePerHour,
      directRates,
      employeeLoggedHours: empLoggedHours,
      employeeBillableHours: empBillableHours,
      employeeNonBillableHours: empNonBillableHours
    });
  }

  return contexts;
}

export function calculateProjectMetrics(
  timesheets: TimesheetEntry[],
  projectPrices: ProjectPriceEntry[],
  monthlyContexts: Map<string, MonthCalculationContext>,
  config: AppConfig
): ProjectMetric[] {
  const billableSet = new Set(config.billableCategories);

  // Group billable timesheets by Ref Code
  const tsByProject = new Map<string, TimesheetEntry[]>();
  for (const ts of timesheets) {
    if (!billableSet.has(ts.category)) continue;
    if (!ts.refCode) continue;
    if (!tsByProject.has(ts.refCode)) {
      tsByProject.set(ts.refCode, []);
    }
    tsByProject.get(ts.refCode)!.push(ts);
  }

  const priceMap = new Map<string, ProjectPriceEntry>();
  for (const p of projectPrices) {
    priceMap.set(p.refCode, p);
  }

  // Also include any project ref codes that are in prices but have no timesheet entries yet
  const allRefCodes = new Set([...priceMap.keys(), ...tsByProject.keys()]);
  const results: ProjectMetric[] = [];

  for (const refCode of allRefCodes) {
    const priceEntry = priceMap.get(refCode);
    const rows = tsByProject.get(refCode) || [];

    const projectName = priceEntry?.projectName || (rows[0]?.taskOrProjectName ?? refCode);
    const category = priceEntry?.category || (rows[0]?.category ?? 'Projects');
    const status = priceEntry?.status || 'in progress';
    const salesMonth = priceEntry?.salesMonth || (rows[0]?.rawMonth ?? '');
    const price = priceEntry?.price || 0;

    let totalHours = 0;
    let totalCost = 0;
    const departmentHours: Record<string, number> = {};

    // Per-employee breakdown
    const empDataMap = new Map<
      string,
      { employeeNo: string; department: string; hours: number; cost: number }
    >();

    for (const row of rows) {
      totalHours += row.hours;
      departmentHours[row.department] = (departmentHours[row.department] || 0) + row.hours;

      const monthCtx = monthlyContexts.get(row.month);
      const directRate = monthCtx?.directRates.get(row.employeeName) || 0;
      const indirectRate = monthCtx?.indirectRatePerHour || 0;
      const rowCost = row.hours * (directRate + indirectRate);
      totalCost += rowCost;

      const existingEmp = empDataMap.get(row.employeeName) || {
        employeeNo: row.employeeNo,
        department: row.department,
        hours: 0,
        cost: 0
      };
      existingEmp.hours += row.hours;
      existingEmp.cost += rowCost;
      empDataMap.set(row.employeeName, existingEmp);
    }

    const employeeContributions: EmployeeContribution[] = [];

    for (const [empName, eData] of empDataMap.entries()) {
      // employee revenue share = project price * (employee hours / total project hours)
      const revenueShare = totalHours > 0 ? price * (eData.hours / totalHours) : 0;
      const profit = revenueShare - eData.cost;
      const profitabilityMargin = revenueShare > 0 ? (profit / revenueShare) * 100 : 0;

      employeeContributions.push({
        employeeNo: eData.employeeNo,
        employeeName: empName,
        department: eData.department,
        hours: Number(eData.hours.toFixed(2)),
        cost: Number(eData.cost.toFixed(2)),
        revenueShare: Number(revenueShare.toFixed(2)),
        profit: Number(profit.toFixed(2)),
        profitabilityMargin: Number(profitabilityMargin.toFixed(1))
      });
    }

    // Sort contributions by hours descending
    employeeContributions.sort((a, b) => b.hours - a.hours);

    const projectProfit = price - totalCost;
    const projectMargin = price > 0 ? (projectProfit / price) * 100 : 0;

    results.push({
      refCode,
      projectName,
      category,
      status,
      salesMonth,
      price: Number(price.toFixed(2)),
      totalHours: Number(totalHours.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      profit: Number(projectProfit.toFixed(2)),
      margin: Number(projectMargin.toFixed(1)),
      departmentHours,
      employeeContributions
    });
  }

  // Sort by price/cost descending
  results.sort((a, b) => b.price - a.price);
  return results;
}

export function calculateDashboardMetrics(
  timesheets: TimesheetEntry[],
  projectPrices: ProjectPriceEntry[],
  salaries: SalaryEntry[],
  config: AppConfig,
  filterMonth?: string // optional YYYY-MM
): {
  metrics: DashboardMetrics;
  monthlyReconciliations: MonthlyReconciliation[];
} {
  const monthlyContexts = computeMonthlyContexts(timesheets, salaries, config);
  const billableSet = new Set(config.billableCategories);

  // Compute reconciliations across all months
  const monthlyReconciliations: MonthlyReconciliation[] = [];
  let totalSalariesAcrossMonths = 0;
  let totalProjectCostAcrossMonths = 0;
  let totalOverheadAcrossMonths = 0;

  for (const [mKey, ctx] of monthlyContexts.entries()) {
    // Calculate billable project cost for this month
    const mTs = timesheets.filter((t) => t.month === mKey && billableSet.has(t.category));
    let mBillableCost = 0;
    for (const row of mTs) {
      const dr = ctx.directRates.get(row.employeeName) || 0;
      mBillableCost += row.hours * (dr + ctx.indirectRatePerHour);
    }

    const diff = ctx.totalSalaries + ctx.monthlyOverhead - mBillableCost;

    monthlyReconciliations.push({
      month: mKey,
      totalSalaries: ctx.totalSalaries,
      supportStaffSalaries: ctx.supportStaffSalaries,
      nonbillableCost: ctx.nonbillableDirectCost,
      monthlyOverhead: ctx.monthlyOverhead,
      indirectCostPool: ctx.indirectCostPool,
      billableHours: ctx.monthBillableHours,
      indirectRatePerHour: ctx.indirectRatePerHour,
      billableProjectCost: Number(mBillableCost.toFixed(2)),
      differenceWithSalaries: Number(diff.toFixed(2))
    });

    totalSalariesAcrossMonths += ctx.totalSalaries;
    totalProjectCostAcrossMonths += mBillableCost;
    totalOverheadAcrossMonths += ctx.monthlyOverhead;
  }

  // Filter timesheets if specific month is requested
  const filteredTs = filterMonth ? timesheets.filter((t) => t.month === filterMonth) : timesheets;

  let totalHours = 0;
  let billableHours = 0;
  for (const t of filteredTs) {
    totalHours += t.hours;
    if (billableSet.has(t.category)) {
      billableHours += t.hours;
    }
  }

  // Cost calculation for selected period
  let periodCost = 0;
  for (const t of filteredTs) {
    if (billableSet.has(t.category)) {
      const ctx = monthlyContexts.get(t.month);
      const dr = ctx?.directRates.get(t.employeeName) || 0;
      const ir = ctx?.indirectRatePerHour || 0;
      periodCost += t.hours * (dr + ir);
    }
  }

  // Revenue calculation
  // If full year: sum of all project prices.
  // If specific month: attribute revenue from project prices whose salesMonth aligns or prorated.
  let periodRevenue = 0;
  if (!filterMonth) {
    periodRevenue = projectPrices.reduce((acc, p) => acc + p.price, 0);
  } else {
    // If month filter is applied, sum project prices for that sales month
    // Fallback: prorate project price based on billable hours logged in that month
    const matchingPrices = projectPrices.filter((p) => {
      // compare normalized sales month or raw month
      return p.salesMonth.toLowerCase().includes(filterMonth.toLowerCase());
    });
    if (matchingPrices.length > 0) {
      periodRevenue = matchingPrices.reduce((acc, p) => acc + p.price, 0);
    } else {
      // Burn-rate attribution: (month billable hours / total project billable hours) * price
      for (const p of projectPrices) {
        const pAllRows = timesheets.filter((t) => t.refCode === p.refCode && billableSet.has(t.category));
        const pMonthRows = filteredTs.filter((t) => t.refCode === p.refCode && billableSet.has(t.category));
        const pTotalH = pAllRows.reduce((a, b) => a + b.hours, 0);
        const pMonthH = pMonthRows.reduce((a, b) => a + b.hours, 0);
        if (pTotalH > 0 && pMonthH > 0) {
          periodRevenue += p.price * (pMonthH / pTotalH);
        }
      }
    }
  }

  const totalProfit = periodRevenue - periodCost;
  const grossMarginPercent = periodRevenue > 0 ? (totalProfit / periodRevenue) * 100 : 0;
  const billableHoursPercent = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

  const uniqueEmps = new Set(filteredTs.map((t) => t.employeeName));
  const uniqueProjects = new Set(
    filteredTs.filter((t) => billableSet.has(t.category)).map((t) => t.refCode)
  );

  const diffOverall = Math.abs(totalSalariesAcrossMonths + totalOverheadAcrossMonths - totalProjectCostAcrossMonths);
  const isReconciled = diffOverall < 0.05;

  return {
    metrics: {
      totalHours: Number(totalHours.toFixed(1)),
      billableHours: Number(billableHours.toFixed(1)),
      billableHoursPercent: Number(billableHoursPercent.toFixed(1)),
      totalCost: Number(periodCost.toFixed(2)),
      totalRevenue: Number(periodRevenue.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      grossMarginPercent: Number(grossMarginPercent.toFixed(1)),
      projectCount: uniqueProjects.size,
      employeeCount: uniqueEmps.size,
      reconciliationAudit: {
        totalSalaries: Number(totalSalariesAcrossMonths.toFixed(2)),
        totalProjectCost: Number(totalProjectCostAcrossMonths.toFixed(2)),
        overheadIncluded: Number(totalOverheadAcrossMonths.toFixed(2)),
        isReconciled,
        difference: Number((totalSalariesAcrossMonths + totalOverheadAcrossMonths - totalProjectCostAcrossMonths).toFixed(2))
      }
    },
    monthlyReconciliations
  };
}
