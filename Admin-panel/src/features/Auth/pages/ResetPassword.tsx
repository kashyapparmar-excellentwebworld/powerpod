import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import { TextInput } from "../../../components/common/TextInput";
import DarkLogo from "../../../assets/images/dark_logo.png";
import { Loader2, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { useFormik } from "formik";
import { resetPasswordValidationSchema } from "../validations";
import { type ResetPasswordValues } from "../types";
import { verifyResetTokenAPI, resetPasswordAPI } from "../api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        setIsValidToken(false);
        return;
      }

      setIsVerifying(true);
      try {
        await verifyResetTokenAPI(token);
        setIsValidToken(true);
      } catch (error) {
        setIsValidToken(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const formik = useFormik<ResetPasswordValues>({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordValidationSchema,
    onSubmit: async (values) => {
      if (!token) return;

      try {
        setIsLoading(true);
        await resetPasswordAPI({ ...values, token });
        setDone(true);
        showToast("Password reset successfully!", "success");
      } catch (error: any) {
        showToast(
          error?.response?.data?.message || "Failed to reset password",
          "error",
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen w-full flex flex-col justify-center py-2 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-secondary via-primary to-tertiary">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-4 px-4 sm:rounded-2xl sm:px-6 sm:py-5 shadow-2xl border border-white/10 flex flex-col gap-4">
          {/* Logo & Header */}
          <div className="flex flex-col items-center gap-1.5">
            <img
              src={DarkLogo}
              alt="Wasla Logo"
              className="w-28 object-contain"
            />
            {!isVerifying && (
              <div className="text-center mt-1">
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                  {done
                    ? "Password Reset Successful"
                    : !isValidToken
                      ? "Link Expired"
                      : "Reset Password"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {done
                    ? "Your password has been reset"
                    : !isValidToken
                      ? "This password reset link is invalid or has expired."
                      : "Create a strong new password"}
                </p>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {isVerifying ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-slate-500">Verifying link...</p>
            </div>
          ) : !isValidToken ? (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-7 h-7 text-red-600" />
              </div>
              <div className="text-center mb-2">
                <p className="text-base font-bold text-slate-800">
                  Invalid or Expired Link
                </p>
                <p className="text-sm text-slate-500 mt-1 px-4">
                  Please request a new password reset link to continue.
                </p>
              </div>
              <Button
                onClick={() => navigate("/forgot-password")}
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
                Go to Forgot Password
              </Button>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors cursor-pointer mx-auto mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </div>
          ) : done ? (
            /* Success state */
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-slate-800">
                  Password updated!
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  You can now sign in with your new password.
                </p>
              </div>
              <Button
                onClick={() => navigate("/login")}
                fullWidth
                sx={{
                  mt: 1,
                  py: 1.5,
                  borderRadius: "12px",
                  fontWeight: "bold",
                  textTransform: "none",
                }}
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            /* Form */
            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              <TextInput
                id="newPassword"
                name="newPassword"
                label="New Password"
                type="password"
                placeholder="Enter new password"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.newPassword &&
                  Boolean(formik.errors.newPassword)
                }
                helperText={
                  formik.touched.newPassword
                    ? formik.errors.newPassword
                    : undefined
                }
                autoComplete="off"
              />

              <TextInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Enter your confirm password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.confirmPassword &&
                  Boolean(formik.errors.confirmPassword)
                }
                helperText={
                  formik.touched.confirmPassword
                    ? formik.errors.confirmPassword
                    : undefined
                }
                autoComplete="off"
              />

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
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Reset Password"
                )}
              </Button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors cursor-pointer mx-auto mt-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
