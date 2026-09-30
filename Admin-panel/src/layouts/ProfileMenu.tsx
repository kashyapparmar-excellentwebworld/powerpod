import { useNavigate } from "react-router-dom";
import { User, Lock, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProfileMenuProps {
  onClose: () => void;
  onLogout: () => void;
  displayName: string;
  userType: string;
}

const ProfileMenu = ({ onClose, onLogout, displayName, userType }: ProfileMenuProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const menuItems = [
    {
      icon: User,
      label: t("common.my_profile"),
      desc: "Manage your account",
      onClick: () => {
        navigate("/settings/profile");
        onClose();
      },
    },
    {
      icon: Lock,
      label: t("common.change_password"),
      desc: "Update security settings",
      onClick: () => {
        navigate("/settings/change-password");
        onClose();
      },
    },
    {
      icon: LogOut,
      label: t("common.logout"),
      desc: "Sign out of your account",
      colorClass: "text-rose-600 bg-rose-50 group-hover:bg-rose-100",
      textClass: "text-rose-700",
      onClick: () => {
        onLogout();
        onClose();
      },
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden w-full">
      {/* Header section in dropdown */}
      <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-50 sm:hidden">
        <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{userType}</p>
      </div>

      <div className="p-1">
        {menuItems.map((item, index) => (
          <div key={item.label}>
            <button
              onClick={item.onClick}
              className="w-full flex items-center gap-3 p-2 rounded-xl text-start transition-all duration-200 cursor-pointer group hover:bg-slate-50 dark:hover:bg-black/10"
            >
              <div className={`p-1.5 rounded-lg transition-colors 
                ${item.colorClass || "bg-slate-100/80 text-slate-600 dark:bg-primary/10 group-hover:text-primary"}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col flex-1">
                <span className={`text-sm font-bold ${item.textClass || "text-slate-700 group-hover:text-primary! transition-colors"}`}>
                  {item.label}
                </span>
                <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                  {item.desc}
                </span>
              </div>
            </button>
            {index < menuItems.length - 1 && <div className="h-px bg-slate-50 mx-2 my-0.5" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileMenu;
