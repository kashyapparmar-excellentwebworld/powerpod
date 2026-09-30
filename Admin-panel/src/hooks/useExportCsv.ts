import { useState } from "react";
import axiosInstance from "../utils/axios";
import useToast from "./useToast";

interface ExportCsvParams {
  url: string;
  filename?: string;
  params?: Record<string, any>;
}

export const useExportCsv = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const exportCsv = async ({ url, filename = "export.csv", params }: ExportCsvParams) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(url, {
        params,
        responseType: "blob",
      });

      // Handle server-side responses that might not be files (e.g. error JSONs)
      const contentType = response.headers["content-type"];
      if (typeof contentType === "string" && contentType.includes("application/json")) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result as string);
            showToast(data.message || "Failed to export CSV", "error");
          } catch {
            showToast("Failed to export CSV", "error");
          }
        };
        reader.readAsText(response.data);
        return;
      }

      if (!response.data) {
        throw new Error("No data returned");
      }

      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      showToast("CSV exported successfully", "success");
    } catch (error: any) {
      console.error("Export CSV failed", error);
      showToast(
        error?.response?.data?.message || error?.message || "Failed to export CSV",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return { exportCsv, loading };
};
