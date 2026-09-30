import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../Modal";
import { Trash2, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  setOpen?: (open: boolean) => void;
  onClose?: () => void;
  title?: string;
  description?: React.ReactNode;
  message?: React.ReactNode;
  onConfirm: () => void;
  isDeleting?: boolean;
  isLoading?: boolean;
  className?: string;
};

export const DeleteConfirmModal: React.FC<Props> = ({
  open,
  setOpen,
  onClose,
  title,
  description,
  message,
  onConfirm,
  isDeleting = false,
  isLoading = false,
  className,
}) => {
  const { t } = useTranslation();

  const handleClose = () => {
    if (onClose) onClose();
    if (setOpen) setOpen(false);
  };

  const activeLoading = isDeleting || isLoading;
  const displayTitle = title || t("common.delete_title", "Delete?");
  const displayDescription = message || description || t("common.delete_confirm", "Are you sure you want to delete this?");

  return (
    <Modal open={open} setOpen={handleClose} maxWidth="xs" className={className}>
      <div className="flex flex-col items-center justify-center px-2 py-4">
        {/* Top Icon */}
        <div className="w-16 h-16 rounded-full border flex items-center justify-center border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 mb-5 shadow-xs">
          <Trash2 className="w-8 h-8 text-rose-600 dark:text-rose-400" strokeWidth={2} />
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
            onClick={handleClose}
            disabled={activeLoading}
            className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {t("common.cancel", "Cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={activeLoading}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] transition-all cursor-pointer hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {activeLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>{t("common.delete", "Delete")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
