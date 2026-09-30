import {
  FormControl,
  Select,
  MenuItem,
  type SelectProps,
  FormHelperText,
  useTheme,
} from "@mui/material";

export type DropdownProps = Omit<SelectProps, "label" | "variant"> & {
  label?: string;
  options: { label: string; value: string | number }[];
  placeholder?: string;
  helperText?: string;
  className?: string;
};

export const Dropdown = ({
  label,
  options,
  placeholder,
  helperText,
  required,
  error,
  fullWidth = true,
  className,
  size,
  ...props
}: DropdownProps) => {
  const theme = useTheme();

  return (
    <div
      className={`flex flex-col gap-2 ${fullWidth ? "w-full" : ""} ${className || ""}`}
    >
      <FormControl fullWidth={fullWidth} error={error} variant="outlined" size={size}>
        <Select
          {...props}
          size={size}
          displayEmpty
          renderValue={(selected) => {
            const selectedOption = options.find((opt) => opt.value === selected);
            return (
              <div
                className={`flex items-center gap-1 font-inter ${size === "small" ? "text-sm" : "text-base"}`}
              >
                {label && (
                  <span className="text-gray-6 font-normal">{label}:</span>
                )}
                <span className="text-black font-semibold">
                  {selectedOption
                    ? selectedOption.label
                    : !selected && placeholder
                      ? placeholder
                      : (selected as string)}
                </span>
                {required && !selected && <span className="text-error">*</span>}
              </div>
            );
          }}
          sx={{
            borderRadius: "16px",
            backgroundColor: error
              ? theme.palette.error.light
              : theme.palette.grey[300],
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-error .MuiOutlinedInput-notchedOutline": {
              border: `1px solid ${theme.palette.error.main}`,
            },
            "&.Mui-disabled": {
              backgroundColor: theme.palette.grey[300],
            },
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              padding: "0",
              height: size === "small" ? "36px" : "50px",
              minHeight: "unset !important",
            },
            "& .MuiSelect-icon": {
              color: theme.palette.secondary.main,
              top: "50%",
              transform: "translateY(-50%)",
              right: "12px",
            },
            "& .MuiSelect-iconOpen": {
              transform: "translateY(-50%) rotate(180deg)",
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: `1px solid ${theme.palette.grey[200]}`,
                mt: 0.5,
                "& .MuiMenuItem-root": {
                  fontSize: "14px",
                  color: theme.palette.text.primary,
                  padding: "10px 16px",
                  "&:hover": { backgroundColor: theme.palette.grey[50] },
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.grey[50],
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    "&:hover": { backgroundColor: theme.palette.grey[100] },
                  },
                },
              },
            },
          } as any}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              <em>{placeholder}</em>
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {helperText && (
          <FormHelperText sx={{ marginLeft: 0, fontSize: "12px", fontWeight: 500 }}>
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    </div>
  );
};
