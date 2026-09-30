import { type ReactNode, useMemo, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import { useTranslation } from "react-i18next";
import { getMuiTheme } from "../../theme/theme";
import { ThemeCustomizerProvider, useThemeCustomizer } from "../../context/ThemeCustomizerContext";

interface AppThemeProviderProps {
  children: ReactNode;
}

// Create rtl cache
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

const cacheLtr = createCache({
  key: "muiltr",
});

const MuiThemeWrapper = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  const { resolvedMode, primaryColor, skin } = useThemeCustomizer();
  const direction = i18n.language === "ar" ? "rtl" : "ltr";

  const theme = useMemo(
    () => getMuiTheme(direction, resolvedMode, primaryColor, skin),
    [direction, resolvedMode, primaryColor, skin]
  );

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
  }, [direction, i18n.language]);

  return (
    <CacheProvider value={direction === "rtl" ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <div dir={direction} className="min-h-screen bg-surface text-black transition-colors duration-300">
          {children}
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
};

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  return (
    <ThemeCustomizerProvider>
      <MuiThemeWrapper>{children}</MuiThemeWrapper>
    </ThemeCustomizerProvider>
  );
};
