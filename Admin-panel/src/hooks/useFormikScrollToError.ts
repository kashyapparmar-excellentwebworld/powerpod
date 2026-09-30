import { useEffect } from "react";
import { type FormikProps } from "formik";

/**
 * A hook that automatically scrolls to the first field with a validation error
 * when a Formik form is submitted and found to be invalid.
 *
 * @param formik - The formik instance (FormikProps)
 */
export const useFormikScrollToError = (formik: FormikProps<any>) => {
  useEffect(() => {
    // We only want to scroll if an attempt to submit was made and the form is invalid
    if (formik.submitCount > 0 && !formik.isValid) {
      const getFirstErrorKey = (errors: any, prefix = ""): string | null => {
        const keys = Object.keys(errors);
        if (keys.length === 0) return null;

        const firstKey = keys[0];
        const value = errors[firstKey];

        if (typeof value === "object" && value !== null) {
          // Handle arrays by finding the first index with actual errors
          if (Array.isArray(value)) {
            const firstIndex = value.findIndex(
              (item) =>
                item !== undefined &&
                item !== null &&
                (typeof item === "string" || Object.keys(item).length > 0),
            );
            if (firstIndex === -1) return null;
            return getFirstErrorKey(
              value[firstIndex],
              prefix
                ? `${prefix}.${firstKey}.${firstIndex}`
                : `${firstKey}.${firstIndex}`,
            );
          }
          // Handle objects
          return getFirstErrorKey(
            value,
            prefix ? `${prefix}.${firstKey}` : firstKey,
          );
        }

        // If it's a string (error message), we've found our target key
        return prefix ? `${prefix}.${firstKey}` : firstKey;
      };

      const firstErrorKey = getFirstErrorKey(formik.errors);

      if (firstErrorKey) {
        // Try to find the element by name attribute
        let element = document.getElementsByName(firstErrorKey)[0];

        // If not found by name, try to find by ID (sometimes used as fallback)
        if (!element) {
          element = document.getElementById(firstErrorKey) as any;
        }

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });

          // Optionally focus the element
          if (typeof (element as any).focus === "function") {
            (element as any).focus({ preventScroll: true });
          }
        }
      }
    }
  }, [formik.submitCount, formik.isValid]);
};

export default useFormikScrollToError;
