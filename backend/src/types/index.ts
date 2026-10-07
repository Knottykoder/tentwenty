export interface TimesheetEntry {
  id?: string;
  month: string; // Normalized: YYYY-MM
  rawMonth: string;
  employeeNo: string;
  employeeName: string;
  expenseType: string; // DL / IDL
  department: string;
  designation: string;
  category: string;
  refCode: string;
  taskOrProjectName: string;
  companyName: string;
  description: string;
  hours: number;
}

export interface SalaryEntry {
  employeeNo: string;
  employeeName: string;
  month: string; // Normalized: YYYY-MM
  salary: number;
}

export interface ProjectPriceEntry {
  refCode: string;
  projectName: string;
  price: number;
  salesMonth: string; // e.g. "January '25" or normalized "2025-01"
  category: string;
  status: string; // 'in progress' | 'completed'
}

export interface AppConfig {
  billableCategories: string[];
  monthlyOverhead: number;
}

export interface EmployeeContribution {
  employeeNo: string;
  employeeName: string;
  department: string;
  hours: number;
  cost: number;
  revenueShare: number;
  profit: number;
  profitabilityMargin: number; // percentage (0-100 or decimal)
}

export interface ProjectMetric {
  refCode: string;
  projectName: string;
  category: string;
  status: string;
  salesMonth: string;
  price: number;
  totalHours: number;
  totalCost: number;
  profit: number;
  margin: number; // %
  departmentHours: Record<string, number>;
  employeeContributions: EmployeeContribution[];
}

export interface MonthlyReconciliation {
  month: string;
  totalSalaries: number;
  supportStaffSalaries: number;
  nonbillableCost: number;
  monthlyOverhead: number;
  indirectCostPool: number;
  billableHours: number;
  indirectRatePerHour: number;
  billableProjectCost: number;
  differenceWithSalaries: number; // When overhead=0, this should be 0.00
}

export interface DashboardMetrics {
  totalHours: number;
  billableHours: number;
  billableHoursPercent: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  grossMarginPercent: number;
  projectCount: number;
  employeeCount: number;
  reconciliationAudit: {
    totalSalaries: number;
    totalProjectCost: number;
    overheadIncluded: number;
    isReconciled: boolean;
    difference: number;
  };
}
