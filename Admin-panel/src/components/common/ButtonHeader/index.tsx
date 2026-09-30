import React from "react";
import Button from "@mui/material/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ButtonHeaderProps {
  labelKey?: string;
  navigateTo?: string;
  onClick?: () => void;
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  width?: string | number;
  height?: string | number;
  gap?: string | number;
  fontSize?: string | number;
  borderRadius?: string | number;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function ButtonHeader({
  labelKey,
  navigateTo,
  onClick,
  variant = "contained",
  color = "primary",
  width = "auto",
  height = "42px",
  gap = "8px",
  fontSize = "14px",
  className = "text-nowrap",
  borderRadius = "12px",
  disabled = false,
  icon,
  children,
}: ButtonHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (navigateTo) {
      navigate(navigateTo);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      color={color}
      startIcon={icon || <PlusIcon className="w-5 h-5" />}
      sx={{ width, height, gap, fontSize, borderRadius }}
      className={className}
      onClick={handleClick}
      disabled={disabled}
    >
      {children || (labelKey ? t(labelKey) : "")}
    </Button>
  );
}
