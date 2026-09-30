import React from "react";
import { UserIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "../index";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick: () => void;
  Icon?: React.ElementType;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  Icon = UserIcon,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-300">
      <div className="p-4 bg-gray-50 rounded-full mb-4">
        <Icon className="w-12 h-12 text-gray-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm leading-relaxed">
        {description}
      </p>
      <Button
        variant="contained"
        onClick={onButtonClick}
        startIcon={<ArrowLeftIcon className="w-4 h-4" />}
        sx={{
          width: "fit-content",
          borderRadius: "12px",
          px: 4,
          py: 1.5,
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(9, 57, 129, 0.15)",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(9, 57, 129, 0.25)",
          },
        }}
      >
        {buttonText || t("common.go_back")}
      </Button>
    </div>
  );
};

export default EmptyState;
