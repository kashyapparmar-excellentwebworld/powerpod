import React, { useRef } from "react";
import { RotateCcw, X, Sun, Moon, Laptop, Pipette, Settings } from "lucide-react";
import { useThemeCustomizer, PRESET_COLORS, type ModeType } from "../../context/ThemeCustomizerContext";

export const ThemeCustomizer: React.FC = () => {
  const {
    primaryColor,
    setPrimaryColor,
    mode,
    setMode,
    skin,
    setSkin,
    semiDark,
    setSemiDark,
    isOpen,
    toggleCustomizer,
    closeCustomizer,
    resetToDefaults,
  } = useThemeCustomizer();

  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryColor(e.target.value);
  };

  const isPresetColor = PRESET_COLORS.some((c) => c.value.toLowerCase() === primaryColor.toLowerCase());

  return (
    <>
      {/* Light subtle backdrop overlay for side-by-side live viewing */}
      {isOpen && (
        <div
          onClick={closeCustomizer}
          className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-80 animate-in fade-in duration-200"
        />
      )}

      {/* Slide-over Drawer Panel */}
      <div
        className={`fixed top-0 bottom-0 end-0 z-90 w-80 sm:w-96 bg-surface-light border-s border-slate-200 dark:border-slate-700/60 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"
        }`}
      >
        {/* Gear Toggle Button attached to panel left edge (matches Vuexy style) */}
        <button
          onClick={toggleCustomizer}
          aria-label="Toggle Theme Customizer"
          className="absolute -start-10 top-28 bg-primary text-white p-2.5 rounded-s-xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center border-y border-s border-white/20 z-10"
        >
          <Settings className="w-5 h-5 animate-spin-slow" />
        </button>

        {/* Header */}
        <div className="p-5 border-b border-gray-light flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-black tracking-tight">
              Theme Customizer
            </h2>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-400 mt-0.5">
              Customize & Preview in Real Time
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetToDefaults}
              title="Reset to defaults"
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:rotate-180 duration-500 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={closeCustomizer}
              title="Close Customizer"
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 sidebar-scroll">
          {/* Badge */}
          <div>
            <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-xs font-extrabold rounded-md tracking-wider">
              Theming
            </span>
          </div>

          {/* Primary Color Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Primary Color
            </h3>
            <div className="flex items-center gap-2.5 flex-wrap">
              {PRESET_COLORS.map((preset) => {
                const isSelected = primaryColor.toLowerCase() === preset.value.toLowerCase();
                return (
                  <button
                    key={preset.value}
                    onClick={() => setPrimaryColor(preset.value)}
                    title={preset.name}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-primary scale-105 shadow-md"
                        : "hover:scale-105 opacity-90 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: preset.value }}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 bg-white rounded-full shadow-xs" />
                    )}
                  </button>
                );
              })}

              {/* Custom Color Pipette Button */}
              <div className="relative">
                <button
                  onClick={() => colorInputRef.current?.click()}
                  title="Custom Color"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-all cursor-pointer ${
                    !isPresetColor
                      ? "ring-2 ring-offset-2 ring-primary scale-105 shadow-md bg-primary/10 text-primary"
                      : "hover:bg-slate-100 dark:hover:bg-slate-750 text-gray-6"
                  }`}
                >
                  <Pipette className="w-4 h-4" />
                </button>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={primaryColor}
                  onChange={handleCustomColorChange}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Mode Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Mode
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
                { id: "system", label: "System", icon: Laptop },
              ].map(({ id, label, icon: Icon }) => {
                const isSelected = mode === id;
                return (
                  <button
                    key={id}
                    onClick={() => setMode(id as ModeType)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-xs font-bold"
                        : "border-slate-200 dark:border-slate-700/70 bg-surface-light/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? "text-primary" : "text-slate-500 dark:text-slate-400"}`} />
                    <span className="text-xs">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skin Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Skin
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Default Skin Option */}
              <button
                onClick={() => setSkin("default")}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                  skin === "default"
                    ? "border-primary bg-primary/5 text-primary shadow-xs"
                    : "border-slate-200 dark:border-slate-700/70 bg-surface-light/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="w-full h-14 bg-slate-100 dark:bg-slate-800 rounded-lg p-1.5 flex flex-col gap-1 mb-1.5 overflow-hidden">
                  <div className="flex gap-1 items-center">
                    <div className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-xs" />
                    <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-xs" />
                  </div>
                  <div className="flex gap-1 flex-1">
                    <div className="w-2.5 bg-slate-300 dark:bg-slate-600 rounded-xs h-full" />
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-xs h-full" />
                  </div>
                </div>
                <span className="text-xs font-semibold ms-0.5">Default</span>
              </button>

              {/* Bordered Skin Option */}
              <button
                onClick={() => setSkin("bordered")}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                  skin === "bordered"
                    ? "border-primary bg-primary/5 text-primary shadow-xs"
                    : "border-slate-200 dark:border-slate-700/70 bg-surface-light/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 flex flex-col gap-1 mb-1.5 overflow-hidden">
                  <div className="flex gap-1 items-center">
                    <div className="w-2.5 h-2.5 border border-slate-400 dark:border-slate-600 rounded-xs" />
                    <div className="w-10 h-1.5 border border-slate-400 dark:border-slate-600 rounded-xs" />
                  </div>
                  <div className="flex gap-1 flex-1">
                    <div className="w-2.5 border border-slate-400 dark:border-slate-600 rounded-xs h-full" />
                    <div className="flex-1 border border-slate-400 dark:border-slate-600 rounded-xs h-full" />
                  </div>
                </div>
                <span className="text-xs font-semibold ms-0.5">Bordered</span>
              </button>
            </div>
          </div>

          {/* Semi Dark Switch Section */}
          <div className="pt-2 border-t border-gray-light flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Semi Dark
              </span>
              <p className="text-xs text-slate-400 dark:text-slate-400">
                Keep navigation sidebar dark
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={semiDark}
                onChange={(e) => setSemiDark(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-slate-600 peer-checked:bg-primary" />
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
