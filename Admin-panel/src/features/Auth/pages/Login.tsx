import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch } from "../../../hooks/redux";
import { login } from "../../../redux/slices/authSlice";
import useToast from "../../../hooks/useToast";
import { TextInput } from "../../../components/common/TextInput";
import DarkLogo from "../../../assets/images/dark_logo.png";
import { Loader2 } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { useFormik } from "formik";
import { loginValidationSchema } from "../validations";
import { type LoginValues } from "../types";
import { loginAPI } from "../api";
import { useThemeCustomizer, getLogoFilter } from "../../../context/ThemeCustomizerContext";

export default function LoginPage() {
  const { primaryColor } = useThemeCustomizer();
  const logoFilter = getLogoFilter(primaryColor);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const formik = useFormik<LoginValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await loginAPI({
          email: values.email,
          password: values.password,
        });

        const userData = response.data.user || response.data.admin;
        const roleData = response.data.role || userData?.role || { id: userData?.roleId, name: "Admin", label: "Admin" };

        dispatch(
          login({
            admin: {
              ...userData,
              role: roleData,
            },
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            rememberMe,
          }),
        );
        showToast(response.message || "Welcome back!", "success");
        navigate(from, { replace: true });
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || error.message || "Invalid email or password";
        showToast(errorMsg, "error");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen w-full flex flex-col justify-center py-2 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-secondary via-primary to-tertiary">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-4 px-4 sm:rounded-2xl sm:px-6 sm:py-5 shadow-2xl border border-white/10">
          {/* Logo & Header */}
          <div className="flex flex-col items-center gap-1.5 mb-3">
            <img
              src={DarkLogo}
              alt="Wasla Logo"
              style={{ filter: logoFilter }}
              className="w-28 object-contain transition-all duration-300"
            />
            <div className="text-center">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                Wasla Admin
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Sign in securely to access your dashboard
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full mb-4" />

          {/* Form */}
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            <TextInput
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={
                formik.touched.email ? formik.errors.email : undefined
              }
              autoComplete="off"
            />

            <TextInput
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={
                formik.touched.password ? formik.errors.password : undefined
              }
              autoComplete="off"
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none w-4 h-4 rounded-[4px] border-2 border-slate-300 checked:border-primary checked:bg-primary transition-all cursor-pointer"
                  />
                  <svg
                    className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              fullWidth
              sx={{
                mt: 1,
                py: 1.5,
                borderRadius: "12px",
                fontWeight: "bold",
                textTransform: "none",
                boxShadow: "0 4px 14px 0 rgba(107, 47, 217, 0.39)",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px 0 rgba(107, 47, 217, 0.5)",
                },
              }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
