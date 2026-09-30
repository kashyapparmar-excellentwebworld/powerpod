import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../Modal";
import { Power, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  description?: React.ReactNode;
  onConfirm: () => void;
  isUpdating?: boolean;
  className?: string;
};

export const ActiveDeactivateModal: React.FC<Props> = ({
  open,
  setOpen,
  title,
  description,
  onConfirm,
  isUpdating = false,
  className,
}) => {
  const { t } = useTranslation();

  const displayTitle = title || t("common.update_status", "Update Status?");
  const displayDescription =
    description || t("common.status_confirm_desc", "Are you sure you want to change the status?");

  return (
    <Modal open={open} setOpen={setOpen} maxWidth="xs" className={className}>
      <div className="flex flex-col items-center justify-center px-2 py-4">
        {/* Top Icon */}
        <div className="w-16 h-16 rounded-full border flex items-center justify-center border-primary/20 bg-primary/5 mb-5 shadow-sm">
          <Power className="w-8 h-8 text-primary" strokeWidth={2} />
        </div>
        
        {/* Title & Description */}
        <h2 className="text-xl font-extrabold text-slate-800 mb-2 text-center">
          {displayTitle}
        </h2>
        <p className="text-sm text-slate-500 text-center mb-8 px-2">
          {displayDescription}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full max-w-[260px] mx-auto">
          <button
            onClick={() => setOpen(false)}
            disabled={isUpdating}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("common.cancel", "Cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isUpdating}
            className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(107,47,217,0.39)] transition-all cursor-pointer hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Power className="w-4 h-4" />
                {t("common.confirm", "Confirm")}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
