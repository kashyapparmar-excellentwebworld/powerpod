import { Download } from "lucide-react";
import { Button, CircularProgress } from "@mui/material";
import { useExportCsv } from "../../../hooks/useExportCsv";

type CsvHeader<T> = {
  label: string;
  key: keyof T;
};

type ExportCsvButtonProps<T> = {
  // Client side export props
  data?: T[];
  headers?: CsvHeader<T>[];

  // Server side export props
  url?: string;
  params?: Record<string, any>;

  // Common props
  fileName?: string;
  buttonText?: string;
  variant?: "text" | "outlined" | "contained";
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
  width?: string | number;
  height?: string | number;
  fontSize?: string | number;
  borderRadius?: string | number;
  gap?: string | number;
  icon?: React.ReactNode;
  className?: string;
  sx?: object;
};

const convertToCSV = <T,>(data: T[], headers: CsvHeader<T>[]): string => {
  if (!data || data.length === 0) return "";

  const headerRow = headers.map((h) => `"${h.label}"`).join(",");

  const rows = data.map((item) =>
    headers.map((h) => `"${String(item[h.key] ?? "")}"`).join(","),
  );

  return [headerRow, ...rows].join("\n");
};

const downloadCSV = (csv: string, fileName: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ExportCsvButton = <T,>({
  data,
  headers,
  url,
  params,
  fileName = "export",
  buttonText = "Export CSV",
  variant = "contained",
  color = "primary",
  width = "auto",
  height = "42px",
  fontSize = "14px",
  borderRadius = "12px",
  gap = "8px",
  icon,
  className = "text-nowrap",
  sx,
}: ExportCsvButtonProps<T>) => {
  const { exportCsv, loading } = useExportCsv();

  const handleExport = async () => {
    if (url) {
      await exportCsv({
        url,
        filename: `${fileName}.csv`,
        params,
      });
    } else {
      if (!data || !data.length || !headers) return;
      const csv = convertToCSV(data, headers);
      downloadCSV(csv, fileName);
    }
  };

  const isButtonDisabled = loading || (!url && (!data || data.length === 0));

  return (
    <Button
      variant={variant}
      color={color}
      disabled={isButtonDisabled}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : (icon || <Download className="w-4 h-4" />)}
      onClick={handleExport}
      sx={{ width, height, gap, fontSize, borderRadius, ...sx }}
      className={className}
    >
      {loading ? "Exporting..." : buttonText}
    </Button>
  );
};

export default ExportCsvButton;
