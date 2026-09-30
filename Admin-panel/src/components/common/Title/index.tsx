import { Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useBreadcrumbs } from "../../../hooks/useBreadcrumbs";
// import { useAppSelector } from "../../../hooks/redux";

export const Title = () => {
  const { crumbs } = useBreadcrumbs();
  const location = useLocation();

  // const { admin } = useAppSelector((state) => state.auth);
  // const displayName = admin?.name ?? "User";

  if (!crumbs || crumbs.length === 0) return null;

  const currentCrumb = crumbs[crumbs.length - 1];
  const title = currentCrumb.label;

  if (location.pathname === "/dashboard") {
    return (
      <>
        <Typography
          sx={(theme) => ({
            fontWeight: 700,
            fontSize: "20px",
            lineHeight: "28px",
            color: theme.palette.primary.main,
          })}
        >
          {title}
        </Typography>
        {/* <span className="text-gray-6 text-xs font-medium">Welcome back, {displayName}! Here's what's happening with your store today.</span> */}
      </>
    );
  }

  return (
    <Typography
      sx={(theme) => {
        return {
          fontWeight: 700,
          fontSize: "20px",
          lineHeight: "28px",
          color: theme.palette.primary.main,
        };
      }}
    >
      {title}
    </Typography>
  );
};
