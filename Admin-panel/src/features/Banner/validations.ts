import * as Yup from "yup";

export const BANNER_LINK_TYPES = ["product", "category", "external", "none"] as const;

export const bannerValidationSchema = (t: any) =>
  Yup.object({
    title: Yup.string()
      .trim()
      .max(255, t("validation.max_255", "Must be at most 255 characters"))
      .required(t("validation.name_required", "Title is required")),
    titleAr: Yup.string()
      .trim()
      .max(255, t("validation.max_255", "Must be at most 255 characters"))
      .nullable(),
    imageUrl: Yup.string()
      .required(t("validation.image_required", "Image is required")),
    imageUrlAr: Yup.string().nullable(),
    mobileImageUrl: Yup.string().nullable(),
    mobileImageUrlAr: Yup.string().nullable(),
    linkUrlType: Yup.string()
      .oneOf([...BANNER_LINK_TYPES])
      .nullable(),
    linkUrlId: Yup.string().when("linkUrlType", {
      is: (val: string) => ["product", "category", "external"].includes(val),
      then: (schema) =>
        schema.required(t("validation.link_required", "Link URL/ID is required for this type")),
      otherwise: (schema) => schema.nullable(),
    }),
    displayOrder: Yup.number()
      .integer(t("validation.integer", "Must be an integer"))
      .min(0, t("validation.display_order_invalid", "Display order must be a non-negative integer"))
      .default(0),
    isActive: Yup.boolean().default(true),
  });
