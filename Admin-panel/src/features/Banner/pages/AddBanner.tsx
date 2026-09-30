import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import { Loader2 } from "lucide-react";
import { TextInput } from "../../../components/common/TextInput";
import { Button } from "../../../components/common/Button";
import { ImageUploader } from "../../../components/common/ImageUploader";
import { SingleSelect } from "../../../components/common/Select";
import useToast from "../../../hooks/useToast";
import { uploadFile } from "../../../services/uploadApi";
import { createBannerAPI } from "../api/bannerApi";
import { bannerValidationSchema, BANNER_LINK_TYPES } from "../validations";

const AddBanner: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: "",
      titleAr: "",
      imageUrl: null as File | string | null,
      imageUrlAr: null as File | string | null,
      mobileImageUrl: null as File | string | null,
      mobileImageUrlAr: null as File | string | null,
      linkUrlType: null as string | null,
      linkUrlId: "",
      displayOrder: 0,
    },
    validationSchema: bannerValidationSchema(t),
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        let payload: any = {
          title: values.title,
          titleAr: values.titleAr || null,
          linkUrlType: values.linkUrlType || null,
          linkUrlId: values.linkUrlId || null,
          displayOrder: values.displayOrder,
        };

        const uploadPromises = [];

        // Upload English Web Image
        if (values.imageUrl && values.imageUrl instanceof File) {
          const formData = new FormData();
          formData.append("file", values.imageUrl);
          formData.append("folder", "banners/web");
          uploadPromises.push(
            uploadFile(formData).then((res) => {
              payload.imageUrl = res.data.path;
            }),
          );
        }

        // Upload Arabic Web Image
        if (values.imageUrlAr && values.imageUrlAr instanceof File) {
          const formData = new FormData();
          formData.append("file", values.imageUrlAr);
          formData.append("folder", "banners/web/ar");
          uploadPromises.push(
            uploadFile(formData).then((res) => {
              payload.imageUrlAr = res.data.path;
            }),
          );
        }

        // Upload English Mobile Image
        if (values.mobileImageUrl && values.mobileImageUrl instanceof File) {
          const formData = new FormData();
          formData.append("file", values.mobileImageUrl);
          formData.append("folder", "banners/mobile");
          uploadPromises.push(
            uploadFile(formData).then((res) => {
              payload.mobileImageUrl = res.data.path;
            }),
          );
        }

        // Upload Arabic Mobile Image
        if (
          values.mobileImageUrlAr &&
          values.mobileImageUrlAr instanceof File
        ) {
          const formData = new FormData();
          formData.append("file", values.mobileImageUrlAr);
          formData.append("folder", "banners/mobile/ar");
          uploadPromises.push(
            uploadFile(formData).then((res) => {
              payload.mobileImageUrlAr = res.data.path;
            }),
          );
        }

        await Promise.all(uploadPromises);

        await createBannerAPI(payload);
        showToast(
          t("banners.add_success", "Banner created successfully"),
          "success",
        );
        navigate("/banners");
      } catch (error: any) {
        showToast(
          error?.response?.data?.message || "Failed to create banner",
          "error",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50 flex flex-col gap-1">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            {t("banners.add_new", "Add New Banner")}
          </h3>
          <p className="text-[13px] font-medium text-slate-500">
            {t(
              "banners.add_desc",
              "Upload graphics and link destinations for a new banner.",
            )}
          </p>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="p-6 flex flex-col gap-8">
            {/* Left Column: Basic Details */}
            <div className="flex flex-col gap-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                {t("banners.sections.details", "Banner Details")}
              </h3>

              <div className="flex flex-col gap-5">
                <TextInput
                  id="title"
                  name="title"
                  label={t("banners.fields.title", "English Title")}
                  placeholder="e.g. Summer Sale"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={
                    formik.touched.title
                      ? (formik.errors.title as string)
                      : undefined
                  }
                />

                <TextInput
                  id="titleAr"
                  name="titleAr"
                  label={t("banners.fields.titleAr", "Arabic Title")}
                  placeholder="e.g. تخفيضات الصيف"
                  value={formik.values.titleAr}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.titleAr && Boolean(formik.errors.titleAr)
                  }
                  helperText={
                    formik.touched.titleAr
                      ? (formik.errors.titleAr as string)
                      : undefined
                  }
                />

                <TextInput
                  id="displayOrder"
                  name="displayOrder"
                  type="number"
                  label={t("banners.fields.displayOrder", "Display Order")}
                  placeholder="e.g. 1"
                  value={formik.values.displayOrder}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.displayOrder &&
                    Boolean(formik.errors.displayOrder)
                  }
                  helperText={
                    formik.touched.displayOrder
                      ? (formik.errors.displayOrder as string)
                      : undefined
                  }
                />

                <SingleSelect
                  id="linkUrlType"
                  label={t("banners.fields.linkUrlType", "Link Type")}
                  value={formik.values.linkUrlType}
                  onChange={(val) => formik.setFieldValue("linkUrlType", val)}
                  onBlur={() => formik.setFieldTouched("linkUrlType", true)}
                  options={BANNER_LINK_TYPES.map((type) => ({
                    label: type.charAt(0).toUpperCase() + type.slice(1),
                    value: type,
                  }))}
                  error={
                    formik.touched.linkUrlType &&
                    Boolean(formik.errors.linkUrlType)
                  }
                  helperText={
                    formik.touched.linkUrlType
                      ? (formik.errors.linkUrlType as string)
                      : undefined
                  }
                  placeholder="Select Link Type"
                />

                {formik.values.linkUrlType &&
                  formik.values.linkUrlType !== "none" && (
                    <TextInput
                      id="linkUrlId"
                      name="linkUrlId"
                      label={t("banners.fields.linkUrlId", "Target ID / URL")}
                      placeholder="e.g. ID of product or category"
                      value={formik.values.linkUrlId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      required
                      error={
                        formik.touched.linkUrlId &&
                        Boolean(formik.errors.linkUrlId)
                      }
                      helperText={
                        formik.touched.linkUrlId
                          ? (formik.errors.linkUrlId as string)
                          : undefined
                      }
                    />
                  )}
              </div>
            </div>

            {/* Right Column: Media */}
            <div className="flex flex-col gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                {t("banners.sections.media", "Media Graphics")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ImageUploader
                  label={t("banners.fields.imageUrl", "Web Image (EN)")}
                  value={formik.values.imageUrl}
                  onChange={(file) => formik.setFieldValue("imageUrl", file)}
                  error={
                    formik.touched.imageUrl
                      ? (formik.errors.imageUrl as string)
                      : undefined
                  }
                  heightClass="h-32"
                  shape="rectangle"
                  disabled={isSubmitting}
                  required
                />

                <ImageUploader
                  label={t("banners.fields.imageUrlAr", "Web Image (AR)")}
                  value={formik.values.imageUrlAr}
                  onChange={(file) => formik.setFieldValue("imageUrlAr", file)}
                  error={
                    formik.touched.imageUrlAr
                      ? (formik.errors.imageUrlAr as string)
                      : undefined
                  }
                  heightClass="h-32"
                  shape="rectangle"
                  disabled={isSubmitting}
                />

                <ImageUploader
                  label={t(
                    "banners.fields.mobileImageUrl",
                    "Mobile Image (EN)",
                  )}
                  value={formik.values.mobileImageUrl}
                  onChange={(file) =>
                    formik.setFieldValue("mobileImageUrl", file)
                  }
                  error={
                    formik.touched.mobileImageUrl
                      ? (formik.errors.mobileImageUrl as string)
                      : undefined
                  }
                  heightClass="h-32"
                  shape="rectangle"
                  disabled={isSubmitting}
                />

                <ImageUploader
                  label={t(
                    "banners.fields.mobileImageUrlAr",
                    "Mobile Image (AR)",
                  )}
                  value={formik.values.mobileImageUrlAr}
                  onChange={(file) =>
                    formik.setFieldValue("mobileImageUrlAr", file)
                  }
                  error={
                    formik.touched.mobileImageUrlAr
                      ? (formik.errors.mobileImageUrlAr as string)
                      : undefined
                  }
                  heightClass="h-32"
                  shape="rectangle"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border-t border-slate-100 p-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={() => navigate("/banners")}
              disabled={isSubmitting}
              variant="outlined"
              color="primary"
              sx={{
                padding: "4px 12px",
                width: "120px",
                height: "40px",
                fontSize: "13px",
                borderRadius: "8px",
                fontWeight: "600",
                textTransform: "none",
                borderColor: "#cbd5e1",
                color: "#475569",
              }}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              color="primary"
              sx={{
                padding: "4px 12px",
                width: "120px",
                height: "40px",
                fontSize: "13px",
                borderRadius: "8px",
                fontWeight: "600",
                textTransform: "none",
                boxShadow: "0 4px 14px 0 rgba(107, 47, 217, 0.3)",
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("common.saving", "Saving...")}</span>
                </div>
              ) : (
                t("common.save", "Save")
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBanner;
