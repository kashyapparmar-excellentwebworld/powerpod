import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { type Dayjs } from "dayjs";
import React from "react";

type Props = {
  value?: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  pickerWidth?: string | number; // e.g. "180px", default is "100%"
};

const parse = (v?: string): [Dayjs | null, Dayjs | null] => {
  if (!v) return [null, null];
  const parts = v.split(" - ");
  if (parts.length !== 2) return [null, null];
  const s = dayjs(parts[0].trim(), "hh:mm A");
  const e = dayjs(parts[1].trim(), "hh:mm A");
  return [s.isValid() ? s : null, e.isValid() ? e : null];
};

const sharedSlotProps = (
  placeholder: string,
  error?: boolean,
  width: string | number = "100%",
) => ({
  textField: {
    size: "small" as const,
    placeholder,
    error,
    InputProps: {
      style: {
        fontSize: "16px",
        fontFamily: '"Inter", sans-serif',
        borderRadius: "16px",
      },
    },
    sx: {
      width,
      "& .MuiOutlinedInput-root": {
        borderRadius: "16px",
        backgroundColor: error ? "#FFF1F1" : "#ffffff",
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: error ? "#DC2626" : "#112B3D",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: error ? "#DC2626" : "#112B3D",
          borderWidth: "1px",
        },
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: error ? "#DC2626" : "#E7E7E7",
      },
      "& .MuiInputAdornment-root .MuiIconButton-root": {
        padding: "4px",
        "& svg": { fontSize: "16px", color: "#9CA3AF" },
      },
    },
  },
  popper: {
    sx: {
      "& .MuiPaper-root": {
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #E7E7E7",
        mt: 0.5,
      },
      "& .MuiMultiSectionDigitalClock-root": {
        maxHeight: "200px",
      },
      "& .MuiMultiSectionDigitalClockSection-root": {
        width: "60px",
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#E7E7E7",
          borderRadius: "4px",
        },
      },
      "& .MuiMultiSectionDigitalClockSection-item": {
        fontSize: "14px",
        padding: "6px 12px",
        minHeight: "38px",
        borderRadius: "8px",
        color: "#374151",
        "&:hover": { backgroundColor: "#E6EBF2" },
        "&.Mui-selected": {
          backgroundColor: "#112B3D",
          color: "#ffffff",
          "&:hover": { backgroundColor: "#112B3D" },
        },
      },
      "& .MuiDialogActions-root": {
        padding: "3px 6px",
        "& .MuiButton-root": {
          fontSize: "12px",
          fontWeight: 600,
          color: "#112B3D",
          minWidth: "auto",
          padding: "4px 10px",
        },
      },
    },
  },
});

export default function OperatingHoursPicker({
  value,
  onChange,
  error,
  helperText,
  pickerWidth = "100%",
}: Props) {
  const [start, setStart] = React.useState<Dayjs | null>(() => parse(value)[0]);
  const [end, setEnd] = React.useState<Dayjs | null>(() => parse(value)[1]);

  const prevValue = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value;
      const [s, e] = parse(value);
      setStart(s);
      setEnd(e);
    }
  }, [value]);

  const update = (s: Dayjs | null, e: Dayjs | null) => {
    setStart(s);
    setEnd(e);
    if (s?.isValid() && e?.isValid()) {
      onChange(`${s.format("hh:mm A")} - ${e.format("hh:mm A")}`);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <TimePicker
          value={start}
          onChange={(v) => update(v, end)}
          minutesStep={5}
          ampm
          slotProps={sharedSlotProps("Opening time", error, pickerWidth)}
        />
        <span className="text-gray-300 select-none text-sm">–</span>
        <TimePicker
          value={end}
          onChange={(v) => update(start, v)}
          minutesStep={5}
          ampm
          slotProps={sharedSlotProps("Closing time", error, pickerWidth)}
        />
      </div>
      {helperText && (
        <p className="text-xs font-medium text-danger mt-0.5">{helperText}</p>
      )}
    </div>
  );
}
