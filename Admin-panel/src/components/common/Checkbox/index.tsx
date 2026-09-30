import {
  Checkbox as MuiCheckbox,
  FormControlLabel,
  type CheckboxProps as MuiCheckboxProps,
  useTheme,
} from "@mui/material";
import { Square, CheckSquare } from "lucide-react";

export type CheckboxProps = MuiCheckboxProps & {
  label?: string;
};

export const Checkbox = ({ label, ...props }: CheckboxProps) => {
  const theme = useTheme();
  const checkboxContent = (
    <MuiCheckbox
      {...props}
      icon={<Square className="h-5 w-5 text-gray-300" />}
      checkedIcon={<CheckSquare className="h-5 w-5 text-primary" />}
      sx={[
        {
          padding: "0px",
          "&:hover": { backgroundColor: "transparent" },
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx || {}]),
      ]}
    />
  );

  if (!label) {
    return checkboxContent;
  }

  return (
    <FormControlLabel
      control={checkboxContent}
      label={label}
      sx={{ margin: 0, gap: "6px" }}
      slotProps={{
        typography: {
          sx: {
            fontFamily: "Cairo, sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: "21px",
            letterSpacing: "0%",
            color: theme.palette.primary.main,
          },
        },
      }}
    />
  );
};
