import React from "react";
import { AlertTriangle, Wrench, ArrowRight } from "lucide-react";
import type { VersionCheckResult } from "../../../hooks/useVersionCheck";

interface ForceUpdateModalProps {
  versionState: VersionCheckResult | null;
  onDismissOptional?: () => void;
}

export const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({
  versionState,
  onDismissOptional,
}) => {
  if (!versionState) return null;

  const { maintenance, forceUpdate, optionalUpdate, title, message, updateUrl, buttonText, skipButtonText } = versionState;

  if (!maintenance && !forceUpdate && !optionalUpdate) return null;

  const isMaintenance = maintenance;
  const isBlocking = maintenance || forceUpdate;

  const handleUpdateClick = () => {
    if (updateUrl) {
      window.location.href = updateUrl;
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-9999 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-surface-light p-8 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-md w-full text-center space-y-6 shadow-2xl">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center border-4 border-slate-100 dark:border-slate-800">
          {isMaintenance ? (
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full">
              <Wrench className="w-10 h-10 animate-bounce" />
            </div>
          ) : (
            <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full">
              <AlertTriangle className="w-10 h-10 animate-pulse" />
            </div>
          )}
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-black tracking-tight">
            {title}
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleUpdateClick}
            className="w-full py-3.5 px-6 bg-primary text-white font-extrabold text-sm rounded-2xl shadow-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!isBlocking && onDismissOptional && (
            <button
              onClick={onDismissOptional}
              className="w-full py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              {skipButtonText || "Later"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
