import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

interface BackButtonProps {
  fallbackPath?: string;
  label?: string;
  className?: string;
}

export const BackButton = ({
  fallbackPath,
  label,
  className = "",
}: BackButtonProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (fallbackPath) {
      navigate(fallbackPath);
    } else {
      navigate("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`cursor-pointer group flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-lg ${className}`}
    >
      <ArrowLeftIcon
        className={`w-3.5 h-3.5 transition-transform ${
          isRtl
            ? "rotate-180 group-hover:translate-x-1"
            : "group-hover:-translate-x-1"
        }`}
      />
      <span className="text-[10px] font-black uppercase tracking-widest">
        {label || t("common.back")}
      </span>
    </button>
  );
};
