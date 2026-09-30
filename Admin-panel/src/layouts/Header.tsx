import React, { useState, useRef, useEffect } from "react";
import { Avatar } from "@mui/material";
import { PanelLeftClose, ChevronDown, Palette } from "lucide-react";
import ProfileMenu from "./ProfileMenu";
import { NotificationMenu } from "./NotificationMenu";
import { LogoutModal } from "../components/common/modal";
import { useAppSelector } from "../hooks/redux";
import { LanguageSwitcher } from "../components/common/LanguageSwitcher";
import { useThemeCustomizer } from "../context/ThemeCustomizerContext";

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const [open, setOpen] = useState(false);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const { openCustomizer } = useThemeCustomizer();

  const { admin } = useAppSelector((state) => state.auth);
  const displayName = admin?.fullName ?? "User";
  const userType = admin?.role?.label ?? "Administrator";

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setOpenLogoutModal(true);
  };

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
    <div className="h-14 sm:h-16 px-3 sm:px-6 flex justify-between items-center bg-surface-light border-b border-slate-100 dark:border-slate-800/60 shadow-xs relative z-40 transition-colors duration-300">
      <button
        className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer group relative z-10"
        onClick={toggleSidebar}
      >
        <PanelLeftClose
          className={`w-6 h-6 text-gray-6 group-hover:text-primary transition-all duration-300 ${!sidebarOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div className="flex items-center gap-2 sm:gap-3 relative z-10">
        <button
          onClick={openCustomizer}
          className="p-2 rounded-xl hover:bg-surface dark:hover:bg-white/10 text-gray-6 transition-all cursor-pointer relative group"
          title="Theme Customizer"
        >
          <Palette className="w-5 h-5 group-hover:text-primary transition-colors" />
        </button>

        <NotificationMenu />
        <LanguageSwitcher />
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setOpen((prev) => !prev)}
            className={`flex items-center gap-2 sm:gap-3 rounded-xl p-1.5 h-10.5 cursor-pointer transition-all duration-300 border 
              text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white
              border-slate-200 dark:border-slate-200  hover:border-slate-800  
              bg-transparent hover:bg-slate-200 dark:hover:bg-white/10
              ${open
                ? "text-primary shadow-xs border-slate-200 dark:border-slate-200!"
                : `active:scale-95 `
              }`}
          >
            <div className="relative">
              <Avatar
                src={admin?.avatarUrl || ""}
                alt="user"
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 14,
                  fontWeight: 800,
                  bgcolor: "primary.main",
                  color: "#fff",
                  border: "2px solid rgba(0,0,0,0.05)",
                }}
              >
                {displayName.charAt(0)}
              </Avatar>
              <span className="absolute bottom-0 inset-e-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full ring-2 ring-emerald-400/20"></span>
            </div>

            <div className="hidden sm:flex flex-col text-start">
              <span className="text-xs font-extrabold tracking-tight truncate max-w-25 text-black">
                {displayName}
              </span>
              <span
                className={`text-[8px] font-bold uppercase tracking-widest ${open ? "text-primary" : "text-slate-400 dark:text-slate-500"}`}
              >
                {userType}
              </span>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`}
            />
          </div>

          {open && (
            <div className="fixed sm:absolute top-14 sm:top-full inset-x-4 sm:inset-x-auto sm:inset-e-0 mt-2 sm:mt-3 sm:w-56 animate-in fade-in slide-in-from-top-2 duration-200 sm:origin-top-end z-100">
              <ProfileMenu
                onClose={() => setOpen(false)}
                onLogout={handleLogout}
                displayName={displayName}
                userType={userType}
              />
            </div>
          )}

          {openLogoutModal && (
            <LogoutModal open={openLogoutModal} setOpen={setOpenLogoutModal} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
