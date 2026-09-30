import * as Yup from "yup";
import i18n from "../../i18n";

export const profileValidationSchema = Yup.object().shape({
  fullName: Yup.string()
    .trim()
    .required(() => i18n.t("auth_profile.validation.full_name_required", "Full Name is required")),
  email: Yup.string()
    .trim()
    .email(() => i18n.t("auth_profile.validation.invalid_email", "Enter a valid email address"))
    .required(() => i18n.t("auth_profile.validation.email_required", "Email is required")),
});

export const changePasswordValidationSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required(() => i18n.t("auth_profile.validation.current_password_required", "Current Password is required"))
    .test(
      "not-only-spaces",
      () => i18n.t("auth_profile.validation.password_not_only_spaces", "Password cannot be only spaces"),
      (value) => !value || value.trim().length > 0
    )
    .min(6, () => i18n.t("validation.password_min_length", "Password must be at least 6 characters"))
    .matches(/^\S+$/, {
      message: () => i18n.t("auth_profile.validation.password_no_space", "Password cannot contain spaces"),
      excludeEmptyString: true,
    }),
  newPassword: Yup.string()
    .required(() => i18n.t("auth_profile.validation.new_password_required", "New Password is required"))
    .test(
      "not-only-spaces",
      () => i18n.t("auth_profile.validation.password_not_only_spaces", "Password cannot be only spaces"),
      (value) => !value || value.trim().length > 0
    )
    .min(6, () => i18n.t("validation.password_min_length", "Password must be at least 6 characters"))
    .matches(/^\S+$/, {
      message: () => i18n.t("auth_profile.validation.password_no_space", "Password cannot contain spaces"),
      excludeEmptyString: true,
    })
    .test(
      "not-same-as-current",
      () => i18n.t("auth_profile.validation.password_same", "New password cannot be the same as current password"),
      function (value) {
        const { currentPassword } = this.parent;
        const currentPasswordStr = typeof currentPassword === "string" ? currentPassword.trim() : "";
        const newPasswordStr = typeof value === "string" ? value.trim() : "";
        if (!newPasswordStr || !currentPasswordStr) return true;
        return newPasswordStr !== currentPasswordStr;
      }
    ),
  confirmPassword: Yup.string()
    .required(() => i18n.t("auth_profile.validation.confirm_password_required", "Confirm Password is required"))
    .test(
      "not-only-spaces",
      () => i18n.t("auth_profile.validation.password_not_only_spaces", "Password cannot be only spaces"),
      (value) => !value || value.trim().length > 0
    )
    .matches(/^\S+$/, {
      message: () => i18n.t("auth_profile.validation.password_no_space", "Password cannot contain spaces"),
      excludeEmptyString: true,
    })
    .test(
      "must-match-new",
      () => i18n.t("auth_profile.validation.passwords_do_not_match", "Passwords do not match"),
      function (value) {
        const { newPassword } = this.parent;
        const newPasswordStr = typeof newPassword === "string" ? newPassword.trim() : "";
        const confirmPasswordStr = typeof value === "string" ? value.trim() : "";
        if (!confirmPasswordStr || !newPasswordStr) return true;
        return confirmPasswordStr === newPasswordStr;
      }
    ),
});
