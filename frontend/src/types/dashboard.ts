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

export interface MonthlyTrend {
  month: string;
  totalHours: number;
  billableHours: number;
  cost: number;
  revenue: number;
  profit: number;
  margin: number;
}

export interface EmployeeContribution {
  employeeNo: string;
  employeeName: string;
  department: string;
  hours: number;
  cost: number;
  revenueShare: number;
  profit: number;
  profitabilityMargin: number;
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
  margin: number;
  departmentHours: Record<string, number>;
  employeeContributions: EmployeeContribution[];
}

export interface ProductivityItem {
  employeeNo: string;
  employeeName: string;
  department: string;
  designation: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  productivityRate: number;
}

export interface CategoryItem {
  category: string;
  isBillable: boolean;
  hours: number;
  sharePercent: number;
}

export interface DepartmentEmployee {
  employeeNo: string;
  employeeName: string;
  designation: string;
  hours: number;
  billableHours: number;
  cost: number;
}

export interface DepartmentItem {
  department: string;
  totalHours: number;
  billableHours: number;
  cost: number;
  employeeCount: number;
  employees: DepartmentEmployee[];
}

export interface AppConfig {
  billableCategories: string[];
  monthlyOverhead: number;
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
  differenceWithSalaries: number;
}
