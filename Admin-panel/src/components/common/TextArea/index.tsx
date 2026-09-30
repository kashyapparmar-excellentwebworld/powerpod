import { TextareaAutosize } from "@mui/material";
import { FormHelperText } from "@mui/material";
import { useTheme } from "@mui/material";

export type TextAreaProps = {
  label?: string;
  required?: boolean;
  name?: string;
  value?: string;
  placeholder?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
};

export const TextArea = ({
  label,
  required,
  error,
  helperText,
  minRows = 4,
  maxLength,
  ...props
}: TextAreaProps) => {
  const theme = useTheme();

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="flex items-center gap-0.5 w-full text-black font-inter text-sm font-normal leading-normal tracking-normal">
          {label}
          {required && <span className="text-error">*</span>}
        </label>
      )}
      <TextareaAutosize
        minRows={minRows}
        maxLength={maxLength}
        {...props}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "12px 16px",
          borderRadius: "16px",
          border: `1px solid ${error ? theme.palette.error.main : theme.palette.grey[200]}`,
          backgroundColor: error
            ? theme.palette.error.light
            : theme.palette.background.paper,
          fontFamily: '"Inter", sans-serif',
          fontSize: "16px",
          color: theme.palette.text.primary,
          outline: "none",
          resize: "vertical",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error
            ? theme.palette.error.main
            : theme.palette.primary.main;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? theme.palette.error.main
            : theme.palette.grey[200];
          props.onBlur?.(e);
        }}
      />
      {helperText && (
        <FormHelperText error={error} sx={{ mx: 0 }}>
          {helperText}
        </FormHelperText>
      )}
    </div>
  );
};
