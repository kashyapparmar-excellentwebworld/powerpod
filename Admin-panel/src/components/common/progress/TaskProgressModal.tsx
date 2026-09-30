import React from "react";
import { Modal } from "../modal/Modal";
import { Loader2, CheckCircle2, AlertTriangle, Info, Terminal } from "lucide-react";
import { useTaskProgress } from "../../../hooks/useTaskProgress";

interface TaskProgressModalProps {
  open: boolean;
  onClose: () => void;
  taskId?: string;
  taskTitle?: string;
}

/**
 * Real-Time Operational Progress & Console Log Feed Modal
 * Displays live progress bar, active status, and terminal-style log output via WebSockets.
 */
export const TaskProgressModal: React.FC<TaskProgressModalProps> = ({
  open,
  onClose,
  taskId,
  taskTitle = "Operation Progress",
}) => {
  const progressState = useTaskProgress(taskId);

  const percentage = progressState?.percentage || 0;
  const isCompleted = progressState?.isCompleted || percentage >= 100;
  const logs = progressState?.logs || [];
  const activeMessage = progressState?.message || "Processing request...";

  return (
    <Modal open={open} setOpen={onClose} title={taskTitle} maxWidth="md">
      <div className="p-6 space-y-5 text-slate-900 dark:text-slate-100">
        {/* Progress Bar Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              {!isCompleted ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
              {activeMessage}
            </span>
            <span className="font-mono text-sm font-black text-purple-600 dark:text-purple-400">
              {percentage}%
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/60 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : "bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400"
              }`}
              style={{ width: `${Math.max(5, Math.min(100, percentage))}%` }}
            />
          </div>
        </div>

        {/* Live Terminal Log Feed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
            <span className="flex items-center gap-1.5 font-mono">
              <Terminal className="w-3.5 h-3.5 text-purple-500" /> Real-Time Console Log Feed
            </span>
            <span className="text-[10px] uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
              WebSocket Stream
            </span>
          </div>

          <div className="h-48 bg-slate-950 text-slate-200 font-mono text-[11px] p-3.5 rounded-xl border border-slate-800 overflow-y-auto space-y-1.5 shadow-inner">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 italic">
                Awaiting progress logs from server...
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>

                  {log.level === "info" && (
                    <span className="text-sky-400 font-bold shrink-0 flex items-center gap-1">
                      <Info className="w-3 h-3" /> INFO:
                    </span>
                  )}
                  {log.level === "warn" && (
                    <span className="text-amber-400 font-bold shrink-0 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> WARN:
                    </span>
                  )}
                  {log.level === "error" && (
                    <span className="text-rose-400 font-bold shrink-0">ERROR:</span>
                  )}
                  {log.level === "success" && (
                    <span className="text-emerald-400 font-bold shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> SUCCESS:
                    </span>
                  )}

                  <span className="text-slate-300 break-words">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Close Action */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            {isCompleted ? "Done" : "Run in Background"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
