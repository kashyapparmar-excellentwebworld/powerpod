import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import { Loader2 } from "lucide-react";
import { TextInput } from "../../../components/common/TextInput";
import { Button } from "../../../components/common/Button";
import { ImageUploader } from "../../../components/common/ImageUploader";
import useToast from "../../../hooks/useToast";
import { uploadFile } from "../../../services/uploadApi";
import { updateCategoryAPI, getCategoryByIdAPI } from "../api/categoryApi";
import { categoryValidationSchema } from "./AddCategory";

const EditCategory: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      name: "",
      nameAr: "",
      commission: 0,
      iconUrl: null as File | string | null,
      imageUrl: null as File | string | null,
    },
    validationSchema: categoryValidationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        let finalIconUrl = values.iconUrl;
        let finalImageUrl = values.imageUrl;

        // Upload Icon if it's a new File
        if (values.iconUrl instanceof File) {
          const iconData = new FormData();
          iconData.append("file", values.iconUrl);
          iconData.append("folder", "categories/icons");
          const res = await uploadFile(iconData);
          finalIconUrl = res?.data?.path || res?.path || "";
        }

        // Upload Image if it's a new File
        if (values.imageUrl instanceof File) {
          const imgData = new FormData();
          imgData.append("file", values.imageUrl);
          imgData.append("folder", "categories/images");
          const res = await uploadFile(imgData);
          finalImageUrl = res?.data?.path || res?.path || "";
        }

        const payload = {
          name: values.name,
          nameAr: values.nameAr,
          commission: Number(values.commission),
          iconUrl: finalIconUrl,
          imageUrl: finalImageUrl,
        };

        // Call update category API here
        await updateCategoryAPI(id as string, payload);
        showToast(
          t("categories.edit_success", "Category updated successfully"),
          "success",
        );
        navigate("/categories");
      } catch (error: any) {
        showToast(
          error?.response?.data?.message || "Failed to update category",
          "error",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    // Mock API fetch
    const fetchCategory = async () => {
      setIsLoading(true);
      try {
        const res = await getCategoryByIdAPI(id as string);
        const data = res?.data || res;

        formik.setValues({
          name: data?.name || "",
          nameAr: data?.nameAr || "",
          commission: Number(data?.commission || 0),
          iconUrl: data?.iconUrl || null,
          imageUrl: data?.imageUrl || null,
        });
      } catch (error) {
        showToast("Error loading category", "error");
        navigate("/categories");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10 pt-2">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
                {t("categories.sections.general", "General Information")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput
                  id="name"
                  name="name"
                  label={t("categories.fields.name", "Name (English)")}
                  placeholder="e.g. Electronics"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={
                    formik.touched.name
                      ? (formik.errors.name as string)
                      : undefined
                  }
                />

                <TextInput
                  id="nameAr"
                  name="nameAr"
                  label={t("categories.fields.nameAr", "Name (Arabic)")}
                  placeholder="مثال: إلكترونيات"
                  value={formik.values.nameAr}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  error={formik.touched.nameAr && Boolean(formik.errors.nameAr)}
                  helperText={
                    formik.touched.nameAr
                      ? (formik.errors.nameAr as string)
                      : undefined
                  }
                  dir="auto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput
                  id="commission"
                  name="commission"
                  type="number"
                  label={t("categories.fields.commission", "Commission (%)")}
                  placeholder="e.g. 5"
                  value={formik.values.commission}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  error={
                    formik.touched.commission &&
                    Boolean(formik.errors.commission)
                  }
                  helperText={
                    formik.touched.commission
                      ? (formik.errors.commission as string)
                      : undefined
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-5 xl:col-span-4 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
                {t("categories.sections.media", "Media")}
              </h3>

              <div className="flex flex-col gap-8">
                <ImageUploader
                  label={t("categories.fields.iconUrl", "Category Icon")}
                  value={formik.values.iconUrl}
                  onChange={(file) => formik.setFieldValue("iconUrl", file)}
                  error={
                    formik.touched.iconUrl
                      ? (formik.errors.iconUrl as string)
                      : undefined
                  }
                  tooltipText="Upload a small icon (e.g. 100x100px). Uploads to categories/icons for optimal display."
                  heightClass="h-28"
                  shape="square"
                  disabled={isSubmitting}
                  required
                />

                <ImageUploader
                  label={t(
                    "categories.fields.imageUrl",
                    "Category Banner Image",
                  )}
                  value={formik.values.imageUrl}
                  onChange={(file) => formik.setFieldValue("imageUrl", file)}
                  error={
                    formik.touched.imageUrl
                      ? (formik.errors.imageUrl as string)
                      : undefined
                  }
                  tooltipText="Upload a banner image (e.g. 400x300px). Uploads to categories/images."
                  heightClass="h-36 md:h-44"
                  shape="rectangle"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border-t border-slate-100 p-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={() => navigate("/categories")}
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
                t("common.save_changes", "Save Changes")
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
