import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../../hooks/redux";

/**
 * Wraps protected routes.
 * Unauthenticated users are redirected to /login.
 * The current location is saved so they can be returned after login.
 */
export const ProtectedRoute = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
