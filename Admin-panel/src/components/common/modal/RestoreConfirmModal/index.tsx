import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../Modal";
import { RotateCcw, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  description?: React.ReactNode;
  onConfirm: () => void;
  isUpdating?: boolean;
  className?: string;
};

export const RestoreConfirmModal: React.FC<Props> = ({
  open,
  setOpen,
  title,
  description,
  onConfirm,
  isUpdating = false,
  className,
}) => {
  const { t } = useTranslation();

  const displayTitle = title || t("common.restore_title", "Restore?");
  const displayDescription = description || t("common.restore_confirm", "Are you sure you want to restore this?");

  return (
    <Modal open={open} setOpen={setOpen} maxWidth="xs" className={className}>
      <div className="flex flex-col items-center justify-center px-2 py-4">
        {/* Top Icon */}
        <div className="w-16 h-16 rounded-full border flex items-center justify-center border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 mb-5 shadow-xs">
          <RotateCcw className="w-8 h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
        </div>
        
        {/* Title & Description */}
        <h2 className="text-xl font-extrabold text-black mb-2 text-center">
          {displayTitle}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 text-center mb-6 px-2 leading-relaxed">
          {displayDescription}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full max-w-sm mx-auto">
          <button
            onClick={() => setOpen(false)}
            disabled={isUpdating}
            className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {t("common.cancel", "Cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isUpdating}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-all cursor-pointer hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>{t("common.restore", "Restore")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
