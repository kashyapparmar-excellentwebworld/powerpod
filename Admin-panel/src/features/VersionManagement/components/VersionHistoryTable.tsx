import React from "react";
import { History, Smartphone, Apple, Globe } from "lucide-react";
import type { AppVersionHistory } from "../../../services/versionApi";

interface VersionHistoryTableProps {
  history: AppVersionHistory[];
  isLoading?: boolean;
}

export const VersionHistoryTable: React.FC<VersionHistoryTableProps> = ({
  history,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60">
        <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          No release history recorded
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          All published releases will appear here in chronological order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((item) => {
        const isAndroid = item.platform === "ANDROID";
        const isIos = item.platform === "IOS";
        const Icon = isAndroid ? Smartphone : isIos ? Apple : Globe;

        return (
          <div
            key={item.id}
            className="p-4 bg-surface-light border border-gray-light rounded-xl flex items-center justify-between gap-4 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {item.platform}
                  </span>
                  <span className="text-sm font-black font-mono text-black">
                    v{item.version}
                  </span>
                </div>
                {item.releaseNotes && (
                  <p className="text-xs text-gray-6 mt-0.5 line-clamp-1">
                    {item.releaseNotes}
                  </p>
                )}
              </div>
            </div>

            <div className="text-end text-xs font-medium text-slate-400 shrink-0">
              {new Date(item.releasedAt).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
};
