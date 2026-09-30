import { useState, useMemo, useEffect } from "react";
import { Popover, useTheme, useMediaQuery } from "@mui/material";
import { format } from "date-fns";
import { enUS, arSA } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./daterange-theme.css";
import { ChevronDown, X, CalendarDays } from "lucide-react";
import { DateRange } from "react-date-range";
import { useThemeCustomizer } from "../../../context/ThemeCustomizerContext";

type Props = {
  label?: string;
  value: {
    startDate: Date | null;
    endDate: Date | null;
  };
  onChange: (value: { startDate: Date | null; endDate: Date | null }) => void;
  onClear?: () => void;
  hideFilterButtons?: boolean;
};

const presets = [
  {
    labelKey: "dateFilter.presets.today",
    getRange: () => ({ startDate: new Date(), endDate: new Date() }),
  },
  {
    labelKey: "dateFilter.presets.yesterday",
    getRange: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return { startDate: new Date(d), endDate: new Date(d) };
    },
  },
  {
    labelKey: "dateFilter.presets.thisWeek",
    getRange: () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      const day = today.getDay();
      startOfWeek.setDate(today.getDate() - day);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - day));
      endOfWeek.setHours(23, 59, 59, 999);
      return { startDate: startOfWeek, endDate: endOfWeek };
    },
  },
  {
    labelKey: "dateFilter.presets.lastWeek",
    getRange: () => {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay() - 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { startDate: start, endDate: end };
    },
  },
  {
    labelKey: "dateFilter.presets.lastMonth",
    getRange: () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      return { startDate: start, endDate: end };
    },
  },
  {
    labelKey: "dateFilter.presets.lastQuarter",
    getRange: () => {
      const today = new Date();
      const currentQ = Math.floor(today.getMonth() / 3);
      const lastQ = currentQ === 0 ? 3 : currentQ - 1;
      const year =
        currentQ === 0 ? today.getFullYear() - 1 : today.getFullYear();
      const startMonth = lastQ * 3;
      const start = new Date(year, startMonth, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(year, startMonth + 3, 0);
      end.setHours(23, 59, 59, 999);
      return { startDate: start, endDate: end };
    },
  },
];

export const DateRangePickerField = ({
  label = "dateFilter.label",
  value,
  onChange,
  onClear,
  hideFilterButtons = false,
}: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t, i18n } = useTranslation();
  const { primaryColor } = useThemeCustomizer();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  // Internal state to track selection before applying
  const [tempValue, setTempValue] = useState(value);

  // Sync tempValue with prop value when popover opens
  useEffect(() => {
    if (open) {
      setTempValue(value);
    }
  }, [open, value]);

  const handleApply = () => {
    onChange(tempValue);
    setAnchorEl(null);
  };

  const hasDate = Boolean(value.startDate || value.endDate);

  const getLocale = () => {
    return i18n.language.startsWith("ar") ? arSA : enUS;
  };

  const formatLabel = () => {
    if (!value.startDate && !value.endDate) return t("dateFilter.all");

    if (value.startDate && value.endDate) {
      const startStr = format(value.startDate, "yyyy-MM-dd");
      const endStr = format(value.endDate, "yyyy-MM-dd");
      const todayStr = format(new Date(), "yyyy-MM-dd");

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = format(yesterday, "yyyy-MM-dd");

      if (startStr === todayStr && endStr === todayStr) {
        return t("dateFilter.presets.today");
      }

      if (startStr === yesterdayStr && endStr === yesterdayStr) {
        return t("dateFilter.presets.yesterday");
      }

      return `${format(value.startDate, "dd MMM", { locale: getLocale() })} - ${format(
        value.endDate,
        "dd MMM",
        { locale: getLocale() },
      )}`;
    }
    if (value.startDate)
      return format(value.startDate, "dd MMM", { locale: getLocale() });
    if (value.endDate)
      return format(value.endDate, "dd MMM", { locale: getLocale() });
    return t("dateFilter.all");
  };

  const handlePreset = (getRange: () => { startDate: Date; endDate: Date }) => {
    const { startDate, endDate } = getRange();
    onChange({ startDate, endDate });
    setAnchorEl(null);
  };

  const handleReset = () => {
    onChange({ startDate: null, endDate: null });
    setAnchorEl(null);
  };

  return (
    <>
      <div
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className="flex items-center gap-2 px-3.5 py-2.5 bg-surface-light border border-slate-200 dark:border-slate-700/60 rounded-xl cursor-pointer shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 select-none group min-w-fit"
      >
        <CalendarDays className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
        
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
            {t(label)}:
          </span>
          <span className="text-[13px] font-bold text-black">
            {formatLabel()}
          </span>
        </div>

        {hasDate && onClear ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors ml-1 focus:outline-none"
            title={t("dateFilter.clearButton")}
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <ChevronDown 
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ml-1 ${open ? "rotate-180 text-primary" : ""}`} 
          />
        )}
      </div>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={
          isMobile
            ? { vertical: "bottom", horizontal: "center" }
            : { vertical: "bottom", horizontal: "left" }
        }
        transformOrigin={
          isMobile
            ? { vertical: "top", horizontal: "center" }
            : { vertical: "top", horizontal: "left" }
        }
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              border: "none",
              bgcolor: "transparent",
              mt: 0.5,
              overflow: "hidden",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              maxWidth: isMobile ? "90vw" : "none",
            },
          },
        }}
      >
        <div className="flex flex-col sm:flex-row bg-surface-light text-black border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl">
          {/* Sidebar presets */}
          {!hideFilterButtons && (
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-[#1E2235] border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700/60 flex sm:flex-col justify-between min-w-[130px] gap-1 overflow-x-auto sm:overflow-visible">
              <div className="flex sm:flex-col gap-1 shrink-0">
                {presets.map((p) => (
                  <button
                    key={p.labelKey}
                    onClick={() => handlePreset(p.getRange)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 text-start transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {t(p.labelKey)}
                  </button>
                ))}
              </div>
              <button
                onClick={handleReset}
                style={{ color: primaryColor }}
                className="px-3 py-1.5 text-xs font-bold hover:underline cursor-pointer text-start shrink-0"
              >
                {t("dateFilter.reset")}
              </button>
            </div>
          )}

          {/* Calendar */}
          <div className="bg-surface-light flex flex-col">
            <DateRange
              ranges={useMemo(
                () => [
                  {
                    startDate: tempValue.startDate || new Date(),
                    endDate: tempValue.endDate || new Date(),
                    key: "selection",
                  },
                ],
                [tempValue.startDate, tempValue.endDate],
              )}
              onChange={(item: any) => {
                const s = item.selection;
                const newStart = s.startDate ?? null;
                const newEnd = s.endDate ?? null;

                setTempValue({
                  startDate: newStart,
                  endDate: newEnd,
                });
              }}
              moveRangeOnFirstSelection={false}
              editableDateInputs={false}
              showMonthAndYearPickers={true}
              showDateDisplay={false}
              locale={getLocale()}
            />
            <div className="p-3 border-t border-slate-200 dark:border-slate-700/60 flex justify-end">
              <button
                onClick={handleApply}
                style={{ backgroundColor: primaryColor }}
                className="px-6 py-2 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-all cursor-pointer"
              >
                {t("dateFilter.apply")}
              </button>
            </div>
          </div>
        </div>
      </Popover>
    </>
  );
};
