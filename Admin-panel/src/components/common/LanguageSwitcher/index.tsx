import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

const languages = [
  {
    lng: "en",
    name: "English",
    code: "EN",
    flag: "https://flagcdn.com/w40/us.png",
  },
  {
    lng: "ar",
    name: "العربية",
    code: "AR",
    flag: "https://flagcdn.com/w40/sa.png",
  },
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAr = i18n.language === "ar";

  const changeLanguage = (lng: string) => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
    setOpen(false);
  };

  const currentLanguage =
    languages.find((l) => l.lng === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2.5 p-1.5 h-10.5 rounded-xl cursor-pointer transition-all duration-300 border select-none 
          text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white
              border-slate-200 dark:border-slate-200  hover:border-slate-800  
              bg-transparent hover:bg-slate-200 dark:hover:bg-white/10
          ${open
          // ? "text-primary"
          // : "bg-transparent text-slate-700 border-transparent active:scale-95"
          }
            `}
      >
        <img
          src={currentLanguage.flag}
          alt={currentLanguage.name}
          className="w-6 h-6 rounded-full object-cover shadow-sm border border-slate-200/50"
        />
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 hidden sm:block">
          {currentLanguage.code}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 hidden sm:block ${open ? "rotate-180 text-primary" : ""
            }`}
        />
      </div>

      {
        open && (
          <div
            className="absolute top-full mt-3 w-44 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top p-1.5"
            style={{ [isAr ? "left" : "right"]: 0 }}
          >
            {languages.map((lang) => {
              const isActive = i18n.language === lang.lng;
              return (
                <button
                  key={lang.lng}
                  onClick={() => changeLanguage(lang.lng)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200  
                    ${isActive
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-slate-50 dark:hover:bg-black/10 cursor-pointer"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={lang.flag}
                      alt={lang.name}
                      className="w-5 h-5 rounded-full object-cover border border-slate-100 shadow-sm"
                    />
                    <div className="flex flex-col text-start">
                      <span
                        className={`text-sm ${isActive
                          ? "font-bold text-primary"
                          : "font-semibold text-slate-700"
                          }`}
                      >
                        {lang.name}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {lang.lng === "en" ? "English" : "Arabic"}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.6)]" />
                  )}
                </button>
              );
            })}
          </div>
        )
      }
    </div >
  );
};
