import React, { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import {
  BookOpen,
  Plus,
  UploadCloud,
  Layers,
  Trash2,
  Loader2,
  Eye,
  FileText,
  Search,
} from "lucide-react";
import { Modal } from "../../../components/common/modal/Modal";
import { DeleteConfirmModal } from "../../../components/common/modal/DeleteConfirmModal";
import { TaskProgressModal } from "../../../components/common/progress/TaskProgressModal";
import { guidanceApi, type GuidanceDocumentItem } from "../../../services/guidanceApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useThemeCustomizer } from "../../../context/ThemeCustomizerContext";

export interface DocumentDetails {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  createdAt: string;
  chunks: Array<{ id: string; chunkIndex: number; content: string }>;
}

export const GuidanceManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { primaryColor } = useThemeCustomizer();
  const [documents, setDocuments] = useState<GuidanceDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Progress Modal State
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>(undefined);

  // Document Viewer Modal State
  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedDocDetails, setSelectedDocDetails] = useState<DocumentDetails | null>(null);
  const [chunkSearchQuery, setChunkSearchQuery] = useState("");

  // Form Fields
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState("PDF");
  const [textContent, setTextContent] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileBase64, setFileBase64] = useState<string>("");

  // Delete Modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<GuidanceDocumentItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await guidanceApi.getDocuments();
      if (res.data) {
        setDocuments(res.data);
      }
    } catch {
      toast.error("Failed to load guidance documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleViewDocument = async (doc: GuidanceDocumentItem) => {
    setViewOpen(true);
    setViewLoading(true);
    setChunkSearchQuery("");
    try {
      const res = await guidanceApi.getDocumentDetails(doc.id);
      if (res.data) {
        setSelectedDocDetails(res.data);
      } else {
        setSelectedDocDetails({
          id: doc.id,
          title: doc.title,
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          status: doc.status,
          createdAt: doc.createdAt,
          chunks: [],
        });
      }
    } catch {
      toast.error("Failed to load document text content");
    } finally {
      setViewLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    
    // Auto fill title if empty
    const fileBasename = file.name.replace(/\.[^/.]+$/, "");
    if (!title) {
      setTitle(fileBasename.replace(/[-_]/g, " "));
    }

    // Auto detect file format
    const ext = file.name.split(".").pop()?.toUpperCase() || "TXT";
    if (["PDF", "DOCX", "XLSX", "TXT"].includes(ext)) {
      setFileType(ext);
    } else {
      setFileType("TXT");
    }

    // Read file via FileReader as DataURL to pass base64 to server parser
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const base64 = dataUrl.split(",")[1] || dataUrl;
        // Store base64 for upload — backend uses pdf-parse on this
        setFileBase64(base64);
        try {
          const res = await guidanceApi.parseFile({ fileBase64: base64, fileName: file.name });
          if (res?.data?.cleanText) {
            setTextContent(res.data.cleanText);
            toast.success(`Extracted clean text from ${file.name}!`);
          } else if (res?.data?.warning) {
            toast.error(res.data.warning);
          }
        } catch {
          toast.error("Failed to parse file text");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !textContent.trim()) {
      toast.error("Please enter a document title and policy content");
      return;
    }

    setUploading(true);
    try {
      const res = await guidanceApi.uploadDocument({
        title: title.trim(),
        textContent: textContent.trim(),
        fileName: selectedFileName || `${title.toLowerCase().replace(/\s+/g, "_")}.${fileType.toLowerCase()}`,
        fileType,
        fileBase64: fileBase64 || undefined,
      });

      if (res.data?.taskId) {
        setActiveTaskId(res.data.taskId);
        setProgressModalOpen(true);
      }

      toast.success(res.message || "Document uploaded & indexed successfully!");
      setUploadOpen(false);
      setTitle("");
      setTextContent("");
      setSelectedFileName("");
      setFileBase64("");
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    try {
      await guidanceApi.deleteDocument(docToDelete.id);
      toast.success("Document deleted successfully");
      setDeleteOpen(false);
      setDocToDelete(null);
      fetchDocuments();
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-surface-light p-6 rounded-2xl border border-gray-light shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-black tracking-tight">
              {t("guidance.title", "Guidance RAG Knowledge Base")}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {t("guidance.subtitle", "Upload guidance documents (PDF/DOCX/XLSX/TXT). Documents are auto-split into ~600-word vector chunks.")}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setTitle("");
            setTextContent("");
            setSelectedFileName("");
            setUploadOpen(true);
          }}
          style={{ backgroundColor: primaryColor }}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          <span>{t("guidance.upload_file", "Upload Guidance File")}</span>
        </button>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-surface-light rounded-2xl border border-gray-light">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
          <p className="text-xs text-slate-400">Loading guidance documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-surface-light rounded-2xl border border-gray-light space-y-3">
          <UploadCloud className="w-10 h-10 text-slate-300 mx-auto" />
          <p>No guidance documents uploaded yet. Upload a policy or manual to train the AI Knowledge Base.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-surface-light p-6 rounded-2xl border border-gray-light shadow-xs space-y-4 relative group overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-black text-xs font-mono uppercase shrink-0" style={{ color: primaryColor }}>
                    {doc.fileType || "PDF"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-extrabold text-black truncate" title={doc.title}>
                      {doc.title}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400 block truncate" title={doc.fileName}>
                      {doc.fileName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleViewDocument(doc)}
                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer"
                    title="View & Preview Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDocToDelete(doc);
                      setDeleteOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-light text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-500 truncate min-w-0">
                  <Layers className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span className="truncate">{doc.chunkCount} Vector Chunks (~600w)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 shrink-0">
                  PUBLISHED
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Guidance File Modal */}
      {uploadOpen && (
        <Modal
          open={uploadOpen}
          setOpen={setUploadOpen}
          title="Upload Guidance Document & Index Vectors"
          maxWidth="md"
        >
          <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Document Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Passenger Payment & Refund Resolution Policy 2026"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-black focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Upload Document File (PDF / DOCX / TXT / XLSX)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.xlsx,.txt"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Policy Document Text Content <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={7}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste authoritative policy text content here or select a file above..."
                className="w-full p-4 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-black focus:outline-none font-mono leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-light">
              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                style={{ backgroundColor: primaryColor }}
                className="flex items-center gap-2 px-5 py-2 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-all cursor-pointer hover:opacity-90"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                <span>Upload & Index Document</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteOpen && docToDelete && (
        <DeleteConfirmModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          isLoading={deleting}
          title="Delete Guidance Document"
          message={`Are you sure you want to delete "${docToDelete.title}"? All indexed vector chunks will be permanently removed.`}
        />
      )}

      {/* Document Content & Chunk Preview Modal */}
      {viewOpen && (
        <Modal
          open={viewOpen}
          setOpen={setViewOpen}
          title={selectedDocDetails ? selectedDocDetails.title : "Document Content Preview"}
          maxWidth="lg"
        >
          <div className="p-6 space-y-4 text-slate-900 dark:text-slate-100">
            {viewLoading ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
                <p className="text-xs text-slate-400 font-medium">Loading document vector content...</p>
              </div>
            ) : selectedDocDetails ? (
              <div className="space-y-4">
                {/* Meta Header */}
                <div className="p-4 bg-slate-50 dark:bg-[#1E2235] rounded-xl border border-gray-light flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl font-black font-mono uppercase">
                      {selectedDocDetails.fileType || "PDF"}
                    </div>
                    <div>
                      <div className="font-bold text-black">{selectedDocDetails.fileName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Uploaded on {new Date(selectedDocDetails.createdAt).toLocaleDateString()} • {(selectedDocDetails.fileSize / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-500 font-bold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      {selectedDocDetails.chunks?.length || 0} Chunks Indexed
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold">
                      {selectedDocDetails.status}
                    </span>
                  </div>
                </div>

                {/* Filter / Search within Chunks */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search inside this document text chunks..."
                    value={chunkSearchQuery}
                    onChange={(e) => setChunkSearchQuery(e.target.value)}
                    className="w-full ps-10 pe-4 py-2.5 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-semibold text-black focus:outline-none"
                  />
                </div>

                {/* Chunks List Feed */}
                <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
                  {selectedDocDetails.chunks?.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs italic">
                      No vector chunks found for this document.
                    </div>
                  ) : (
                    selectedDocDetails.chunks
                      ?.filter((c) => !chunkSearchQuery.trim() || c.content.toLowerCase().includes(chunkSearchQuery.toLowerCase()))
                      .map((chunk, idx) => (
                        <div
                          key={chunk.id || idx}
                          className="p-4 bg-slate-50 dark:bg-[#1E2235]/80 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 border-b border-slate-200/50 dark:border-slate-800/80 pb-2">
                            <span className="font-bold text-primary flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" /> Chunk #{chunk.chunkIndex + 1 || idx + 1}
                            </span>
                            <span>{chunk.content.length} characters</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                            {chunk.content}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </Modal>
      )}

      {/* Real-Time Operation Progress & Console Log Modal */}
      {progressModalOpen && (
        <TaskProgressModal
          open={progressModalOpen}
          onClose={() => setProgressModalOpen(false)}
          taskId={activeTaskId}
          taskTitle="RAG Vector Document Ingestion"
        />
      )}
    </div>
  );
};

export default GuidanceManagementPage;
