import {
  FormControl,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  FormHelperText,
  useTheme,
  type SelectChangeEvent,
} from "@mui/material";
import { useEffect, useState, type SyntheticEvent } from "react";

export interface OptionType {
  label: string;
  value: string | number;
}

interface MultiSelectProps {
  label?: string;
  required?: boolean;
  options: OptionType[];
  value?: OptionType[];
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  onBlur?: (event: any) => void;
  onChange: (event: SyntheticEvent | null, value: OptionType[]) => void;
}

export const MultiSelect = ({
  label,
  required,
  options,
  value = [],
  onChange,
  disabled,
  error,
  onBlur,
  helperText,
}: MultiSelectProps) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selectedValues = value.map((v) => String(v.value));

  useEffect(() => {
    if (!open) return;

    const handleEvent = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        typeof target.closest === "function" &&
        (target.closest(".MuiMenu-paper") || target.closest(".MuiSelect-select"))
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

  const handleChange = (e: SelectChangeEvent<string[]>) => {
    const rawValues = e.target.value as string[];
    const selected = options.filter((opt) =>
      rawValues.includes(String(opt.value)),
    );
    onChange(null, selected);
  };

  const handleDelete = (optValue: string | number) => {
    onChange(
      null,
      value.filter((v) => v.value !== optValue),
    );
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <FormControl fullWidth error={error} variant="outlined">
        <Select<string[]>
          multiple
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          value={selectedValues}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          displayEmpty
          renderValue={() => {
            if (selectedValues.length === 0) {
              return (
                <span className="text-gray-400 font-normal text-sm">
                  Select {label?.toLowerCase() ?? "options"}
                </span>
              );
            }
            return (
              <span className="text-gray-900 font-medium text-sm">
                {selectedValues.length}{" "}
                {selectedValues.length === 1 ? "option" : "options"} selected
              </span>
            );
          }}
          sx={{
            borderRadius: "16px",
            padding: 0,
            minHeight: "50px",
            backgroundColor: error
              ? theme.palette.error.light
              : theme.palette.background.paper,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.grey[200],
              borderRadius: "16px",
            },
            "&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.main,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.main,
              borderWidth: "1px",
            },
            "&.Mui-error .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.error.main,
            },
            "&.Mui-disabled": {
              backgroundColor: "#F9FAFB",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.grey[200],
              },
            },
            "& .MuiSelect-select": {
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: "50px",
              padding: "0 16px",
            },
            "& .MuiSelect-icon": {
              color: theme.palette.secondary.main,
            },
          }}
          MenuProps={{
            disableScrollLock: true,
            PaperProps: {
              sx: {
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: `1px solid ${theme.palette.grey[200]}`,
                mt: 0.5,
                "& .MuiMenuItem-root": {
                  fontSize: "14px",
                  color: theme.palette.text.primary,
                  padding: "6px 12px",
                  gap: "4px",
                  "&:hover": { backgroundColor: theme.palette.grey[50] },
                  "&.Mui-selected": {
                    backgroundColor: "transparent",
                    "&:hover": { backgroundColor: theme.palette.grey[50] },
                  },
                },
              },
            },
          } as any}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              <Checkbox
                checked={selectedValues.includes(String(opt.value))}
                size="small"
                sx={{
                  color: "#D1D5DB",
                  padding: "2px",
                  "&.Mui-checked": { color: theme.palette.primary.main },
                }}
              />
              {opt.label}
            </MenuItem>
          ))}
        </Select>

        {helperText && (
          <FormHelperText
            sx={{ marginLeft: 0, fontSize: "12px", fontWeight: 500 }}
          >
            {helperText}
          </FormHelperText>
        )}
      </FormControl>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {value.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              size="small"
              onDelete={disabled ? undefined : () => handleDelete(opt.value)}
              sx={{
                fontSize: "12px",
                fontWeight: 500,
                backgroundColor: theme.palette.grey[50],
                color: theme.palette.primary.main,
                height: "26px",
                borderRadius: "8px",
                "& .MuiChip-deleteIcon": {
                  color: theme.palette.primary.main,
                  "&:hover": { color: theme.palette.error.main },
                },
              }}
            />
          ))}
        </div>
      )}

      {disabled && value.length === 0 && (
        <span className="text-sm text-gray-400">—</span>
      )}
    </div>
  );
};
