import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../../hooks/redux";

/**
 * Wraps guest-only routes (e.g. /login).
 * Already-authenticated users are redirected to /dashboard.
 */
export const GuestRoute = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
