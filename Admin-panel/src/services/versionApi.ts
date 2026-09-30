import axiosInstance from "./axiosInstance";

export type AppPlatform = "ANDROID" | "IOS" | "WEB";
export type AppVersionStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface AppVersionTranslation {
  id?: string;
  languageCode: string;
  title: string;
  description: string;
  updateButtonText?: string;
  skipButtonText?: string;
  maintenanceTitle?: string;
  maintenanceDescription?: string;
}

export interface AppVersionHistory {
  id: string;
  platform: AppPlatform;
  version: string;
  releaseNotes?: string;
  releasedAt: string;
  createdBy?: string;
}

export interface AppVersionAuditLog {
  id: string;
  appVersionId?: string;
  platform: AppPlatform;
  action: string;
  changes?: any;
  performedBy?: string;
  createdAt: string;
}

export interface AppVersion {
  id: string;
  platform: AppPlatform;
  currentVersion: string;
  minimumSupported: string;
  recommendedVersion: string;
  forceUpdate: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  rolloutPercentage: number;
  playStoreUrl?: string;
  appStoreUrl?: string;
  webUrl?: string;
  status: AppVersionStatus;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  appTranslations: AppVersionTranslation[];
  history?: AppVersionHistory[];
}

export interface DashboardMetrics {
  todayChecksCount: number;
  blockedDevicesCount: number;
  platforms: AppVersion[];
}

export const versionApi = {
  getVersions: async (params?: { platform?: AppPlatform; status?: AppVersionStatus; page?: number; limit?: number }) => {
    const res = await axiosInstance.get("/versions", { params });
    return res.data;
  },

  getVersionById: async (id: string) => {
    const res = await axiosInstance.get(`/versions/${id}`);
    return res.data;
  },

  createRelease: async (data: any) => {
    const res = await axiosInstance.post("/versions", data);
    return res.data;
  },

  updateRelease: async (id: string, data: any) => {
    const res = await axiosInstance.put(`/versions/${id}`, data);
    return res.data;
  },

  toggleForceUpdate: async (id: string, forceUpdate: boolean) => {
    const res = await axiosInstance.patch(`/versions/${id}/force-update`, { forceUpdate });
    return res.data;
  },

  toggleMaintenance: async (id: string, maintenanceMode: boolean, maintenanceMessage?: string) => {
    const res = await axiosInstance.patch(`/versions/${id}/maintenance`, { maintenanceMode, maintenanceMessage });
    return res.data;
  },

  configureRollout: async (id: string, rolloutPercentage: number) => {
    const res = await axiosInstance.patch(`/versions/${id}/rollout`, { rolloutPercentage });
    return res.data;
  },

  upsertTranslation: async (id: string, translationData: AppVersionTranslation) => {
    const res = await axiosInstance.post(`/versions/${id}/translations`, translationData);
    return res.data;
  },

  getHistory: async (platform?: AppPlatform) => {
    const res = await axiosInstance.get("/versions/history", { params: { platform } });
    return res.data;
  },

  getAuditLogs: async () => {
    const res = await axiosInstance.get("/versions/audit-logs");
    return res.data;
  },

  getMetrics: async () => {
    const res = await axiosInstance.get("/versions/metrics");
    return res.data;
  },
};
