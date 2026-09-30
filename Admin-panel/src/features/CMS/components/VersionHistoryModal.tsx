import React from "react";
import { Modal } from "../../../components/common/modal/Modal";
import { History, RotateCcw, Clock } from "lucide-react";
import type { CmsVersion } from "../../../services/cmsApi";

interface VersionHistoryModalProps {
  open: boolean;
  onClose: () => void;
  versions: CmsVersion[];
  onRestore: (versionId: string) => void;
  isLoading?: boolean;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  open,
  onClose,
  versions,
  onRestore,
  isLoading = false,
}) => {
  return (
    <Modal
      open={open}
      setOpen={(val) => !val && onClose()}
      title="Revision & Version History"
      maxWidth="lg"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select any previously saved version to restore the page title, HTML content, and SEO metadata.
        </p>

        {isLoading ? (
          <div className="space-y-3 p-4">
            <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
        ) : versions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No version history found
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Versions are created automatically whenever page content is published or saved.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 sidebar-scroll">
            {versions.map((ver, idx) => (
              <div
                key={ver.id}
                className="p-4 bg-white dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between gap-4 transition-all hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    v{ver.version}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-black">
                        {ver.title}
                      </h4>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold rounded-md uppercase">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(ver.createdAt).toLocaleString()}
                      </span>
                      <span className="uppercase font-semibold">[{ver.languageCode}]</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRestore(ver.id)}
                  disabled={idx === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    idx === 0
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90 active:scale-95 shadow-xs"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
