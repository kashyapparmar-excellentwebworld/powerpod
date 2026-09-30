import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../Modal";
import { AlertTriangle, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  isPending?: boolean;
};

export const WarningConfirmModal: React.FC<Props> = ({
  open,
  setOpen,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  onConfirm,
  isPending = false,
}) => {
  const { t } = useTranslation();

  return (
    <Modal open={open} setOpen={setOpen} maxWidth="xs">
      <div className="flex flex-col items-center justify-center px-2 py-4">
        {/* Top Icon */}
        <div className="w-16 h-16 rounded-full border flex items-center justify-center border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 mb-5 shadow-xs">
          <AlertTriangle className="w-8 h-8 text-amber-500 dark:text-amber-400" strokeWidth={2} />
        </div>
        
        {/* Title & Description */}
        <h2 className="text-xl font-extrabold text-black mb-2 text-center">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 text-center mb-6 px-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 w-full max-w-sm mx-auto">
          <button
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {t("common.cancel", "Cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(217,119,6,0.39)] transition-all cursor-pointer hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
