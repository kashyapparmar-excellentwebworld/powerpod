import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextInput } from "../../../components/common/TextInput";
import DarkLogo from "../../../assets/images/dark_logo.png";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "../../../components/common/Button";
import { useFormik } from "formik";
import { forgotPasswordValidationSchema } from "../validations";
import { type ForgotPasswordValues } from "../types";

import { forgotPasswordAPI } from "../api";
import useToast from "../../../hooks/useToast";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik<ForgotPasswordValues>({
    initialValues: {
      email: "",
    },
    validationSchema: forgotPasswordValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const res = await forgotPasswordAPI(values);
        setSent(true);
        showToast(res.message || "Reset link sent successfully", "success");
      } catch (error: any) {
        showToast(
          error?.response?.data?.message || "Failed to send reset link",
          "error"
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
            <div className="text-center mt-1">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                Forgot Password
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {sent
                  ? "Check your inbox for a reset link"
                  : "Enter your email to receive a reset link"}
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {sent ? (
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
                  Reset link sent!
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  We sent a password reset link to{" "}
                  <span className="font-semibold text-slate-700">
                    {formik.values.email}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            /* Form */
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
                placeholder="Enter your registered email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={
                  formik.touched.email ? formik.errors.email : undefined
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
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}

          {/* Back link */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors cursor-pointer mx-auto mt-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
