import { useMemo } from "react";
import { useLocation, matchPath } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { breadcrumbMap } from "../constants/breadcrumbs";

export const useBreadcrumbs = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const crumbs = useMemo(() => {
    if (breadcrumbMap[location.pathname]) {
      return breadcrumbMap[location.pathname].map((crumb) => ({
        ...crumb,
        label: crumb.translationKey ? t(crumb.translationKey) : crumb.label,
      }));
    }
    for (const route of Object.keys(breadcrumbMap)) {
      const match = matchPath({ path: route, end: true }, location.pathname);
      if (match) {
        return breadcrumbMap[route].map((crumb) => {
          const label = crumb.translationKey
            ? t(crumb.translationKey)
            : crumb.label;
          if (crumb.to) {
            let to = crumb.to;
            Object.keys(match.params).forEach((param) => {
              to = to.replace(`:${param}`, match.params[param] || "");
            });
            return { ...crumb, to, label };
          }
          return { ...crumb, label };
        });
      }
    }
    return null;
  }, [location.pathname, t]);

  const homeLink = "/dashboard";

  return { crumbs, homeLink };
};
