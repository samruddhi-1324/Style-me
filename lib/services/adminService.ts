import { apiRequest } from '@/lib/api/apiClient';

export interface AdminDashboardMetrics {
  systemStatus: string;
  generatedAt: string;
  totalUsers: number;
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  totalCoupons: number;
  totalReturns: number;
  totalReviews: number;
  publishedCmsPages: number;
  pendingReviews: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  active: boolean;
  emailVerified: boolean;
  createdAt?: string;
}

export interface AdminAuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  result: string;
  details: string;
  createdAt: string;
}

export interface AdminAuditLogPage {
  content: AdminAuditLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const adminService = {
  getDashboard(): Promise<AdminDashboardMetrics> {
    return apiRequest<AdminDashboardMetrics>('/api/v1/admin/dashboard');
  },

  getUsers(): Promise<AdminUser[]> {
    return apiRequest<AdminUser[]>('/api/v1/admin/users');
  },

  getAuditLogs(page = 0, size = 10): Promise<AdminAuditLogPage> {
    return apiRequest<AdminAuditLogPage>(`/api/v1/admin/audit-logs?page=${page}&size=${size}`);
  },
};
