import React, { useState, useEffect, useRef } from "react";
import { SingleSelect } from "../Select";
import { ChartBarIcon } from "@heroicons/react/24/outline";

interface ChartCardProps {
  title: string;
  filterLabel?: string;
  filterValue?: string | number | null;
  filterOptions?: { label: string; value: string | number }[];
  onFilterChange?: (value: string | number | null) => void;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  height?: number | string;
  className?: string;
}

export const ChartCard = ({
  title,
  filterLabel,
  filterValue,
  filterOptions,
  onFilterChange,
  isLoading,
  isEmpty,
  emptyMessage = "No data available for the selected period",
  children,
  height = 300,
  className = "",
}: ChartCardProps) => {
  const [hasBeenSeen, setHasBeenSeen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenSeen(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.05,
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl lg:p-7 p-4 border border-gray-200 dark:border-slate-700/60 shadow-none bg-surface-light flex flex-col transition-colors duration-300 ${className}`}
    >
      <div className="flex lg:flex-row md:flex-col sm:flex-col flex-col justify-between lg:items-center md:items-start sm:items-start items-start mb-8 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-black dark:text-slate-100 tracking-tight font-['Cairo']">
            {title}
          </h3>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1 flex items-center gap-1.5 font-['Cairo']">
            <span className="w-1.5 h-1.5 rounded-full bg-[#008B99]"></span>
            System Analytics
          </p>
        </div>
        {filterOptions && onFilterChange && (
          <div className="min-w-[140px]">
            <SingleSelect
              label=""
              options={filterOptions}
              value={filterValue ?? null}
              onChange={onFilterChange}
              loading={isLoading}
              sx={{
                "& .MuiSelect-select": {
                  height: "38px !important",
                  minHeight: "38px !important",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "0 12px",
                  color: "#101010",
                  fontFamily: '"Cairo", sans-serif',
                },
                backgroundColor: "#f4f9f9",
                borderRadius: "12px",
                border: "1px solid #b9e7eb",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              }}
              renderValue={(value) => {
                const label =
                  filterOptions.find((o) => o.value === value)?.label || "All";
                return (
                  <span className="text-[11px] font-bold font-['Cairo']">
                    {filterLabel && (
                      <span className="text-gray-400 mr-1">{filterLabel}:</span>
                    )}
                    <span className="text-primary">{label}</span>
                  </span>
                );
              }}
            />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col" style={{ height }}>
        {isEmpty && !isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mb-5 rotate-3 border border-gray-100/50 shadow-sm">
              <ChartBarIcon className="w-8 h-8 text-gray-300" />
            </div>
            <h4 className="text-sm font-bold text-gray-900 mb-2">{emptyMessage}</h4>
            <p className="text-xs text-gray-400 max-w-[240px] leading-relaxed">
              We couldn't find any data matching your current filters or date range. Try broadening your search.
            </p>
          </div>
        ) : hasBeenSeen ? (
          children
        ) : (
          <div className="flex-1 w-full bg-gray-50/50 rounded-xl animate-pulse" />
        )}
      </div>
    </div>
  );
};
