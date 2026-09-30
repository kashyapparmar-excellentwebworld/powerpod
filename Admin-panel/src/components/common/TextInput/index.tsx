import { useState } from "react";
import {
  TextField,
  type TextFieldProps,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Info, Eye, EyeOff } from "lucide-react";

export type TextInputProps = Omit<TextFieldProps, "label"> & {
  label?: string;
  required?: boolean;
  infotip?: string;
};

export const TextInput = ({
  label,
  required,
  infotip,
  ...props
}: TextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  // Destructure to handle deprecated inputProps and avoid MUI warnings
  const { inputProps, slotProps, ...otherProps } = props as any;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
          <div className="flex items-center gap-1.5">{label}</div>
          {required && <span className="text-red-500 font-bold">*</span>}
          {infotip && (
            <Tooltip
              title={
                <div className="px-0.5 py-0.5">
                  <p className="text-[11px] font-bold tracking-tight">
                    {infotip}
                  </p>
                </div>
              }
              arrow
              placement="top"
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: "#1e293b",
                    color: "white",
                    borderRadius: "10px",
                    padding: "8px 14px",
                    fontSize: "11px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    "& .MuiTooltip-arrow": {
                      color: "#1e293b",
                    },
                  },
                },
              }}
            >
              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 border border-gray-200 hover:bg-gray-200 cursor-help transition-all duration-200">
                <Info className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </Tooltip>
          )}
        </label>
      )}
      <TextField
        {...otherProps}
        type={
          props.type === "password"
            ? showPassword
              ? "text"
              : "password"
            : props.type
        }
        onKeyDown={(e) => {
          const isNegativeAllowed =
            inputProps?.min === undefined || inputProps?.min < 0;
          
          if (
            props.type === "number" &&
            (["e", "E"].includes(e.key) || (!isNegativeAllowed && e.key === "-"))
          ) {
            e.preventDefault();
          }
          if (props.onKeyDown) {
            props.onKeyDown(e);
          }
        }}
        variant="outlined"
        fullWidth
        sx={{
          ...(props.sx as any),
          "& input[type=number]": {
            MozAppearance: "textfield", // Firefox
          },
          "& input[type=number]::-webkit-outer-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
          },
          "& input[type=number]::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
          },
        }}
        slotProps={{
          ...slotProps,
          input: {
            ...(slotProps?.input as any),
            inputProps: {
              ...inputProps,
              ...((slotProps?.input as any)?.inputProps || {}),
              ...(props.type === "number" && inputProps?.min === undefined
                ? { min: 0 }
                : {}),
            },
            endAdornment:
              props.type === "password" ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ p: "13px", color: "gray" }}
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </IconButton>
                </InputAdornment>
              ) : (
                (slotProps?.input as any)?.endAdornment
              ),
          },
        }}
      />
    </div>
  );
};
