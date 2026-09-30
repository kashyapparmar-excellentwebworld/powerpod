import { useTranslation } from "react-i18next";
import { TextInput } from "../../../../components/common/TextInput";
import { Button } from "../../../../components/common/Button";
import useToast from "../../../../hooks/useToast";
import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../../api";
import { changePasswordValidationSchema } from "../../validations";
import { Loader2, KeyRound, Lock, CheckCircle2 } from "lucide-react";
import { InputAdornment } from "@mui/material";

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      showToast(
        data.message ||
          t("auth_profile.password_updated", "Password updated successfully"),
        "success",
      );
      formik.resetForm();
    },
    onError: (error: any) => {
      showToast(
        error?.response?.data?.message || "Error updating password",
        "error",
      );
    },
  });

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: changePasswordValidationSchema,
    onSubmit: async (values) => {
      changePasswordMutation.mutate({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    },
  });

  return (
    <div className="flex-1 w-full flex flex-col gap-6 pb-10">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Security Info */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-primary/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-xl ring-4 ring-white mb-6">
                <KeyRound className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">
                Strong Password
              </h3>
              <p className="text-sm font-semibold text-slate-500 leading-relaxed mb-6">
                To ensure your account's safety, please make sure your new
                password meets all the security requirements.
              </p>

              <div className="flex flex-col gap-3 w-full text-left bg-slate-50 p-5 rounded-xl border border-slate-100/50">
                <div className="flex items-center gap-3 text-[13px] font-bold text-slate-700">
                  <div className="bg-emerald-100 p-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span>At least 6 characters</span>
                </div>
                <div className="flex items-center gap-3 text-[13px] font-bold text-slate-700">
                  <div className="bg-emerald-100 p-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span>No spaces allowed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50 flex flex-col gap-1">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                Security Settings
              </h3>
              <p className="text-[13px] font-medium text-slate-500">
                Provide your current password to verify your identity.
              </p>
            </div>

            <div className="p-6">
              <form
                onSubmit={formik.handleSubmit}
                className="flex flex-col gap-6"
                noValidate
              >
                <div className="w-full max-w-2xs">
                  <TextInput
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    label={t("auth_profile.current_password")}
                    placeholder="Enter current password"
                    value={formik.values.currentPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.currentPassword &&
                      Boolean(formik.errors.currentPassword)
                    }
                    helperText={
                      formik.touched.currentPassword
                        ? formik.errors.currentPassword
                        : undefined
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock className="w-4 h-4 text-slate-400" />
                          </InputAdornment>
                        ),
                      } as any,
                    }}
                  />
                </div>

                <div className="h-px bg-slate-100 w-full my-1" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextInput
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    label={t("auth_profile.new_password")}
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
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <KeyRound className="w-4 h-4 text-slate-400" />
                          </InputAdornment>
                        ),
                      } as any,
                    }}
                  />

                  <TextInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label={t("auth_profile.confirm_password")}
                    placeholder="Confirm new password"
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
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <KeyRound className="w-4 h-4 text-slate-400" />
                          </InputAdornment>
                        ),
                      } as any,
                    }}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-50 mt-2">
                  <Button
                    type="button"
                    onClick={() => formik.resetForm()}
                    disabled={
                      changePasswordMutation.isPending ||
                      (!formik.values.currentPassword &&
                        !formik.values.newPassword &&
                        !formik.values.confirmPassword)
                    }
                    variant="outlined"
                    color="primary"
                    sx={{
                      py: 1.5,
                      px: 5,
                      borderRadius: "12px",
                      fontWeight: "700",
                      textTransform: "none",
                      color: "#475569", // slate-600
                      bgcolor: "#f1f5f9", // slate-100
                      boxShadow: "none",
                      minWidth: "120px",
                      width: "auto",
                      "&:hover": {
                        bgcolor: "#e2e8f0", // slate-200
                        color: "#1e293b", // slate-800
                        boxShadow: "none",
                      },
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending || !formik.dirty}
                    variant="contained"
                    color="primary"
                    sx={{
                      py: 1.5,
                      px: 5,
                      borderRadius: "12px",
                      fontWeight: "800",
                      textTransform: "none",
                      boxShadow: "0 4px 14px 0 rgba(107, 47, 217, 0.3)",
                      transition: "all 0.2s ease-in-out",
                      minWidth: "160px",
                      width: "auto",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 20px 0 rgba(107, 47, 217, 0.4)",
                      },
                      "&:disabled": {
                        backgroundColor: "#cbd5e1", // slate-300
                        color: "#f8fafc", // slate-50
                        boxShadow: "none",
                        transform: "none",
                      },
                    }}
                  >
                    {changePasswordMutation.isPending ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
