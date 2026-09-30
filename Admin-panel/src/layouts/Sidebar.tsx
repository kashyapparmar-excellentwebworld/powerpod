import { Tooltip, Collapse } from "@mui/material";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ChevronDown,
  Store,
  Box,
  MapPin,
  Landmark,
  Banknote,
  TrendingUp,
  PieChart,
  Settings,
  Plug
} from "lucide-react";
import type { RootState } from "../redux/store";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { useThemeCustomizer } from "../context/ThemeCustomizerContext";

export const ROLES = {
  ADMIN: "admin",
  SUPERVISOR: "supervisor",
  STAFF: "staff",
};

interface SidebarMenuItem {
  label: string;
  translationKey: string;
  path?: string;
  icon?: React.ReactNode;
  slug: string;
  section?: string;
  children?: SidebarMenuItem[];
}

const sidebarMenu: SidebarMenuItem[] = [
  {
    label: "Dashboard",
    translationKey: "sidebar.dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    slug: "dashboard",
  },
  {
    label: "Merchants",
    translationKey: "sidebar.merchants",
    path: "/manage/merchants",
    icon: <Store className="h-5 w-5" />,
    slug: "merchants",
    section: "manage",
  },
  {
    label: "Assets",
    translationKey: "sidebar.assets",
    path: "/manage/assets",
    icon: <Box className="h-5 w-5" />,
    slug: "assets",
    section: "manage",
  },
  {
    label: "Venue",
    translationKey: "sidebar.venue",
    path: "/manage/venue",
    icon: <MapPin className="h-5 w-5" />,
    slug: "venue",
    section: "manage",
  },
  {
    label: "Bank mngt",
    translationKey: "sidebar.bank_management",
    path: "/manage/bank",
    icon: <Landmark className="h-5 w-5" />,
    slug: "bank_management",
    section: "manage",
  },
  {
    label: "User & roles",
    translationKey: "sidebar.user_roles",
    path: "/manage/users-roles",
    icon: <Users className="h-5 w-5" />,
    slug: "user_roles",
    section: "manage",
  },
  {
    label: "Payrolls",
    translationKey: "sidebar.payrolls",
    path: "/manage/payrolls",
    icon: <Banknote className="h-5 w-5" />,
    slug: "payrolls",
    section: "manage",
  },
  {
    label: "Sales & Revenue",
    translationKey: "sidebar.sales_revenue",
    path: "/reports/sales-revenue",
    icon: <TrendingUp className="h-5 w-5" />,
    slug: "sales_revenue",
    section: "reports",
  },
  {
    label: "Merchants",
    translationKey: "sidebar.reports_merchants",
    path: "/reports/merchants",
    icon: <Store className="h-5 w-5" />,
    slug: "reports_merchants",
    section: "reports",
  },
  {
    label: "Assets",
    translationKey: "sidebar.reports_assets",
    path: "/reports/assets",
    icon: <Box className="h-5 w-5" />,
    slug: "reports_assets",
    section: "reports",
  },
  {
    label: "Venue",
    translationKey: "sidebar.reports_venue",
    path: "/reports/venue",
    icon: <MapPin className="h-5 w-5" />,
    slug: "reports_venue",
    section: "reports",
  },
  {
    label: "Finance",
    translationKey: "sidebar.finance",
    path: "/reports/finance",
    icon: <PieChart className="h-5 w-5" />,
    slug: "finance",
    section: "reports",
  },
  {
    label: "Device",
    translationKey: "sidebar.device",
    path: "/bajie/device",
    icon: <Plug className="h-5 w-5" />,
    slug: "device",
    section: "bajie",
  },
  {
    label: "Device",
    translationKey: "sidebar.device",
    path: "/wocharge/device",
    icon: <Plug className="h-5 w-5" />,
    slug: "device",
    section: "wocharge",
  },
];

interface SidebarLayoutProps {
  collapsed?: boolean;
  onExpand?: () => void;
  onClose?: () => void;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  collapsed = false,
  onExpand,
  onClose,
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const { semiDark, resolvedMode } = useThemeCustomizer();
  const isDarkSidebar = semiDark || resolvedMode === "dark";

  const { access } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  void dispatch;

  const filteredMenu = React.useMemo(() => {
    if (!access || access.allAccess) return sidebarMenu;

    return sidebarMenu
      .filter((item) => {
        if (item.slug === "user_roles" || item.slug === "dashboard") return true;

        const permission = access.modulePermissions?.find(
          (p: any) => p.moduleSlug === item.slug,
        );
        if (permission) return permission.canView;

        if (item.children) {
          const hasVisibleChild = item.children.some((child) => {
            const childPermission = access.modulePermissions?.find(
              (p: any) => p.moduleSlug === child.slug,
            );
            return childPermission ? childPermission.canView : true;
          });
          return hasVisibleChild;
        }

        return true;
      })
      .map((item) => {
        if (item.children) {
          return {
            ...item,
            children: item.children.filter((child) => {
              const childPermission = access.modulePermissions?.find(
                (p: any) => p.moduleSlug === child.slug,
              );
              return childPermission ? childPermission.canView : true;
            }),
          };
        }
        return item;
      });
  }, [access]);

  useEffect(() => {
    if (filteredMenu.length > 0) {
      const isDashboardAvailable = filteredMenu.some(
        (m) => m.path === "/dashboard",
      );
      if (
        pathname === "/" ||
        (pathname === "/dashboard" && !isDashboardAvailable)
      ) {
        const firstItem = filteredMenu[0];
        if (firstItem.path) {
          navigate(firstItem.path);
        } else if (firstItem.children && firstItem.children.length > 0) {
          navigate(firstItem.children[0].path as string);
        }
      }
    }
  }, [pathname, filteredMenu, navigate]);

  const isChildActive = (child: SidebarMenuItem, currentPath: string) => {
    if (!child.path) return false;
    if (currentPath === child.path) return true;
    return currentPath.startsWith(child.path + "/");
  };

  useEffect(() => {
    let foundOpenSubmenu: string | null = null;
    filteredMenu.forEach((item: SidebarMenuItem) => {
      if (item.children) {
        const isActiveChild = item.children.some((child: SidebarMenuItem) =>
          isChildActive(child, pathname)
        );
        if (isActiveChild) {
          foundOpenSubmenu = item.label;
        }
      }
    });
    setOpenSubmenu(foundOpenSubmenu);
  }, [pathname, filteredMenu]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu((prev) => (prev === label ? null : label));
  };

  const handleParentClick = (item: SidebarMenuItem) => {
    if (collapsed && onExpand) {
      onExpand();
    }
    toggleSubmenu(item.label);
  };

  const handleChildClick = () => {
    if (onClose) onClose();
  };

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const groupedMenu = React.useMemo(() => {
    const groups: { section?: string; items: SidebarMenuItem[] }[] = [];
    filteredMenu.forEach((item) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.section === item.section) {
        lastGroup.items.push(item);
      } else {
        groups.push({ section: item.section, items: [item] });
      }
    });
    return groups;
  }, [filteredMenu]);

  const activeBg = "bg-primary text-white shadow-md shadow-primary/30 rounded-xl font-bold border-s-4 border-white/40";

  const inactiveBg = isDarkSidebar
    ? "text-slate-300 hover:bg-white/10 hover:text-white border-s-4 border-transparent"
    : "text-gray-6 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border-s-4 border-transparent";

  return (
    <>
      <div
        className={`h-full w-full flex flex-col px-3 py-1.5 relative overflow-hidden transform-gpu will-change-transform transition-colors duration-300 bg-surface-light border-e border-slate-200 dark:border-slate-800`}
      >
        <div
          className={`shrink-0 flex items-center px-1 relative z-10 ${collapsed ? "h-14 sm:h-14" : "h-16"}`}
        >
          {collapsed ? (
            <div
              className="flex justify-center w-full cursor-pointer group"
              onClick={() => {
                onExpand?.();
                navigate("/dashboard");
                if (onClose) onClose();
              }}
            >
              <div className={`p-1.5 rounded-xl backdrop-blur-sm shadow-md transition-colors duration-300 ${isDarkSidebar
                ? "bg-white/10 border border-white/10 group-hover:bg-white/15"
                : "bg-surface-light border border-gray-light"
                }`}>
                <div className="bg-primary text-white font-extrabold flex items-center justify-center rounded-lg h-7 w-7 text-sm">
                  P
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-between w-full px-2 py-0.5 rounded-2xl transition-colors duration-300"
            >
              <div
                className="flex items-center cursor-pointer gap-2"
                onClick={() => {
                  navigate("/dashboard");
                  if (onClose) onClose();
                }}
              >
                <div className="bg-primary text-white font-extrabold flex items-center justify-center rounded-[10px] h-9 w-9 text-lg shadow-sm shadow-primary/30">
                  P
                </div>
                <span className={`text-xl font-bold tracking-tight ${isDarkSidebar ? "text-white" : "text-black"}`}>
                  PowerPod
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar mt-2">
          <nav className="flex flex-col gap-0.5 w-full pb-4">
            {groupedMenu.map((group, groupIndex) => {
              const isSectionCollapsed = group.section ? collapsedSections[group.section] : false;

              const sectionHeader = group.section && !collapsed && (
                <div
                  className="px-2 pt-3 pb-1.5 select-none flex items-center justify-between cursor-pointer group/section transition-colors"
                  onClick={() => toggleSection(group.section!)}
                >
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest transition-colors ${isDarkSidebar ? "text-white/40 group-hover/section:text-white/60" : "text-slate-400 dark:text-slate-500 group-hover/section:text-slate-700"}`}>
                    {t(`sidebar.section_${group.section}`)}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isDarkSidebar ? "text-white/40 group-hover/section:text-white/60" : "text-slate-400 group-hover/section:text-slate-700"} ${isSectionCollapsed ? "-rotate-90" : ""}`} />
                </div>
              );

              const itemsContent = group.items.map((item: SidebarMenuItem) => {
                const hasChildren = item.children && item.children.length > 0;
                const isSubmenuOpen = openSubmenu === item.label;
                const isParentActive =
                  hasChildren &&
                  item.children?.some((child: SidebarMenuItem) =>
                    isChildActive(child, pathname)
                  );

                const content = (
                  <div
                    key={item.label}
                    className="w-full mb-1 px-1 relative group"
                  >
                    {hasChildren ? (
                      <button
                        onClick={() => handleParentClick(item)}
                        className={`w-full flex items-center gap-3 cursor-pointer ${collapsed ? "justify-center" : "justify-start"
                          } px-3 py-2.5 rounded-xl transition-all duration-300 relative group ${isParentActive ? activeBg : inactiveBg
                          }`}
                      >
                        <span
                          className={`flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${collapsed ? "scale-110" : ""
                            }`}
                        >
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <>
                            <span className="text-sm font-medium tracking-wide flex-1 text-start">
                              {t(item.translationKey, { defaultValue: item.label })}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-300 ${isSubmenuOpen ? "rotate-180" : ""
                                }`}
                            />
                          </>
                        )}
                      </button>
                    ) : (
                      <NavLink
                        to={item.path || "#"}
                        onClick={() => {
                          setOpenSubmenu(null);
                          onClose?.();
                        }}
                        className={({ isActive }) =>
                          `w-full flex items-center gap-3 ${collapsed ? "justify-center" : "justify-start"
                          } px-3 py-2 rounded-xl transition-all duration-300 relative group ${isActive ? activeBg : inactiveBg
                          }`
                        }
                      >
                        <span
                          className={`flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${collapsed ? "scale-110" : ""
                            }`}
                        >
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <span className="text-sm font-medium tracking-wide">
                            {t(item.translationKey, { defaultValue: item.label })}
                          </span>
                        )}
                      </NavLink>
                    )}

                    {/* Expanded Submenu */}
                    {hasChildren && !collapsed && (
                      <Collapse
                        in={isSubmenuOpen}
                        timeout={220}
                        easing="ease-in-out"
                        unmountOnExit
                        className="pt-2"
                      >
                        <div className={`flex flex-col gap-1 mt-1 ms-4 ps-2 border-s ${isDarkSidebar ? "border-white/10" : "border-slate-200 dark:border-slate-800"
                          }`}>
                          {item.children?.map((child: SidebarMenuItem) => {
                            const activeChild = isChildActive(child, pathname);
                            return (
                              <NavLink
                                key={child.path}
                                to={child.path || "#"}
                                onClick={handleChildClick}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors duration-300 ${activeChild
                                  ? isDarkSidebar
                                    ? "bg-white/20 text-white font-bold"
                                    : "bg-primary/10 text-primary font-bold"
                                  : isDarkSidebar
                                    ? "text-white/70 hover:bg-white/10 hover:text-white"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                  }`}
                              >
                                <span className="text-[13px] font-medium tracking-wider">
                                  {t(child.translationKey, { defaultValue: child.label })}
                                </span>
                              </NavLink>
                            );
                          })}
                        </div>
                      </Collapse>
                    )}

                    {/* Collapsed flyout */}
                    {hasChildren && collapsed && (
                      <div
                        className={`absolute inset-s-full top-0 ms-2 min-w-50 transition-opacity duration-200 z-100 ${isSubmenuOpen
                          ? "opacity-100 visible"
                          : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                          }`}
                      >
                        <div className={`rounded-xl border shadow-2xl overflow-hidden py-1.5 backdrop-blur-xl ${isDarkSidebar
                          ? "bg-primary text-white border-white/10"
                          : "bg-white dark:bg-slate-900 text-black border-slate-200 dark:border-slate-800"
                          }`}>
                          <div className="px-4 py-2 border-b border-slate-200/20 dark:border-slate-700/50 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                              {t(item.translationKey)}
                            </span>
                          </div>
                          {item.children?.map((child: SidebarMenuItem) => {
                            const activeFlyoutChild = isChildActive(child, pathname);
                            return (
                              <NavLink
                                key={child.path}
                                to={child.path || "#"}
                                onClick={handleChildClick}
                                className={`w-full flex items-center px-4 py-2.5 rounded-xl transition-colors duration-300 ${activeFlyoutChild
                                  ? "bg-primary/20 text-primary font-bold"
                                  : "opacity-80 hover:opacity-100 hover:bg-primary/10"
                                  }`}
                              >
                                <span className="text-[13px] font-medium tracking-wider">
                                  {t(child.translationKey, { defaultValue: child.label })}
                                </span>
                              </NavLink>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );

                return collapsed ? (
                  <Tooltip
                    key={item.label}
                    title={t(item.translationKey)}
                    placement={i18n.language === "ar" ? "left" : "right"}
                    arrow
                  >
                    {content}
                  </Tooltip>
                ) : (
                  <React.Fragment key={item.label}>
                    {content}
                  </React.Fragment>
                );
              });

              return (
                <React.Fragment key={group.section || `group-${groupIndex}`}>
                  {sectionHeader}
                  {group.section && !collapsed ? (
                    <Collapse in={!isSectionCollapsed} timeout={220} unmountOnExit>
                      <div className="flex flex-col gap-0.5 w-full">
                        {itemsContent}
                      </div>
                    </Collapse>
                  ) : (
                    <div className="flex flex-col gap-0.5 w-full">
                      {itemsContent}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>
        <NavLink
          to={"/settings"}
        >
          <div className={`w-full rounded-xl cursor-pointer flex p-2 gap-3 items-center ${pathname === "/settings" ? activeBg : inactiveBg}`} >
            <Settings className="h-5 w-5" />
            <span>
              settings
            </span>
          </div>
        </NavLink>
      </div>
    </>
  );
};

export default SidebarLayout;
