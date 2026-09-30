import { TimePicker as MuiTimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import React from "react";

dayjs.extend(customParseFormat);

type Props = {
  value?: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  pickerWidth?: string | number; // e.g. "180px", default is "100%"
  name?: string;
  minStartTime?: Dayjs | null;
};

const parse = (v?: string): [Dayjs | null, Dayjs | null] => {
  if (!v) return [null, null];
  const parts = v.split(" - ");
  const sPart = parts[0]?.trim();
  const ePart = parts[1]?.trim();
  const s = sPart ? dayjs(sPart, ["hh:mm A", "HH:mm"]) : null;
  const e = ePart ? dayjs(ePart, ["hh:mm A", "HH:mm"]) : null;
  return [s?.isValid() ? s : null, e?.isValid() ? e : null];
};

const sharedSlotProps = (
  placeholder: string,
  error?: boolean,
  width: string | number = "100%",
  onOpen?: () => void,
  name?: string,
) => ({
  textField: {
    name,
    size: "small" as const,
    placeholder,
    error,
    onClick: onOpen,
    InputProps: {
      readOnly: true,
      style: {
        fontSize: "16px",
        fontFamily: '"Inter", sans-serif',
        borderRadius: "16px",
        cursor: "pointer",
      },
    },
    sx: {
      width,
      "& .MuiOutlinedInput-root": {
        borderRadius: "16px",
        backgroundColor: error ? "#FFF1F1" : "#ffffff",
        cursor: "pointer",
        "& input": {
          cursor: "pointer",
        },
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

export default function TimePicker({
  value,
  onChange,
  error,
  helperText,
  pickerWidth = "100%",
  name,
  minStartTime,
}: Props) {
  const [start, setStart] = React.useState<Dayjs | null>(() => parse(value)[0]);
  const [end, setEnd] = React.useState<Dayjs | null>(() => parse(value)[1]);
  const [openStart, setOpenStart] = React.useState(false);
  const [openEnd, setOpenEnd] = React.useState(false);

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
    const startStr = s?.isValid() ? s.format("hh:mm A") : "";
    const endStr = e?.isValid() ? e.format("hh:mm A") : "";

    if (startStr || endStr) {
      onChange(`${startStr} - ${endStr}`);
    } else {
      onChange("");
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <MuiTimePicker
          value={start}
          open={openStart}
          onOpen={() => setOpenStart(true)}
          onClose={() => setOpenStart(false)}
          onChange={(v) => update(v, end)}
          minutesStep={5}
          ampm={true}
          minTime={minStartTime || undefined}
          slotProps={sharedSlotProps(
            "Opening time",
            error,
            pickerWidth,
            () => setOpenStart(true),
            name,
          )}
        />
        <span className="text-gray-300 select-none text-sm">–</span>
        <MuiTimePicker
          value={end}
          open={openEnd}
          onOpen={() => setOpenEnd(true)}
          onClose={() => setOpenEnd(false)}
          onChange={(v) => update(start, v)}
          minutesStep={5}
          ampm={true}
          minTime={start || undefined}
          slotProps={sharedSlotProps(
            "Closing time",
            error,
            pickerWidth,
            () => setOpenEnd(true),
            name,
          )}
        />
      </div>
      {helperText && (
        <p className="text-xs font-medium text-error mt-0.5">{helperText}</p>
      )}
    </div>
  );
}
