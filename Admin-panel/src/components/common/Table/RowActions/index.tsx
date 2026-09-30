import {
  Download,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Pencil,
  XCircle,
  Trash2,
  Globe,
  Eye,
} from "lucide-react";
import { Switch } from "../../Switch";

type RowActionsProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onForceEnd?: () => void;
  isActive?: boolean;
  onToggleStatus?: (checked: boolean) => void;
  onDownload?: () => void;
  onPreview?: () => void;
};

export function RowActions({
  onView,
  onEdit,
  onDelete,
  onRestore,
  onApprove,
  onReject,
  onForceEnd,
  isActive,
  onToggleStatus,
  onDownload,
  onPreview,
}: RowActionsProps) {
  return (
    <div className="flex items-center gap-3">
      {onToggleStatus && (
        <div
          className="flex items-center pr-1"
          title={isActive ? "Active" : "Inactive"}
        >
          <Switch checked={!!isActive} onChange={onToggleStatus} />
        </div>
      )}
      {onView && (
        <button
          type="button"
          className="w-9 h-9 rounded-lg bg-blue-50/50 hover:bg-blue-100 flex justify-center items-center text-primary transition-colors cursor-pointer border border-blue-100"
          onClick={onView}
          aria-label="View"
          title="View"
        >
          <Eye className="h-5 w-5 text-[#2b53c8]" />
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          className="h-9 w-9 cursor-pointer rounded-lg bg-[#EAF1FF] flex items-center justify-center hover:opacity-90 transition-all active:scale-95"
          onClick={onEdit}
          aria-label="Edit"
          title="Edit"
        >
          <Pencil className="h-4 text-[#2b53c8]" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className="w-9 h-9 rounded-lg bg-red-50/50 hover:bg-red-100 flex justify-center items-center transition-colors cursor-pointer border border-red-100"
          onClick={onDelete}
          aria-label="Delete"
          title="Delete"
        >
          <Trash2 className="h-5 w-5 text-[#E53935]" />
        </button>
      )}
      {onRestore && (
        <button
          type="button"
          className="h-9 w-9 cursor-pointer rounded-lg bg-[#E8F5E9] flex items-center justify-center hover:opacity-90 transition-all active:scale-95"
          onClick={onRestore}
          aria-label="Restore"
          title="Restore"
        >
          <RotateCcw className="h-5 w-5 text-[#2E7D32]" />
        </button>
      )}
      {onApprove && (
        <button
          type="button"
          className="h-9 w-9 cursor-pointer rounded-lg bg-green-50/50 flex items-center justify-center hover:bg-green-100/50 transition-all active:scale-95 border border-green-100"
          onClick={onApprove}
          aria-label="Approve"
          title="Approve"
        >
          <CheckCircle className="h-5 w-5 text-green-600" />
        </button>
      )}
      {onReject && (
        <button
          type="button"
          className="h-9 w-9 cursor-pointer rounded-lg bg-red-50/50 flex items-center justify-center hover:bg-red-100/50 transition-all active:scale-95 border border-red-100"
          onClick={onReject}
          aria-label="Reject"
          title="Reject"
        >
          <XCircle className="h-5 w-5 text-red-600" />
        </button>
      )}
      {onForceEnd && (
        <button
          type="button"
          className="h-9 w-9 cursor-pointer rounded-lg bg-orange-50/50 flex items-center justify-center hover:bg-orange-100/50 transition-all active:scale-95 border border-orange-100"
          onClick={onForceEnd}
          aria-label="Force End"
          title="Force End"
        >
          <AlertTriangle className="h-5 w-5 text-orange-600" />
        </button>
      )}
      {onPreview && (
        <button
          type="button"
          className="w-9 h-9 rounded-lg bg-emerald-50/50 hover:bg-emerald-100 flex justify-center items-center transition-colors cursor-pointer border border-emerald-100"
          onClick={onPreview}
          aria-label="Preview"
          title="Preview"
        >
          <Globe className="h-5 w-5 text-emerald-600" />
        </button>
      )}
      {onDownload && (
        <button
          type="button"
          className="h-9 w-9 cursor-pointer rounded-lg bg-indigo-50/50 flex items-center justify-center hover:bg-indigo-100/50 transition-all active:scale-95 border border-indigo-100"
          onClick={onDownload}
          aria-label="Download"
          title="Download"
        >
          <Download className="h-5 w-5 text-indigo-600" />
        </button>
      )}
    </div>
  );
}
