import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TextInput } from "../../../../components/common/TextInput";
import { Button } from "../../../../components/common/Button";
import useToast from "../../../../hooks/useToast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProfile, updateProfile } from "../../api";
import { useFormik } from "formik";
import { profileValidationSchema } from "../../validations";
import { Loader2, Camera, User, Mail, Clock } from "lucide-react";
import { InputAdornment, Skeleton, Avatar } from "@mui/material";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import { updateAdmin } from "../../../../redux/slices/authSlice";
import { uploadFile } from "../../../../services/uploadApi";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: profileResponse, isLoading: isInitialLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const profileData = profileResponse?.data;

  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((state) => state.auth);

  // Sync Redux state with fetched profile data so the header updates automatically
  useEffect(() => {
    if (profileData && admin) {
      if (
        profileData.avatarUrl !== admin.avatarUrl ||
        profileData.fullName !== admin.fullName
      ) {
        dispatch(updateAdmin({ ...admin, ...profileData }));
      }
    }
  }, [profileData, admin, dispatch]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      showToast(
        t("auth_profile.profile_updated", "Profile updated successfully"),
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSelectedFile(null);
      setPreviewImage(null);
    },
    onError: (error: any) => {
      showToast(
        error?.response?.data?.message || "Error updating profile",
        "error",
      );
    },
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: profileData?.fullName || "",
      email: profileData?.email || "",
    },
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      try {
        let payload: any = {
          fullName: values.fullName,
          email: values.email,
        };

        if (selectedFile) {
          const formData = new FormData();
          formData.append("file", selectedFile);
          formData.append("folder", "admins/avatars");

          if (profileData?.avatarUrl) {
            const oldPath = profileData.avatarUrl.includes("/uploads/")
              ? profileData.avatarUrl.split("/uploads/")[1]
              : profileData.avatarUrl;
            formData.append("oldFilePath", oldPath);
          }

          const uploadRes = await uploadFile(formData);
          // Extract the uploaded path from the response
          const imagePath = uploadRes?.data?.path;

          if (imagePath) {
            payload.avatarUrl = imagePath;
            payload.profile_image = imagePath;
          }
        }

        updateMutation.mutate(payload);
      } catch (error: any) {
        showToast(
          error?.response?.data?.message || "Error uploading image",
          "error",
        );
      }
    },
  });

  // The form is dirty if any text values changed, OR if a new image was selected
  const isFormDirty = formik.dirty || selectedFile !== null;

  if (isInitialLoading) {
    return (
      <div className="flex-1 w-full flex flex-col gap-6 pb-10">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] p-8 flex flex-col items-center justify-center text-center">
              <Skeleton
                variant="circular"
                width={128}
                height={128}
                sx={{ mb: 3 }}
              />
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" height={24} sx={{ mb: 3 }} />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={70}
                sx={{ borderRadius: "12px" }}
              />
            </div>
          </div>
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] p-6">
              <div className="flex flex-col gap-2 mb-8">
                <Skeleton variant="text" width="30%" height={32} />
                <Skeleton variant="text" width="50%" height={20} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: "12px" }}
                />
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: "12px" }}
                />
              </div>
              <div className="flex justify-end gap-3 pt-5 border-t border-slate-50">
                <Skeleton
                  variant="rectangular"
                  width={100}
                  height={44}
                  sx={{ borderRadius: "12px" }}
                />
                <Skeleton
                  variant="rectangular"
                  width={140}
                  height={44}
                  sx={{ borderRadius: "12px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6 pb-10">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-primary/10 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <label className="relative cursor-pointer group/avatar block">
                <div className="relative w-32 h-32 rounded-full shadow-xl ring-4 ring-white overflow-hidden z-10">
                  <Avatar
                    src={previewImage || profileData?.avatarUrl || undefined}
                    alt="Avatar"
                    sx={{
                      width: "100%",
                      height: "100%",
                      bgcolor: "primary.main",
                      fontSize: "2.25rem",
                      fontWeight: 900,
                      "& img": {
                        transition: "opacity 300ms",
                      },
                      ".group-hover\\/avatar:hover & img": {
                        opacity: 0,
                      },
                    }}
                  >
                    <span className="transition-opacity duration-300 group-hover/avatar:opacity-0">
                      {formik.values.fullName
                        ? formik.values.fullName.charAt(0).toUpperCase()
                        : "A"}
                    </span>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 rounded-full z-20">
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                      Update
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPreviewImage(URL.createObjectURL(file));
                      setSelectedFile(file);
                    }
                  }}
                />
              </label>

              <button
                type="button"
                className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-lg border border-slate-100 cursor-pointer hover:scale-110 transition-transform z-20"
                onClick={() => {
                  const fileInput = document.querySelector(
                    'input[type="file"]',
                  ) as HTMLInputElement;
                  if (fileInput) fileInput.click();
                }}
              >
                <div className="bg-primary/10 p-2 rounded-full text-primary">
                  <Camera className="w-4 h-4" />
                </div>
              </button>
            </div>

            <div className="mt-5 relative z-10">
              <h3 className="text-lg font-black text-slate-800">
                {formik.initialValues.fullName || "Admin User"}
              </h3>
              <p className="text-sm font-semibold text-slate-500 mt-0.5">
                {formik.initialValues.email || "admin@wasla.com"}
              </p>
            </div>

            <div className="mt-6 w-full px-4 py-3 bg-slate-50/80 rounded-xl border border-slate-100/50 flex items-center gap-3 relative z-10">
              <Clock className="w-5 h-5 text-indigo-500 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Last Login
                </span>
                <p className="text-[12px] font-semibold text-slate-700 leading-tight mt-0.5">
                  {profileData?.lastLoginAt
                    ? dayjs(profileData.lastLoginAt).format(
                        "MMM DD, YYYY - hh:mm A",
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50 flex flex-col gap-1">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                Personal Information
              </h3>
              <p className="text-[13px] font-medium text-slate-500">
                Update your name, email address, and contact details.
              </p>
            </div>

            <div className="p-6">
              <form
                onSubmit={formik.handleSubmit}
                className="flex flex-col gap-6"
                noValidate
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <TextInput
                    id="fullName"
                    name="fullName"
                    label={t("auth_profile.full_name", "Full Name")}
                    placeholder="e.g. John Doe"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.fullName && Boolean(formik.errors.fullName)
                    }
                    helperText={
                      formik.touched.fullName
                        ? formik.errors.fullName
                        : undefined
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <User className="w-4 h-4 text-slate-400" />
                          </InputAdornment>
                        ),
                      } as any,
                    }}
                  />

                  <TextInput
                    id="email"
                    name="email"
                    label={t("auth_profile.email")}
                    type="email"
                    placeholder="john@example.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={true}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={
                      formik.touched.email ? formik.errors.email : undefined
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Mail className="w-4 h-4 text-slate-400" />
                          </InputAdornment>
                        ),
                        sx: {
                          bgcolor: "#f8fafc", // slate-50
                          color: "#64748b", // slate-500
                        },
                      } as any,
                    }}
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-5 border-t border-slate-50 mt-2">
                  <Button
                    type="button"
                    onClick={() => {
                      formik.resetForm();
                      setPreviewImage(null);
                      setSelectedFile(null);
                    }}
                    disabled={updateMutation.isPending || !isFormDirty}
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
                      minWidth: { sm: "120px" },
                      width: { xs: "100%", sm: "auto" },
                      "&:hover": {
                        bgcolor: "#e2e8f0", // slate-200
                        color: "#1e293b", // slate-800
                        boxShadow: "none",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending || !isFormDirty}
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
                      minWidth: { sm: "160px" },
                      width: { xs: "100%", sm: "auto" },
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
                    {updateMutation.isPending ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      t("auth_profile.save_changes")
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
