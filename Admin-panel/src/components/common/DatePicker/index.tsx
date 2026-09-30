import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs, { type Dayjs } from "dayjs";
import { CalendarDays } from "lucide-react";

interface CustomDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiDatePicker
        value={value ? dayjs(value) : null}
        format="DD/MM/YYYY"
        onChange={(newValue) => {
          if (newValue) {
            onChange(newValue.format("YYYY-MM-DD"));
          } else {
            onChange("");
          }
        }}
        slots={{
          openPickerIcon: () => (
            <CalendarDays className="w-4 h-4 text-gray-400 hover:text-purple-600 transition-colors" />
          ),
        }}
        slotProps={{
          textField: {
            size: "small",
          },
          popper: {
            sx: {
              "& .MuiPaper-root": {
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow:
                  "0 20px 25px -5px rgba(147, 51, 234, 0.1), 0 8px 10px -6px rgba(147, 51, 234, 0.1)",
                border: "1px solid #f3f4f6",
              },

              "& .MuiPickersCalendarHeader-label": {
                fontSize: "13px",
                fontWeight: 600,
              },

              "& .MuiDayCalendar-weekDayLabel": {
                fontSize: "11px",
              },

              "& .MuiPickersDay-root": {
                fontSize: "12px",
              },

              "& .MuiPickersMonth-monthButton": {
                fontSize: "12px",
              },

              "& .MuiPickersYear-yearButton": {
                fontSize: "12px",
              },

              "& .MuiPickersDay-root.Mui-selected": {
                backgroundColor: "#9333ea",
              },

              "& .MuiPickersDay-root.Mui-selected:hover": {
                backgroundColor: "#7e22ce",
              },
            },
          },
        }}
        sx={{
          width: "100%",

          "& .MuiOutlinedInput-root": {
            height: "38px",
            borderRadius: "12px",
            backgroundColor: "#f9fafb", // bg-gray-50
            fontSize: "13px",
            transition: "all 0.2s ease-in-out",
          },

          "& .MuiOutlinedInput-input": {
            padding: "8px 14px",
            fontSize: "13px",
            color: "#374151", // text-gray-700
            "&::placeholder": {
              color: "#9ca3af", // text-gray-400
              opacity: 1,
            },
          },

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#e5e7eb", // border-gray-200
            borderWidth: "1px",
            borderRadius: "12px",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#d1d5db", // border-gray-300
          },

          "& .Mui-focused": {
            backgroundColor: "#ffffff",
            boxShadow: "0 0 0 2px rgba(168, 85, 247, 0.3)", // ring-purple-500/30
          },

          "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c084fc !important", // border-purple-400
            borderWidth: "1px !important",
          },

          "& .MuiInputAdornment-root": {
            marginRight: "2px",
          },

          "& .MuiIconButton-root": {
            padding: "8px",
            "&:hover": {
              backgroundColor: "#f3f4f6", // gray-100
            },
          },
        }}
        className={className}
      />
    </LocalizationProvider>
  );
};

interface CustomDateCalendarProps {
  value: string;
  onChange: (val: string, selectionState?: any) => void;
  className?: string;
}

export const CustomDateCalendar: React.FC<CustomDateCalendarProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        value={value ? dayjs(value) : null}
        onChange={(newValue: Dayjs | null, selectionState?: any) => {
          if (newValue) {
            onChange(newValue.format("YYYY-MM-DD"), selectionState);
          } else {
            onChange("", selectionState);
          }
        }}
        sx={{
          width: { xs: "100%", sm: "340px" },
          maxWidth: { xs: "300px", sm: "none" },
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "8px",
          "& .MuiPickersCalendarHeader-root": {
            paddingTop: "8px",
            paddingBottom: "4px",
          },
          "& .MuiPickersCalendarHeader-label": {
            fontSize: "14px",
            fontWeight: 700,
            color: "#111827",
          },
          "& .MuiDayCalendar-weekDayLabel": {
            fontSize: "12px",
            fontWeight: 600,
            color: "#6b7280",
          },
          "& .MuiPickersDay-root": {
            fontSize: "13px",
            fontWeight: 500,
            color: "#374151",
            borderRadius: "10px",
            "&:hover": {
              backgroundColor: "#f3f4f6",
            },
          },
          "& .MuiPickersDay-root.Mui-selected": {
            backgroundColor: "#9333ea !important",
            color: "#ffffff",
            fontWeight: 700,
            "&:hover": {
              backgroundColor: "#7e22ce !important",
            },
          },
          "& .MuiPickersDay-today": {
            borderColor: "#c084fc !important",
          },
        }}
        className={className}
      />
    </LocalizationProvider>
  );
};

