import React from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  setOpen,
  title,
  children,
  maxWidth = "sm",
  fullWidth = true,
  className,
}) => {
  const handleClose = () => setOpen(false);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "24px",
            padding: "0px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            bgcolor: "transparent",
            backgroundImage: "none",
            ...(maxWidth === "xs" && { maxWidth: "360px" }),
          },
        },
      }}
    >
      {title && (
        <DialogTitle className="flex items-center justify-between py-4! px-6! bg-slate-50 dark:bg-[#1E2235] text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700/60 m-0!">
          <span className="text-base font-black tracking-tight">
            {title}
          </span>
          <IconButton
            onClick={handleClose}
            size="small"
            className="hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent className={`p-1! sm:p-1! bg-surface-light text-black ${className || ""}`}>
        {children}
      </DialogContent>
    </Dialog>
  );
};
