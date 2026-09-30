import { GuestRoute } from "./guards/GuestRoute";
import { LoginPage, ForgotPasswordPage, ResetPasswordPage } from "../features/Auth";

export const authRoutes = {
  // element: <GuestRoute />,
  children: [
    { path: "/login", element: <LoginPage /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/reset-password", element: <ResetPasswordPage /> },
  ],
};
