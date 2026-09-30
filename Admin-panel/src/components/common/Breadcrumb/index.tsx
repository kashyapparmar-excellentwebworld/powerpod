import { Breadcrumbs, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useBreadcrumbs } from "../../../hooks/useBreadcrumbs";
import { ChevronRight } from "lucide-react";

export const Breadcrumb = () => {
  const { crumbs, homeLink } = useBreadcrumbs();
  const { t } = useTranslation();

  if (!crumbs) return null;

  const isOnlyDashboard =
    crumbs.length === 1 &&
    (crumbs[0].to === homeLink ||
      crumbs[0].translationKey === "sidebar.dashboard");

  if (isOnlyDashboard) {
    return (
      <span className="text-[12px] text-slate-700 font-semibold">
        {t("sidebar.dashboard")}
      </span>
    );
  }

  return (
    <Breadcrumbs
      separator={<ChevronRight size={13} className="text-slate-600" />}
      aria-label="breadcrumb"
      sx={{ fontSize: "12px", color: "#8A99AD" }}
    >
      <Link
        component={RouterLink}
        to={homeLink}
        underline="hover"
        color="inherit"
        sx={{
          display: "flex",
          alignItems: "center",
          color: "inherit",
          fontWeight: 500,
        }}
      >
        {t("sidebar.dashboard")}
      </Link>

      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        if (
          crumb.to === homeLink ||
          crumb.translationKey === "sidebar.dashboard"
        ) {
          return null;
        }

        if (isLast || !crumb.to) {
          return (
            <span
              key={`${crumb.label}-${index}`}
              className="text-slate-700 font-semibold"
            >
              {crumb.label}
            </span>
          );
        }

        return (
          <Link
            key={`${crumb.label}-${index}`}
            component={RouterLink}
            to={crumb.to}
            underline="hover"
            color="inherit"
            sx={{ fontWeight: 500 }}
          >
            {crumb.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};
