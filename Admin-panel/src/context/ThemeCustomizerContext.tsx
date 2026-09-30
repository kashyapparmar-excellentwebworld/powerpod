import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";

export type ModeType = "light" | "dark" | "system";
export type SkinType = "default" | "bordered";

export interface ColorPreset {
  name: string;
  value: string;
}

export const PRESET_COLORS: ColorPreset[] = [
  { name: "Purple", value: "#7367F0" },
  { name: "Teal", value: "#0D9488" },
  { name: "Orange", value: "#FF9F43" },
  { name: "Crimson", value: "#EA5455" },
  { name: "Blue", value: "#0088FF" },
];

export const DEFAULT_THEME_SETTINGS = {
  primaryColor: "#0ea5e9",
  mode: "light" as ModeType,
  skin: "default" as SkinType,
  semiDark: false,
};

interface ThemeCustomizerContextType {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  mode: ModeType;
  setMode: (mode: ModeType) => void;
  resolvedMode: "light" | "dark";
  skin: SkinType;
  setSkin: (skin: SkinType) => void;
  semiDark: boolean;
  setSemiDark: (semiDark: boolean) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleCustomizer: () => void;
  openCustomizer: () => void;
  closeCustomizer: () => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = "admin_theme_customizer_settings_v2";

const ThemeCustomizerContext = createContext<ThemeCustomizerContextType | undefined>(undefined);

// Helper function to lighten/darken color
export function hexToRgb(hex: string) {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex.length === 3 ? cleanHex.split("").map(c => c + c).join("") : cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function adjustHexColor(hex: string, percent: number): string {
  try {
    const { r, g, b } = hexToRgb(hex);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, r + amt));
    const G = Math.min(255, Math.max(0, g + amt));
    const B = Math.min(255, Math.max(0, b + amt));
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  } catch {
    return hex;
  }
}

export function getLogoFilter(hex: string): string {
  if (!hex || hex.toUpperCase() === "#7367F0") return "none";
  try {
    const cleanHex = hex.replace("#", "");
    const num = parseInt(cleanHex.length === 3 ? cleanHex.split("").map(c => c + c).join("") : cleanHex, 16);
    const r = ((num >> 16) & 255) / 255;
    const g = ((num >> 8) & 255) / 255;
    const b = (num & 255) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    if (max !== min) {
      const d = max - min;
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    const targetHue = Math.round(h * 360);
    const originalHue = 265;
    const hueDiff = targetHue - originalHue;
    return `hue-rotate(${hueDiff}deg) saturate(1.2)`;
  } catch {
    return "none";
  }
}

export const ThemeCustomizerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [primaryColor, setPrimaryState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.primaryColor) return parsed.primaryColor;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_THEME_SETTINGS.primaryColor;
  });

  const [mode, setModeState] = useState<ModeType>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.mode) return parsed.mode;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_THEME_SETTINGS.mode;
  });

  const [skin, setSkinState] = useState<SkinType>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.skin) return parsed.skin;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_THEME_SETTINGS.skin;
  });

  const [semiDark, setSemiDarkState] = useState<boolean>(() => {
    return DEFAULT_THEME_SETTINGS.semiDark;
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);

  // System media query state
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const resolvedMode: "light" | "dark" = useMemo(() => {
    if (mode === "system") {
      return systemIsDark ? "dark" : "light";
    }
    return mode;
  }, [mode, systemIsDark]);

  // Persist settings
  useEffect(() => {
    const settings = { primaryColor, mode, skin, semiDark };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [primaryColor, mode, skin, semiDark]);

  // Update HTML class & CSS variables dynamically
  useEffect(() => {
    const root = document.documentElement;

    // Mode dark class
    if (resolvedMode === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }

    // Skin attribute
    root.setAttribute("data-skin", skin);
    if (skin === "bordered") {
      root.classList.add("skin-bordered");
    } else {
      root.classList.remove("skin-bordered");
    }

    // Dynamic CSS colors
    const primaryLight = adjustHexColor(primaryColor, 20);
    const primaryDark = adjustHexColor(primaryColor, -25);
    const { r, g, b } = hexToRgb(primaryColor);

    root.style.setProperty("--color-primary", primaryColor);
    root.style.setProperty("--color-secondary", primaryLight);
    root.style.setProperty("--color-tertiary", primaryDark);
    root.style.setProperty("--color-primary-rgb", `${r}, ${g}, ${b}`);

    // Update surfaces for Tailwind / CSS
    if (resolvedMode === "dark") {
      root.style.setProperty("--color-surface", "#0f172a");
      root.style.setProperty("--color-surface-light", "#1e293b");
      root.style.setProperty("--color-surface-hover", "#334155");
      root.style.setProperty("--color-black", "#f8fafc");
      root.style.setProperty("--color-gray-6", "#94a3b8");
    } else {
      root.style.setProperty("--color-surface", "#f8f9fa");
      root.style.setProperty("--color-surface-light", "#ffffff");
      root.style.setProperty("--color-surface-hover", adjustHexColor(primaryColor, 90));
      root.style.setProperty("--color-black", "#101010");
      root.style.setProperty("--color-gray-6", "#707070");
    }
  }, [primaryColor, resolvedMode, skin]);

  const setPrimaryColor = (color: string) => setPrimaryState(color);
  const setMode = (newMode: ModeType) => setModeState(newMode);
  const setSkin = (newSkin: SkinType) => setSkinState(newSkin);
  const setSemiDark = (val: boolean) => setSemiDarkState(val);
  const toggleCustomizer = () => setIsOpen((prev) => !prev);
  const openCustomizer = () => setIsOpen(true);
  const closeCustomizer = () => setIsOpen(false);

  const resetToDefaults = () => {
    setPrimaryState(DEFAULT_THEME_SETTINGS.primaryColor);
    setModeState(DEFAULT_THEME_SETTINGS.mode);
    setSkinState(DEFAULT_THEME_SETTINGS.skin);
    setSemiDarkState(DEFAULT_THEME_SETTINGS.semiDark);
  };

  return (
    <ThemeCustomizerContext.Provider
      value={{
        primaryColor,
        setPrimaryColor,
        mode,
        setMode,
        resolvedMode,
        skin,
        setSkin,
        semiDark,
        setSemiDark,
        isOpen,
        setIsOpen,
        toggleCustomizer,
        openCustomizer,
        closeCustomizer,
        resetToDefaults,
      }}
    >
      {children}
    </ThemeCustomizerContext.Provider>
  );
};

export const useThemeCustomizer = () => {
  const context = useContext(ThemeCustomizerContext);
  if (!context) {
    throw new Error("useThemeCustomizer must be used within a ThemeCustomizerProvider");
  }
  return context;
};
