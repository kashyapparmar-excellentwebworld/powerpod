import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/common/modal/Modal";
import { Globe, Save, CheckCircle2 } from "lucide-react";
import { versionApi } from "../../../services/versionApi";
import type { AppVersion, AppPlatform, AppVersionTranslation } from "../../../services/versionApi";
import toast from "react-hot-toast";

interface VersionFormModalProps {
  open: boolean;
  onClose: () => void;
  version?: AppVersion | null;
  defaultPlatform?: AppPlatform;
  onSuccess: () => void;
}

const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English (EN)" },
  { code: "ar", name: "Arabic (العربية) (AR)" },
];

export const VersionFormModal: React.FC<VersionFormModalProps> = ({
  open,
  onClose,
  version,
  defaultPlatform = "ANDROID",
  onSuccess,
}) => {
  const isEdit = Boolean(version);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [platform, setPlatform] = useState<AppPlatform>(version?.platform || defaultPlatform);
  const [currentVersion, setCurrentVersion] = useState(version?.currentVersion || "1.0.0");
  const [minimumSupported, setMinimumSupported] = useState(version?.minimumSupported || "1.0.0");
  const [recommendedVersion, setRecommendedVersion] = useState(version?.recommendedVersion || "1.0.0");
  const [forceUpdate, setForceUpdate] = useState(version?.forceUpdate || false);
  const [maintenanceMode, setMaintenanceMode] = useState(version?.maintenanceMode || false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(version?.maintenanceMessage || "");
  const [rolloutPercentage, setRolloutPercentage] = useState(version?.rolloutPercentage ?? 100);
  const [playStoreUrl, setPlayStoreUrl] = useState(version?.playStoreUrl || "");
  const [appStoreUrl, setAppStoreUrl] = useState(version?.appStoreUrl || "");
  const [webUrl, setWebUrl] = useState(version?.webUrl || "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(version?.status || "DRAFT");
  const [releaseNotes, setReleaseNotes] = useState("");

  // Translations Map
  const [activeLang, setActiveLang] = useState<string>("en");
  const [translations, setTranslations] = useState<Record<string, AppVersionTranslation>>({
    en: {
      languageCode: "en",
      title: "Update Required",
      description: "A newer version of the application is available with security and performance updates.",
      updateButtonText: "Update Now",
      skipButtonText: "Later",
      maintenanceTitle: "Application Under Maintenance",
      maintenanceDescription: "We are performing scheduled system maintenance. Please check back soon.",
    },
    ar: {
      languageCode: "ar",
      title: "تحديث مطلوب",
      description: "يتوفر إصدار جديد من التطبيق يتضمن تحسينات في الأداء وإصلاحات للأخطاء.",
      updateButtonText: "تحديث الآن",
      skipButtonText: "لاحقاً",
      maintenanceTitle: "التطبيق قيد الصيانة",
      maintenanceDescription: "نقوم حالياً بإجراء صيانة مجدولة للنظام. يرجى المحاولة مرة أخرى لاحقاً.",
    },
  });

  useEffect(() => {
    if (version) {
      setPlatform(version.platform);
      setCurrentVersion(version.currentVersion);
      setMinimumSupported(version.minimumSupported);
      setRecommendedVersion(version.recommendedVersion);
      setForceUpdate(version.forceUpdate);
      setMaintenanceMode(version.maintenanceMode);
      setMaintenanceMessage(version.maintenanceMessage || "");
      setRolloutPercentage(version.rolloutPercentage);
      setPlayStoreUrl(version.playStoreUrl || "");
      setAppStoreUrl(version.appStoreUrl || "");
      setWebUrl(version.webUrl || "");
      setStatus(version.status);

      if (version.appTranslations && version.appTranslations.length > 0) {
        const transMap: Record<string, AppVersionTranslation> = {};
        version.appTranslations.forEach((tr) => {
          transMap[tr.languageCode] = tr;
        });
        setTranslations(transMap);
        setActiveLang(version.appTranslations[0].languageCode);
      }
    }
  }, [version]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentVersion.trim() || !minimumSupported.trim()) {
      toast.error("Current and Minimum versions are required.");
      return;
    }

    const currentTr = translations[activeLang];
    if (!currentTr || !currentTr.title.trim() || !currentTr.description.trim()) {
      toast.error(`Title and Description are required for [${activeLang.toUpperCase()}]`);
      return;
    }

    setIsSaving(true);

    try {
      if (!isEdit) {
        toast.loading("Creating release...", { id: "version-save" });
        const translationList = Object.values(translations).filter(
          (t) => t.title.trim() && t.description.trim()
        );

        await versionApi.createRelease({
          platform,
          currentVersion,
          minimumSupported,
          recommendedVersion,
          forceUpdate,
          maintenanceMode,
          maintenanceMessage,
          rolloutPercentage,
          playStoreUrl,
          appStoreUrl,
          webUrl,
          status,
          releaseNotes,
          translations: translationList,
        });

        toast.success("App release created successfully!", { id: "version-save" });
      } else if (version?.id) {
        toast.loading("Updating release...", { id: "version-save" });
        await versionApi.updateRelease(version.id, {
          currentVersion,
          minimumSupported,
          recommendedVersion,
          forceUpdate,
          maintenanceMode,
          maintenanceMessage,
          rolloutPercentage,
          playStoreUrl,
          appStoreUrl,
          webUrl,
          status,
          releaseNotes,
        });

        // Save translation tabs
        for (const [code, tr] of Object.entries(translations)) {
          if (tr.title.trim() && tr.description.trim()) {
            await versionApi.upsertTranslation(version.id, { ...tr, languageCode: code });
          }
        }

        toast.success("App release updated successfully!", { id: "version-save" });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save release", { id: "version-save" });
    } finally {
      setIsSaving(false);
    }
  };

  const currentTr = translations[activeLang] || {
    languageCode: activeLang,
    title: "",
    description: "",
    updateButtonText: "Update Now",
    skipButtonText: "Later",
    maintenanceTitle: "Application Under Maintenance",
    maintenanceDescription: "We are performing scheduled maintenance.",
  };

  return (
    <Modal
      open={open}
      setOpen={(val) => !val && onClose()}
      title={isEdit ? `Edit Release: ${platform} v${currentVersion}` : "Create New App Release"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto sidebar-scroll">
        {/* Core Release Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Platform */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">
              Platform
            </label>
            {isEdit ? (
              <div className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 select-none">
                {platform === "ANDROID" ? "Android App" : platform === "IOS" ? "iOS App" : "Web Platform"}
              </div>
            ) : (
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as AppPlatform)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-black outline-none cursor-pointer"
              >
                <option value="ANDROID" className="bg-surface-light text-black">Android App</option>
                <option value="IOS" className="bg-surface-light text-black">iOS App</option>
                <option value="WEB" className="bg-surface-light text-black">Web Platform</option>
              </select>
            )}
          </div>

          {/* Release Status */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">
              Release Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-black outline-none cursor-pointer"
            >
              <option value="DRAFT" className="bg-surface-light text-black">DRAFT (Testing)</option>
              <option value="PUBLISHED" className="bg-surface-light text-black">PUBLISHED (Live)</option>
              <option value="ARCHIVED" className="bg-surface-light text-black">ARCHIVED</option>
            </select>
          </div>

          {/* Rollout % */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">
              Rollout Percentage ({rolloutPercentage}%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={rolloutPercentage}
              onChange={(e) => setRolloutPercentage(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-black outline-none"
            />
          </div>
        </div>

        {/* Semantic Versions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
          <h4 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Semantic Versions (x.y.z)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Latest Version (current) *
              </label>
              <input
                type="text"
                value={currentVersion}
                onChange={(e) => setCurrentVersion(e.target.value)}
                placeholder="e.g. 1.4.0"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-black outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Minimum Supported *
              </label>
              <input
                type="text"
                value={minimumSupported}
                onChange={(e) => setMinimumSupported(e.target.value)}
                placeholder="e.g. 1.2.0"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-rose-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Recommended Version
              </label>
              <input
                type="text"
                value={recommendedVersion}
                onChange={(e) => setRecommendedVersion(e.target.value)}
                placeholder="e.g. 1.3.5"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-purple-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Release Notes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">
            Internal Release Notes / Changelog
          </label>
          <textarea
            rows={2}
            value={releaseNotes}
            onChange={(e) => setReleaseNotes(e.target.value)}
            placeholder="e.g. Added new payment gateway support and bug fixes for Android 15..."
            className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-black outline-none"
          />
        </div>

        {/* Store URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {platform === "ANDROID" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Play Store URL
              </label>
              <input
                type="url"
                value={playStoreUrl}
                onChange={(e) => setPlayStoreUrl(e.target.value)}
                placeholder="https://play.google.com/store/apps/details?id=com.wasla.app"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-black outline-none"
              />
            </div>
          )}

          {platform === "IOS" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                App Store URL
              </label>
              <input
                type="url"
                value={appStoreUrl}
                onChange={(e) => setAppStoreUrl(e.target.value)}
                placeholder="https://apps.apple.com/app/id123456789"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-black outline-none"
              />
            </div>
          )}

          {platform === "WEB" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Web Application URL
              </label>
              <input
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://wasla.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-black outline-none"
              />
            </div>
          )}
        </div>

        {/* Multilingual Translation Messages */}
        <div className="border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-1 p-2 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60">
            {AVAILABLE_LANGUAGES.map((lang) => {
              const isActive = activeLang === lang.code;
              return (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => setActiveLang(lang.code)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-surface-light text-primary shadow-xs border border-slate-200 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{lang.name}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Update Title ({activeLang.toUpperCase()}) *
                </label>
                <input
                  type="text"
                  value={currentTr.title}
                  onChange={(e) =>
                    setTranslations((prev) => ({
                      ...prev,
                      [activeLang]: { ...prev[activeLang], title: e.target.value },
                    }))
                  }
                  placeholder="e.g. Update Required"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-black outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Update Button Text ({activeLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={currentTr.updateButtonText || "Update Now"}
                  onChange={(e) =>
                    setTranslations((prev) => ({
                      ...prev,
                      [activeLang]: { ...prev[activeLang], updateButtonText: e.target.value },
                    }))
                  }
                  placeholder="Update Now"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-black outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Update Description / Release Message ({activeLang.toUpperCase()}) *
              </label>
              <textarea
                rows={2}
                value={currentTr.description}
                onChange={(e) =>
                  setTranslations((prev) => ({
                    ...prev,
                    [activeLang]: { ...prev[activeLang], description: e.target.value },
                  }))
                }
                placeholder="Message displayed to users when an update prompt appears..."
                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-black outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-gray-6 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isEdit ? "Save Changes" : "Create Release"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
