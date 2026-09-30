import * as Yup from "yup";
import i18n from "../../i18n";

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .matches(/^\S*$/, () => i18n.t("validation.no_space", "Space is not allowed"))
    .email(() => i18n.t("validation.invalid_email", "Enter a valid email address"))
    .required(() => i18n.t("validation.email_required", "Email is required")),
  password: Yup.string()
    .test(
      "not-only-spaces",
      () => i18n.t("validation.password_not_only_spaces", "Password cannot contain only spaces"),
      (value) => {
        if (!value) return true;
        return value.trim().length > 0;
      }
    )
    .min(6, () => i18n.t("validation.password_min_length", "Password must be at least 6 characters"))
    .required(() => i18n.t("validation.password_required", "Password is required")),
});

export const forgotPasswordValidationSchema = Yup.object({
  email: Yup.string()
    .matches(/^\S*$/, () => i18n.t("validation.no_space", "Space is not allowed"))
    .email(() => i18n.t("validation.invalid_email", "Enter a valid email address"))
    .required(() => i18n.t("validation.email_required", "Email is required")),
});

export const resetPasswordValidationSchema = Yup.object({
  newPassword: Yup.string()
    .test(
      "not-only-spaces",
      () => i18n.t("validation.password_not_only_spaces", "Password cannot contain only spaces"),
      (value) => {
        if (!value) return true;
        return value.trim().length > 0;
      }
    )
    .min(6, () => i18n.t("validation.password_min_length", "Password must be at least 6 characters"))
    .required(() => i18n.t("validation.new_password_required", "New password is required")),
  confirmPassword: Yup.string()
    .test(
      "not-only-spaces",
      () => i18n.t("validation.password_not_only_spaces", "Password cannot contain only spaces"),
      (value) => {
        if (!value) return true;
        return value.trim().length > 0;
      }
    )
    .oneOf([Yup.ref("newPassword")], () => i18n.t("validation.passwords_do_not_match", "Passwords do not match"))
    .required(() => i18n.t("validation.confirm_password_required", "Confirm password is required")),
});
