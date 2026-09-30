import React from "react";
import {
  Smartphone,
  Apple,
  Globe,
  AlertTriangle,
  Wrench,
  Sliders,
  Edit3,
} from "lucide-react";
import type { AppVersion, AppPlatform } from "../../../services/versionApi";

interface VersionDashboardCardProps {
  version?: AppVersion;
  platform: AppPlatform;
  onEdit: () => void;
  onToggleForceUpdate: (enabled: boolean) => void;
  onToggleMaintenance: (enabled: boolean) => void;
  onRolloutChange: (percentage: number) => void;
}

export const VersionDashboardCard: React.FC<VersionDashboardCardProps> = ({
  version,
  platform,
  onEdit,
  onToggleForceUpdate,
  onToggleMaintenance,
  onRolloutChange,
}) => {
  const isAndroid = platform === "ANDROID";
  const isIos = platform === "IOS";

  const PlatformIcon = isAndroid ? Smartphone : isIos ? Apple : Globe;
  const platformName = isAndroid ? "Android App" : isIos ? "iOS App" : "Web Platform";
  const badgeColor = isAndroid
    ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400"
    : isIos
    ? "text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400"
    : "text-purple-600 bg-purple-500/10 border-purple-500/20 dark:text-purple-400";

  if (!version) {
    return (
      <div className="bg-white dark:bg-[#1E2235] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-4 transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`p-3.5 rounded-2xl border ${badgeColor}`}>
              <PlatformIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-black">
                {platformName}
              </h3>
              <span className="text-xs font-semibold text-slate-400">No active release</span>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
          >
            Create Release
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1E2235] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs space-y-6 transition-all hover:shadow-md">
      {/* Top Header Row: Platform Info + Edit Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-light pb-5">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl border ${badgeColor}`}>
            <PlatformIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-black">
                {platformName}
              </h3>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {version.status}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
              Latest: <strong className="text-black">{version.currentVersion}</strong> | Min: <strong className="text-black">{version.minimumSupported}</strong> | Recom: <strong className="text-black">{version.recommendedVersion}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onEdit}
          title="Edit Release & Translations"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer shrink-0"
        >
          <Edit3 className="w-4 h-4 text-primary" />
          <span>Edit Release & Translations</span>
        </button>
      </div>

      {/* Main Row Content: Grid of Stats + Toggles + Slider */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Stat Pills (Cols 1-5) */}
        <div className="lg:col-span-5 grid grid-cols-3 gap-2.5">
          <div className="p-3 sm:p-3.5 bg-surface rounded-2xl border border-gray-light text-center overflow-hidden">
            <span className="text-[9.5px] sm:text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-tight block truncate">
              LATEST
            </span>
            <p className="text-sm sm:text-base font-black font-mono text-black mt-1">
              v{version.currentVersion}
            </p>
          </div>

          <div className="p-3 sm:p-3.5 bg-surface rounded-2xl border border-gray-light text-center overflow-hidden">
            <span className="text-[9.5px] sm:text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-tight block truncate">
              MINIMUM
            </span>
            <p className="text-sm sm:text-base font-black font-mono text-rose-500 dark:text-rose-400 mt-1">
              v{version.minimumSupported}
            </p>
          </div>

          <div className="p-3 sm:p-3.5 bg-surface rounded-2xl border border-gray-light text-center overflow-hidden">
            <span className="text-[9.5px] sm:text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-tight block truncate" title="RECOMMENDED">
              RECOMMENDED
            </span>
            <p className="text-sm sm:text-base font-black font-mono text-purple-600 dark:text-purple-400 mt-1">
              v{version.recommendedVersion}
            </p>
          </div>
        </div>

        {/* Horizontal Toggles (Cols 6-8) */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-2.5">
          {/* Force Update Box */}
          <div className="p-3 bg-surface rounded-2xl border border-gray-light flex flex-col justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${version.forceUpdate ? "text-rose-500" : "text-slate-400"}`} />
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 truncate">
                Force Update
              </span>
            </div>
            <button
              onClick={() => onToggleForceUpdate(!version.forceUpdate)}
              className={`w-full py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border text-center ${
                version.forceUpdate
                  ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                  : "bg-surface-light text-gray-6 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {version.forceUpdate ? "ENABLED" : "DISABLED"}
            </button>
          </div>

          {/* Maintenance Box */}
          <div className="p-3 bg-surface rounded-2xl border border-gray-light flex flex-col justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Wrench className={`w-3.5 h-3.5 shrink-0 ${version.maintenanceMode ? "text-amber-500" : "text-slate-400"}`} />
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 truncate">
                Maintenance
              </span>
            </div>
            <button
              onClick={() => onToggleMaintenance(!version.maintenanceMode)}
              className={`w-full py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border text-center ${
                version.maintenanceMode
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                  : "bg-surface-light text-gray-6 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {version.maintenanceMode ? "ACTIVE" : "OFF"}
            </button>
          </div>
        </div>

        {/* Staged Rollout Slider (Cols 9-12) */}
        <div className="lg:col-span-4 p-3.5 bg-surface rounded-2xl border border-gray-light space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
              <Sliders className="w-3.5 h-3.5 text-primary" />
              Staged Rollout
            </span>
            <span className="font-mono text-primary font-black text-sm">
              {version.rolloutPercentage}%
            </span>
          </div>

          <div className="py-0.5">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={version.rolloutPercentage}
              onChange={(e) => onRolloutChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-400 font-semibold px-0.5">
            <span>0% (Internal)</span>
            <span>50%</span>
            <span>100% (Full Release)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
