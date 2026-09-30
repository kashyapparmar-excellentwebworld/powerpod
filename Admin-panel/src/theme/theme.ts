import { createTheme } from "@mui/material";
import { ChevronDown } from "lucide-react";
import { adjustHexColor } from "../context/ThemeCustomizerContext";

export const getMuiTheme = (
  direction: "ltr" | "rtl" = "ltr",
  mode: "light" | "dark" = "light",
  primaryColor: string = "#0ea5e9",
  skin: "default" | "bordered" = "default"
) => {
  const isDark = mode === "dark";
  const primaryLight = adjustHexColor(primaryColor, 25);
  const primaryDark = adjustHexColor(primaryColor, -25);

  const bgColor = isDark ? "#0f172a" : "#f8f9fa";
  const paperColor = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#101010";
  const textSecondary = isDark ? "#94a3b8" : "#707070";
  const borderColor = skin === "bordered"
    ? (isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)")
    : (isDark ? "rgba(255, 255, 255, 0.08)" : `${primaryColor}26`);

  return createTheme({
    direction,
    palette: {
      mode,
      background: {
        default: bgColor,
        paper: paperColor,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
      },
      primary: {
        main: primaryColor,
        light: primaryLight,
        dark: primaryDark,
        contrastText: "#ffffff",
      },
      secondary: {
        main: primaryLight,
        light: adjustHexColor(primaryColor, 40),
        dark: primaryColor,
        contrastText: "#ffffff",
      },
      error: {
        main: "#dc2626",
        light: isDark ? "rgba(220, 38, 38, 0.2)" : "#FFF1F1",
      },
      grey: {
        50: isDark ? "#0f172a" : "#f8f9fa",
        100: isDark ? "#1e293b" : "#e9ecef",
        200: isDark ? "#334155" : "#E7E7E7",
        300: isDark ? "#475569" : "#E7E7E766",
        600: isDark ? "#94a3b8" : "#707070",
      },
      divider: borderColor,
    },
    typography: {
      fontFamily: '"Cairo", sans-serif',
      fontSize: 16,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: paperColor,
            color: textPrimary,
            ...(skin === "bordered" && {
              border: `1px solid ${borderColor}`,
              boxShadow: "none !important",
            }),
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: paperColor,
            color: textPrimary,
            ...(skin === "bordered" && {
              border: `1px solid ${borderColor}`,
              boxShadow: "none !important",
            }),
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }: { theme: any }) => ({
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding: theme.spacing(0.75, 2),
            gap: theme.spacing(1.25),
            width: "100%",
            maxWidth: "392px",
            height: "52px",
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: "14px",
            flex: "none",
            alignSelf: "stretch",
            flexGrow: 0,
            transition: "all 0.2s ease",
            "&:hover:not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.light,
              borderWidth: "2px",
            },
            "&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.main,
              borderWidth: "2px",
              boxShadow: `0 0 0 4px ${theme.palette.primary.main}20`,
            },
            "&.Mui-error": {
              background: theme.palette.error.light,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.error.main,
              },
            },
            "& input:-webkit-autofill": {
              WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
              WebkitTextFillColor: theme.palette.text.primary,
            },
          }),
          notchedOutline: ({ theme }: { theme: any }) => ({
            border: `1.5px solid ${theme.palette.grey[200]}`,
            borderRadius: "14px",
            transition: "all 0.2s ease",
          }),
          input: {
            padding: 0,
            height: "100%",
            boxSizing: "border-box",
            fontFamily: '"Cairo", sans-serif !important',
            fontSize: "15px !important",
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: ({ theme }: { theme: any }) => ({
            marginLeft: 0,
            marginRight: 0,
            marginTop: theme.spacing(0.5),
            fontSize: "12px",
            fontWeight: 500,
            color: theme.palette.error.main,
          }),
        },
      },
      MuiSelect: {
        defaultProps: {
          IconComponent: ChevronDown,
        },
        styleOverrides: {
          select: {
            display: "flex",
            alignItems: "center",
            height: "auto",
            minHeight: "1.5em",
          },
          icon: ({ theme }: { theme: any }) => ({
            top: "calc(50% - 12px)",
            right: "12px",
            color: theme.palette.primary.main,
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            width: "100%",
            maxWidth: "392px",
            height: "48px",
            borderRadius: "14px",
            padding: "8px 24px",
            gap: "12px",
            textTransform: "none",
            fontFamily: '"Cairo", sans-serif',
            fontWeight: 600,
            fontSize: "15px",
            boxShadow: "none",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow: "none",
              transform: "translateY(-1px)",
            },
          },
        },
        variants: [
          {
            props: { variant: "contained", color: "primary" },
            style: {
              background: `linear-gradient(135deg, ${primaryLight} 0%, ${primaryColor} 50%, ${primaryDark} 100%)`,
              color: "#ffffff",
              boxShadow: `0 2px 4px 0 ${primaryColor}40`,
              "&:hover": {
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryLight} 50%, ${primaryLight} 100%)`,
                boxShadow: `0 4px 12px 0 ${primaryColor}50`,
              },
              "&.Mui-disabled": {
                background: primaryColor,
                color: "#ffffff",
                opacity: 0.65,
              },
            },
          },
          {
            props: { variant: "contained", color: "secondary" },
            style: {
              backgroundColor: isDark ? "#1e293b" : "#f8f9fa",
              color: isDark ? "#f8fafc" : primaryColor,
              border: `1.5px solid ${isDark ? "#334155" : "#E7E7E7"}`,
              "&:hover": {
                backgroundColor: isDark ? "#334155" : "#e9ecef",
                borderColor: primaryColor,
              },
              "&.Mui-disabled": {
                backgroundColor: isDark ? "#1e293b" : "#f8f9fa",
                color: primaryColor,
                opacity: 0.65,
              },
            },
          },
        ],
      },
    },
  });
};
