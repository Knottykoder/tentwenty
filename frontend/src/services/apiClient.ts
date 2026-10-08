import {
  DashboardMetrics,
  MonthlyTrend,
  ProjectMetric,
  DepartmentItem,
  CategoryItem,
  ProductivityItem
} from '../types/dashboard';

export interface DashboardResponse {
  hasData: boolean;
  metrics: DashboardMetrics;
  availableYears: string[];
  availableMonths: string[];
  monthlyTrends: MonthlyTrend[];
}

export interface ProjectsResponse {
  projects: ProjectMetric[];
}

export interface ProjectDetailResponse {
  project: ProjectMetric;
  timeline: Array<{
    month: string;
    hours: number;
    cost: number;
  }>;
}

export interface DepartmentsResponse {
  departments: DepartmentItem[];
}

export interface CategoriesResponse {
  categories: CategoryItem[];
  totalHours: number;
}

export interface ProductivityResponse {
  productivity: ProductivityItem[];
}

export interface MatrixResponse {
  categories: string[];
  employees: Array<{
    employeeNo: string;
    employeeName: string;
    department: string;
    hoursByCat: Record<string, number>;
    total: number;
  }>;
  columnTotals: Record<string, number>;
  grandTotal: number;
}

function buildQuery(year?: string, month?: string): string {
  const params = new URLSearchParams();
  if (year && year !== 'all') params.set('year', year);
  if (month && month !== 'all') params.set('month', month);
  const q = params.toString();
  return q ? `?${q}` : '';
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Network response was not ok');
    throw new Error(`API Error [${res.status}]: ${errorText}`);
  }
  return res.json();
}

export const apiClient = {
  getDashboard: (year?: string, month?: string) =>
    fetchJson<DashboardResponse>(`/api/dashboard${buildQuery(year, month)}`),

  getProjects: (year?: string, month?: string) =>
    fetchJson<ProjectsResponse>(`/api/projects${buildQuery(year, month)}`),

  getProjectDetail: (refCode: string) =>
    fetchJson<ProjectDetailResponse>(`/api/projects/${encodeURIComponent(refCode)}`),

  getDepartments: (year?: string, month?: string) =>
    fetchJson<DepartmentsResponse>(`/api/departments${buildQuery(year, month)}`),

  getCategories: (year?: string, month?: string) =>
    fetchJson<CategoriesResponse>(`/api/categories${buildQuery(year, month)}`),

  getProductivity: (year?: string, month?: string) =>
    fetchJson<ProductivityResponse>(`/api/productivity${buildQuery(year, month)}`),

  getMatrix: (year?: string, month?: string) =>
    fetchJson<MatrixResponse>(`/api/matrix${buildQuery(year, month)}`),

  loadSampleData: () =>
    fetchJson<{ success: boolean; message: string }>('/api/sample-data', { method: 'POST' }),

  resetData: () =>
    fetchJson<{ success: boolean; message: string }>('/api/reset', { method: 'POST' })
};
