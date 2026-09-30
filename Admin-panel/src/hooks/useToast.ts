import { toast } from "react-hot-toast";

export type ToastType = "error" | "warning" | "success" | "info";

export const showToast = (message: string, type: ToastType = "success") => {
    const toastOptions = {
      id: message,
      position: "bottom-right" as const,
      duration: 2000,
      style: {
        borderRadius: "15px",
        fontFamily: "Cairo, sans-serif",
        fontWeight: 500,
      },
    };

    switch (type) {
      case "error":
        toast.error(message, toastOptions);
        break;
      case "success":
        toast.success(message, toastOptions);
        break;
      case "warning":
        toast(message, {
          ...toastOptions,
          icon: undefined,
        });
        break;
      case "info":
        toast(message, {
          ...toastOptions,
          icon: undefined,
        });
        break;
      default:
        toast(message, toastOptions);
    }
  };

const useToast = () => {
  return { showToast };
};

export default useToast;