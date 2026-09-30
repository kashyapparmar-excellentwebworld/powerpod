import { Suspense, useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
import Header from "./Header";
import {
  MainLayoutHeaderActionsProvider,
  useMainLayoutHeaderActions,
} from "../context/MainLayoutHeaderActionsContext";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { Title } from "../components/common/Title";
import { TopProgressBar } from "../components/common/TopProgressBar";
import Loader from "../components/common/Loader/Loader";
import { SidebarLayout } from "./Sidebar";
import { ThemeCustomizer } from "../components/ThemeCustomizer";

const MainLayoutContent = () => {
  const { actions } = useMainLayoutHeaderActions();
  const { crumbs } = useBreadcrumbs();
  const showHeader = crumbs || actions;
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll to top when route changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setIsScrolled(false);
    }
  }, [location.pathname]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 0);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-hidden transition-colors duration-300">
      {showHeader && (
        <div
          className={`bg-surface-light px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap justify-between items-center gap-2 z-20 shrink-0 border-b transition-all duration-300 ${isScrolled
              ? "shadow-md border-slate-200/50 dark:border-slate-800"
              : "border-slate-100 dark:border-slate-800/60"
            }`}
        >
          <div className="flex flex-col gap-0 min-w-0">
            <Breadcrumb />
            <Title />
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {actions}
            </div>
          )}
        </div>
      )}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto px-3 sm:px-6 py-2 sidebar-scroll flex flex-col gap-4 sm:gap-6"
      >
        <Suspense
          fallback={
            <div className="flex-1 flex flex-col justify-center items-center relative min-h-75">
              <TopProgressBar />
              <Loader />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
};

export const MainLayout = () => {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const [sidebarOpen, setSidebarOpen] = useState(!isSmallScreen);

  useEffect(() => {
    setSidebarOpen(!isSmallScreen);
  }, [isSmallScreen]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <MainLayoutHeaderActionsProvider>
      <main className="flex h-[125vh] min-h-[125vh] bg-surface overflow-hidden font-sans relative transition-colors duration-300">
        {/* Mobile Sidebar Overlay */}
        {isSmallScreen && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-300"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar Container */}
        <div
          className={`transition-all duration-300 z-50 
            ${isSmallScreen
              ? `fixed top-0 bottom-0 inset-s-0 w-64 transform ${sidebarOpen ? "translate-x-0 shadow-2xl" : " rtl:translate-x-full"}`
              : `${sidebarOpen ? "w-54" : "w-20"}`
            }`}
        >
          <SidebarLayout
            collapsed={!isSmallScreen && !sidebarOpen}
            onExpand={() => setSidebarOpen(true)}
            onClose={() => isSmallScreen && setSidebarOpen(false)}
          />
        </div>

        {/* Main Content Area */}
        <section className="flex-1 flex flex-col h-full overflow-hidden">
          <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
          <MainLayoutContent />
        </section>

        {/* Theme Customizer Drawer & Floating Toggle */}
        <ThemeCustomizer />
      </main>
    </MainLayoutHeaderActionsProvider>
  );
};
