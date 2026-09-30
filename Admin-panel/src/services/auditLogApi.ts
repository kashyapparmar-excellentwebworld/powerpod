import api from "./axiosInstance";

export interface AuditLogItem {
  id: string;
  adminId: string | null;
  adminEmail: string | null;
  adminName: string | null;
  action: string;
  module: string;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  details: any;
  createdAt: string;
}

export interface AuditLogAdminItem {
  id: string;
  name: string;
  email: string;
}

export const auditLogApi = {
  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    adminId?: string;
    module?: string;
    action?: string;
    search?: string;
  }) => {
    const res = await api.get("/audit-logs", { params });
    return res.data;
  },

  getAuditLogAdmins: async () => {
    const res = await api.get("/audit-logs/admins");
    return res.data;
  },
};
