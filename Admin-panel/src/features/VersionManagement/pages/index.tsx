import React, { useState, useEffect, useCallback } from "react";
import {
  Smartphone,
  Plus,
  Activity,
  ShieldAlert,
  History,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { VersionDashboardCard } from "../components/VersionDashboardCard";
import { VersionFormModal } from "../components/VersionFormModal";
import { VersionHistoryTable } from "../components/VersionHistoryTable";
import { VersionAuditLogTable } from "../components/VersionAuditLogTable";
import { versionApi } from "../../../services/versionApi";
import type {
  AppVersion,
  AppPlatform,
  AppVersionHistory,
  AppVersionAuditLog,
  DashboardMetrics,
} from "../../../services/versionApi";
import toast from "react-hot-toast";

export const VersionManagementPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [history, setHistory] = useState<AppVersionHistory[]>([]);
  const [auditLogs, setAuditLogs] = useState<AppVersionAuditLog[]>([]);

  // Modal State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<AppVersion | null>(null);
  const [targetPlatform, setTargetPlatform] = useState<AppPlatform>("ANDROID");

  // Tab State
  const [activeTab, setActiveTab] = useState<"cards" | "history" | "audit">("cards");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [versionsRes, historyRes, auditRes, metricsRes] = await Promise.all([
        versionApi.getVersions(),
        versionApi.getHistory(),
        versionApi.getAuditLogs(),
        versionApi.getMetrics(),
      ]);

      setVersions(versionsRes.data || []);
      setHistory(historyRes.data || []);
      setAuditLogs(auditRes.data || []);
      setMetrics(metricsRes.data || null);
    } catch (err: any) {
      toast.error("Failed to load version management data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getPlatformRelease = (platform: AppPlatform) => {
    return versions.find((v) => v.platform === platform && v.status === "PUBLISHED") ||
      versions.find((v) => v.platform === platform);
  };

  const handleToggleForceUpdate = async (version: AppVersion, enabled: boolean) => {
    try {
      toast.loading("Updating force update status...", { id: "toggle-v" });
      await versionApi.toggleForceUpdate(version.id, enabled);
      toast.success(`Force update ${enabled ? "ENABLED" : "DISABLED"}`, { id: "toggle-v" });
      fetchData();
    } catch (err: any) {
      toast.error("Failed to update force update setting", { id: "toggle-v" });
    }
  };

  const handleToggleMaintenance = async (version: AppVersion, enabled: boolean) => {
    try {
      toast.loading("Updating maintenance status...", { id: "toggle-v" });
      await versionApi.toggleMaintenance(version.id, enabled);
      toast.success(`Maintenance mode ${enabled ? "ACTIVATED" : "DEACTIVATED"}`, { id: "toggle-v" });
      fetchData();
    } catch (err: any) {
      toast.error("Failed to update maintenance setting", { id: "toggle-v" });
    }
  };

  const handleRolloutChange = async (version: AppVersion, percentage: number) => {
    try {
      toast.loading(`Setting rollout to ${percentage}%...`, { id: "toggle-v" });
      await versionApi.configureRollout(version.id, percentage);
      toast.success(`Rollout percentage set to ${percentage}%`, { id: "toggle-v" });
      fetchData();
    } catch (err: any) {
      toast.error("Failed to configure rollout percentage", { id: "toggle-v" });
    }
  };

  const handleOpenCreate = (platform: AppPlatform) => {
    setSelectedVersion(null);
    setTargetPlatform(platform);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (ver: AppVersion) => {
    setSelectedVersion(ver);
    setTargetPlatform(ver.platform);
    setFormModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-surface-light p-6 rounded-2xl border border-gray-light shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-black tracking-tight">
              App Version
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Control Android, iOS, and Web app releases, force updates, staged rollouts, and maintenance mode.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            title="Refresh Data"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-gray-6 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenCreate("ANDROID")}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Release</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-light p-5 rounded-2xl border border-gray-light shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              Today's Version Checks
            </span>
            <p className="text-2xl font-black text-black mt-1">
              {metrics?.todayChecksCount ?? 0}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface-light p-5 rounded-2xl border border-gray-light shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              Blocked Devices / Force Updates
            </span>
            <p className="text-2xl font-black text-rose-500 mt-1">
              {metrics?.blockedDevicesCount ?? 0}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface-light p-5 rounded-2xl border border-gray-light shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              Android Version
            </span>
            <p className="text-2xl font-black font-mono text-emerald-500 mt-1">
              v{getPlatformRelease("ANDROID")?.currentVersion || "N/A"}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface-light p-5 rounded-2xl border border-gray-light shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              iOS Version
            </span>
            <p className="text-2xl font-black font-mono text-blue-500 mt-1">
              v{getPlatformRelease("IOS")?.currentVersion || "N/A"}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
        <button
          onClick={() => setActiveTab("cards")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "cards"
              ? "bg-primary text-white shadow-xs"
              : "bg-surface-light text-gray-6 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-primary text-white shadow-xs"
              : "bg-surface-light text-gray-6 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Release History</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "audit"
              ? "bg-primary text-white shadow-xs"
              : "bg-surface-light text-gray-6 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Admin Audit Logs</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "cards" && (
        <div className="flex flex-col gap-6">
          <VersionDashboardCard
            platform="ANDROID"
            version={getPlatformRelease("ANDROID")}
            onEdit={() => handleOpenEdit(getPlatformRelease("ANDROID") || ({} as any))}
            onToggleForceUpdate={(enabled) =>
              getPlatformRelease("ANDROID") && handleToggleForceUpdate(getPlatformRelease("ANDROID")!, enabled)
            }
            onToggleMaintenance={(enabled) =>
              getPlatformRelease("ANDROID") && handleToggleMaintenance(getPlatformRelease("ANDROID")!, enabled)
            }
            onRolloutChange={(percentage) =>
              getPlatformRelease("ANDROID") && handleRolloutChange(getPlatformRelease("ANDROID")!, percentage)
            }
          />

          <VersionDashboardCard
            platform="IOS"
            version={getPlatformRelease("IOS")}
            onEdit={() => handleOpenEdit(getPlatformRelease("IOS") || ({} as any))}
            onToggleForceUpdate={(enabled) =>
              getPlatformRelease("IOS") && handleToggleForceUpdate(getPlatformRelease("IOS")!, enabled)
            }
            onToggleMaintenance={(enabled) =>
              getPlatformRelease("IOS") && handleToggleMaintenance(getPlatformRelease("IOS")!, enabled)
            }
            onRolloutChange={(percentage) =>
              getPlatformRelease("IOS") && handleRolloutChange(getPlatformRelease("IOS")!, percentage)
            }
          />

          <VersionDashboardCard
            platform="WEB"
            version={getPlatformRelease("WEB")}
            onEdit={() => handleOpenEdit(getPlatformRelease("WEB") || ({} as any))}
            onToggleForceUpdate={(enabled) =>
              getPlatformRelease("WEB") && handleToggleForceUpdate(getPlatformRelease("WEB")!, enabled)
            }
            onToggleMaintenance={(enabled) =>
              getPlatformRelease("WEB") && handleToggleMaintenance(getPlatformRelease("WEB")!, enabled)
            }
            onRolloutChange={(percentage) =>
              getPlatformRelease("WEB") && handleRolloutChange(getPlatformRelease("WEB")!, percentage)
            }
          />
        </div>
      )}

      {activeTab === "history" && <VersionHistoryTable history={history} isLoading={isLoading} />}

      {activeTab === "audit" && <VersionAuditLogTable logs={auditLogs} isLoading={isLoading} />}

      {/* Form Modal */}
      {formModalOpen && (
        <VersionFormModal
          open={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          version={selectedVersion}
          defaultPlatform={targetPlatform}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};
