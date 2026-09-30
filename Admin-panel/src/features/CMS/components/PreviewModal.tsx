import React, { useState } from "react";
import { Modal } from "../../../components/common/modal/Modal";
import { Globe, Eye, Code2, Copy, ExternalLink, Check, Server } from "lucide-react";
import toast from "react-hot-toast";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  slug: string;
  language: string;
  contentHtml: string;
  metaTitle?: string;
  metaDescription?: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  title,
  slug,
  language,
  contentHtml,
  metaTitle,
  metaDescription,
}) => {
  const [activeTab, setActiveTab] = useState<"rendered" | "source">("rendered");
  const [copied, setCopied] = useState(false);

  const displaySlug = slug && slug.trim().length > 0 ? slug : "page-slug";
  const displayTitle = title && title.trim().length > 0 && title !== "Untitled Page" ? title : displaySlug;
  const langCode = (language || "en").toLowerCase();

  const frontendUrl = `http://localhost:5173/cms/${displaySlug}?lang=${langCode}`;
  const backendApiUrl = `http://localhost:8080/api/v1/cms/${displaySlug}?lang=${langCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(frontendUrl);
    setCopied(true);
    toast.success("Frontend route copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      open={open}
      setOpen={(val) => !val && onClose()}
      title={`Live Preview & Integration: ${displayTitle}`}
      maxWidth="lg"
    >
      <div className="space-y-4 p-4 bg-surface-light text-black transition-colors">
        {/* Frontend & Backend Integration Info Box */}
        <div className="p-4 bg-surface text-black rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Globe className="w-4 h-4 text-primary" />
              <span>Frontend Web / Mobile App Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-light hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Route"}</span>
              </button>
              <a
                href={frontendUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Route</span>
              </a>
            </div>
          </div>

          {/* Integration Description Text */}
          <div className="space-y-1.5 text-xs">
            <p className="text-gray-6 font-semibold">
              In your buyer/supplier web application (<code className="text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">http://localhost:5173</code>):
            </p>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 font-mono text-emerald-600 dark:text-emerald-400 overflow-hidden">
              <span className="text-slate-500 font-bold shrink-0">Route:</span>
              <span className="truncate min-w-0 text-xs font-mono">{frontendUrl}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 font-mono text-sky-600 dark:text-sky-400 overflow-hidden">
              <Server className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="text-slate-500 font-bold shrink-0">API:</span>
              <span className="truncate min-w-0 text-xs font-mono">GET {backendApiUrl}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              Your frontend simply fetches <code className="text-sky-600 dark:text-sky-300 font-mono">GET /api/v1/cms/{displaySlug}?lang={langCode}</code> and renders the returned <code className="text-emerald-600 dark:text-emerald-300 font-mono">contentHtml</code> directly on the page.
            </p>
          </div>
        </div>

        {/* View Mode Toggle Bar */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span>Page Preview ({langCode.toUpperCase()})</span>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("rendered")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                activeTab === "rendered"
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Rendered HTML</span>
            </button>
            <button
              onClick={() => setActiveTab("source")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                activeTab === "source"
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw HTML Source</span>
            </button>
          </div>
        </div>

        {/* SEO Tags Card Summary */}
        {(metaTitle || metaDescription) && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Google SEO Preview
            </span>
            <p className="text-sm font-bold text-blue-700 dark:text-blue-300 truncate">
              {metaTitle || displayTitle}
            </p>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 line-clamp-2">
              {metaDescription || "No meta description defined."}
            </p>
          </div>
        )}

        {/* Content Render Box */}
        <div className="p-6 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700/60 rounded-2xl min-h-[300px] max-h-[450px] overflow-y-auto sidebar-scroll">
          {activeTab === "rendered" ? (
            contentHtml && contentHtml.trim().length > 0 ? (
              <div
                className="prose dark:prose-invert max-w-none text-black"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[220px] text-center space-y-2">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No content HTML available for language ({langCode.toUpperCase()}).</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Add HTML content in the editor to view live rendering.</p>
              </div>
            )
          ) : (
            <pre className="p-4 bg-slate-900 text-emerald-400 dark:bg-slate-950 dark:text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap">
              {contentHtml || "<!-- Empty HTML -->"}
            </pre>
          )}
        </div>
      </div>
    </Modal>
  );
};
