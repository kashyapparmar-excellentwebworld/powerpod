import React from "react";

export type BadgeColor =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default"
  | "amber"
  | "emerald"
  | "rose"
  | "blue"
  | "purple";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  children?: React.ReactNode;
  label?: React.ReactNode;
  variant?: "filled" | "outlined" | "header";
  size?: "small" | "medium";
  showPulse?: boolean;
  hideDot?: boolean;
  icon?: React.ReactNode;
}

const COLOR_STYLES: Record<BadgeColor, string> = {
  primary: "bg-blue-50 text-blue-700 border border-blue-200",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  error: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  default: "bg-gray-100 text-gray-600 border border-gray-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border border-rose-200",
  blue: "bg-blue-50 text-blue-700 border border-blue-200",
  purple: "bg-purple-50 text-purple-700 border border-purple-200",
};

const HEADER_COLOR_STYLES: Record<BadgeColor, string> = {
  primary: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  error: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  info: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  default: "bg-gray-500/10 border-gray-500/20 text-gray-400",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
};

export const Badge = ({
  color = "default",
  children,
  label,
  className = "",
  variant = "filled",
  size,
  showPulse,
  hideDot = false,
  icon,
  ...props
}: BadgeProps) => {
  const isHeader = variant === "header";
  const styles = isHeader ? HEADER_COLOR_STYLES[color] : COLOR_STYLES[color];
  const sizeStyles = isHeader ? "px-2.5 py-1 text-xs" : "px-2.5 py-0.5 text-xs";
  const headerBase = isHeader ? "backdrop-blur-md shadow-lg" : "";
  const shouldShowDot = (isHeader && !hideDot) || showPulse;
  const shouldPulse = showPulse ?? (isHeader && !hideDot);

  return (
    <span
      className={`inline-flex items-center justify-center gap-1 rounded-full font-semibold text-nowrap capitalize border transition-all ${sizeStyles} ${styles} ${headerBase} ${className}`}
      {...props}
    >
      {shouldShowDot && (
        <span className="flex h-1.5 w-1.5 ltr:mr-1.5 rtl:ml-1.5 relative">
          {shouldPulse && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          )}
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
        </span>
      )}
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {children || label}
    </span>
  );
};
