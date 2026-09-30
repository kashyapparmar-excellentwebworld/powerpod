import React, { useState, useCallback, useEffect } from "react";
import { UploadCloud, X, Image as ImageIcon, Info } from "lucide-react";
import { Tooltip } from "@mui/material";

export interface ImageUploaderProps {
  label: string;
  value?: string | File | null;
  onChange: (file: File | null) => void;
  onClear?: () => void;
  error?: string;
  helperText?: string;
  tooltipText?: string;
  heightClass?: string;
  disabled?: boolean;
  required?: boolean; 
  shape?: "square" | "rectangle" | "auto";
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  onClear,
  error,
  helperText,
  tooltipText,
  heightClass = "h-36 md:h-44",
  disabled = false,
  required = false,
  shape = "auto",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    if (typeof value === "string") {
      setPreview(value);
    } else if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [value]);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        onChange(file);
      }
    },
    [onChange, disabled],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onChange(file);
    }
    // Reset input value so the same file can be selected again if cleared
    e.target.value = "";
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (onClear) onClear();
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center gap-1.5">
        <label className="text-[13px] font-bold text-slate-700">{label}</label>
        {required && <span className="text-red-500 font-bold">*</span>}
        {tooltipText && (
          <Tooltip title={tooltipText} placement="top" arrow>
            <Info className="w-4 h-4 text-slate-400 cursor-help" />
          </Tooltip>
        )}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 
          ${shape === "square" ? "w-36 h-36 aspect-square" : shape === "rectangle" ? `w-full ${heightClass} aspect-21/9` : `w-full ${heightClass}`}
          ${disabled ? "bg-slate-50 border-slate-200 cursor-not-allowed opacity-70" : "cursor-pointer"} 
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : error
                ? "border-rose-400 bg-rose-50/30"
                : "border-slate-300 hover:border-primary hover:bg-slate-50"
          }
          ${preview ? "p-2" : "p-6"}`}
        onClick={() => {
          if (!disabled && !preview) {
            document.getElementById(`file-upload-${label}`)?.click();
          }
        }}
      >
        <input
          id={`file-upload-${label}`}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
        />

        {preview ? (
          <div className="relative w-full h-full rounded-xl overflow-hidden group">
            <img
              src={preview}
              alt={label}
              className={`w-full h-full ${shape === "square" ? "object-contain p-2" : "object-cover"}`}
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById(`file-upload-${label}`)?.click()
                  }
                  className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
                  title="Change Image"
                >
                  <UploadCloud className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 bg-rose-500/80 hover:bg-rose-500 rounded-full text-white backdrop-blur-sm transition-colors"
                  title="Remove Image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-2 pointer-events-none">
            <div
              className={`p-3 rounded-full ${isDragging ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"}`}
            >
              {isDragging ? (
                <UploadCloud className="w-6 h-6" />
              ) : (
                <ImageIcon className="w-6 h-6" />
              )}
            </div>
            <div className="px-2">
              {shape === "square" ? (
                <p className="text-xs font-semibold text-slate-700 leading-tight mt-1">
                  <span className="text-primary">Upload</span>
                </p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-700">
                    <span className="text-primary">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    SVG, PNG, JPG or GIF (max. 5MB)
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p
          className={`text-[11px] font-medium mt-1 ${error ? "text-rose-500" : "text-slate-500"}`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};
