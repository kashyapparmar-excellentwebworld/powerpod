import {
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  useTheme,
  type SelectChangeEvent,
  type Theme,
  type SxProps,
} from "@mui/material";
import { useEffect, useState } from "react";

export type SingleOptionType = {
  label: string;
  value: string | number;
};

type Props = {
  id?: string;
  label: string;
  options: SingleOptionType[];
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string | boolean;
  loading?: boolean;
  onBlur?: (event: any) => void;
  renderValue?: (value: any) => React.ReactNode;
  sx?: SxProps<Theme>;
  placeholder?: string;
};

export function SingleSelect({
  id,
  label,
  options,
  value,
  onChange,
  disabled,
  required,
  error,
  helperText,
  loading,
  onBlur,
  renderValue,
  sx,
  placeholder,
}: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleEvent = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        typeof target.closest === "function" &&
        (target.closest(".MuiMenu-paper") ||
          target.closest(".MuiSelect-select"))
      ) {
        return;
      }
      setOpen(false);
    };

    window.addEventListener("scroll", handleEvent, true);
    window.addEventListener("wheel", handleEvent, true);
    window.addEventListener("mousedown", handleEvent, true);

    return () => {
      window.removeEventListener("scroll", handleEvent, true);
      window.removeEventListener("wheel", handleEvent, true);
      window.removeEventListener("mousedown", handleEvent, true);
    };
  }, [open]);

  const handleChange = (e: SelectChangeEvent<string | number>) => {
    const val = e.target.value;
    onChange(val === "" ? null : val);
  };

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>

      <FormControl fullWidth error={error} variant="outlined">
        <Select
          id={id}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          value={value ?? ""}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled || loading}
          displayEmpty
          renderValue={
            renderValue
              ? renderValue
              : () => {
                  const isEmpty =
                    value === null ||
                    value === undefined ||
                    value === "" ||
                    !selectedOption;
                  if (isEmpty) {
                    return (
                      <span className="text-gray-400 font-normal text-sm">
                        {placeholder || `Select ${label.toLowerCase()}`}
                      </span>
                    );
                  }
                  return (
                    <span className="text-gray-900 font-medium text-sm">
                      {selectedOption.label}
                    </span>
                  );
                }
          }
          sx={{
            "& .MuiSelect-select": {
              padding: 0,
              display: "flex",
              alignItems: "center",
            },
            "&.Mui-disabled": {
              backgroundColor: "#F9FAFB",
            },
            ...sx,
          }}
          MenuProps={
            {
              disableScrollLock: true,
              PaperProps: {
                style: {
                  maxHeight: 250,
                },
                sx: {
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: `1px solid ${theme.palette.grey[200]}`,
                  mt: 0.5,
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#b0b0b0 #f1f1f1",
                  "&::-webkit-scrollbar": {
                    display: "block",
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    display: "block",
                    background: "#f1f1f1",
                    borderRadius: "8px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    display: "block",
                    background: "#b0b0b0",
                    borderRadius: "8px",
                    border: "2px solid #f1f1f1",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "#909090",
                  },
                  "& .MuiList-root": {
                    "&::-webkit-scrollbar": {
                      display: "block",
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      display: "block",
                      background: "#f1f1f1",
                      borderRadius: "8px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      display: "block",
                      background: "#b0b0b0",
                      borderRadius: "8px",
                      border: "2px solid #f1f1f1",
                    },
                  },
                },
              },
            } as any
          }
        >
          {loading ? (
            <MenuItem disabled value="">
              <span className="text-gray-400 text-sm">Loading...</span>
            </MenuItem>
          ) : (
            options.map((opt) => (
              <MenuItem
                key={opt.value}
                value={opt.value}
                sx={{
                  fontSize: "13px",
                  color: theme.palette.text.primary,
                  padding: "8px 12px",
                  minHeight: "36px",
                  transition: "background-color 0.2s",
                  "&:hover": { backgroundColor: theme.palette.grey[50] },
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.grey[50],
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    "&:hover": { backgroundColor: theme.palette.grey[100] },
                  },
                }}
              >
                {opt.label}
              </MenuItem>
            ))
          )}
        </Select>

        {helperText && (
          <FormHelperText
            sx={{ marginLeft: 0, fontSize: "12px", fontWeight: 500 }}
          >
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    </div>
  );
}
