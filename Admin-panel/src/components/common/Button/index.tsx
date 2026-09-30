import {
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
} from "@mui/material";

export type ButtonProps = MuiButtonProps;

export const Button = ({
  children,
  sx,
  variant = "contained",
  color = "primary",
  ...props
}: ButtonProps) => {
  return (
    <MuiButton variant={variant} color={color} {...props} sx={sx}>
      {children}
    </MuiButton>
  );
};
