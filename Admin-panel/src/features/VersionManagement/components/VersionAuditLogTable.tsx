import React from "react";
import { ShieldCheck, User } from "lucide-react";
import type { AppVersionAuditLog } from "../../../services/versionApi";

interface VersionAuditLogTableProps {
  logs: AppVersionAuditLog[];
  isLoading?: boolean;
}

export const VersionAuditLogTable: React.FC<VersionAuditLogTableProps> = ({
  logs,
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

  if (logs.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60">
        <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          No audit logs recorded
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="p-4 bg-surface-light border border-gray-light rounded-xl flex items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-primary/10 text-primary">
                  {log.action}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                  [{log.platform}]
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                Admin: {log.performedBy || "System Admin"}
              </p>
            </div>
          </div>

          <div className="text-end text-xs font-medium text-slate-400 shrink-0">
            {new Date(log.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};
