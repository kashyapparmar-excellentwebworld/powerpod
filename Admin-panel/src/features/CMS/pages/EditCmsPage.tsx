import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Globe,
  Plus,
  Eye,
  History,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { RichTextEditor } from "../../../components/common/RichTextEditor";
import { PreviewModal } from "../components/PreviewModal";
import { VersionHistoryModal } from "../components/VersionHistoryModal";
import { cmsApi, type CmsPage, type CmsTranslation, type CmsVersion } from "../../../services/cmsApi";
import toast from "react-hot-toast";

const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English (EN)" },
  { code: "ar", name: "Arabic (العربية) (AR)" },
  { code: "fr", name: "French (Français) (FR)" },
  { code: "es", name: "Spanish (Español) (ES)" },
  { code: "de", name: "German (Deutsch) (DE)" },
  { code: "hi", name: "Hindi (हिन्दी) (HI)" },
  { code: "zh", name: "Chinese (中文) (ZH)" },
  { code: "tr", name: "Turkish (Türkçe) (TR)" },
  { code: "it", name: "Italian (Italiano) (IT)" },
  { code: "pt", name: "Portuguese (Português) (PT)" },
  { code: "ru", name: "Russian (Русский) (RU)" },
];

export const EditCmsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Core Page State
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [translations, setTranslations] = useState<Record<string, CmsTranslation>>({
    en: {
      languageCode: "en",
      title: "",
      contentHtml: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      robots: "index, follow",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterCard: "summary_large_image",
    },
    ar: {
      languageCode: "ar",
      title: "",
      contentHtml: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      robots: "index, follow",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterCard: "summary_large_image",
    },
  });

  // Active Language Tab
  const [activeLang, setActiveLang] = useState<string>("en");

  // Custom New Language Dialog
  const [showAddLangModal, setShowAddLangModal] = useState(false);
  const [newLangCode, setNewLangCode] = useState("");

  // SEO Accordion collapse
  const [showSeo, setShowSeo] = useState(false);

  // Modals
  const [showPreview, setShowPreview] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<CmsVersion[]>([]);

  // Auto-slugify title if in create mode
  const handleTitleChange = (val: string) => {
    setTranslations((prev) => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        title: val,
      },
    }));

    if (!isEdit && activeLang === "en" && !slug) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setSlug(generatedSlug);
    }
  };

  // Fetch page data if edit mode
  const fetchPage = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await cmsApi.getPageById(id);
      const pageData: CmsPage = res.data || res;
      setSlug(pageData.slug);
      setStatus(pageData.status);

      const transMap: Record<string, CmsTranslation> = {};
      if (pageData.translations && pageData.translations.length > 0) {
        pageData.translations.forEach((tr) => {
          transMap[tr.languageCode] = tr;
        });
        setTranslations(transMap);
        setActiveLang(pageData.translations[0].languageCode);
      }
    } catch (err: any) {
      toast.error("Failed to fetch page data");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      fetchPage();
    }
  }, [isEdit, fetchPage]);

  // Fetch version history
  const fetchVersions = async () => {
    if (!id) return;
    try {
      const res = await cmsApi.getVersions(id, activeLang);
      setVersions(res.data || []);
      setShowVersions(true);
    } catch (err: any) {
      toast.error("Failed to load version history");
    }
  };

  // Restore specific version
  const handleRestoreVersion = async (versionId: string) => {
    if (!id) return;
    try {
      toast.loading("Restoring version...", { id: "restore-cms" });
      await cmsApi.restoreVersion(id, versionId);
      toast.success("Version restored successfully", { id: "restore-cms" });
      setShowVersions(false);
      fetchPage();
    } catch (err: any) {
      toast.error("Failed to restore version", { id: "restore-cms" });
    }
  };

  // Save/Publish Submit handler
  const handleSave = async (targetStatus?: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    if (!slug.trim()) {
      toast.error("Page Slug is required");
      return;
    }

    const currentTr = translations[activeLang];
    if (!currentTr || !currentTr.title.trim()) {
      toast.error(`Title is required for language [${activeLang.toUpperCase()}]`);
      return;
    }
    if (!currentTr.contentHtml.trim()) {
      toast.error(`Content HTML is required for language [${activeLang.toUpperCase()}]`);
      return;
    }

    const nextStatus = targetStatus || status;
    setIsSaving(true);

    try {
      if (!isEdit) {
        // Create new page
        toast.loading("Creating page...", { id: "save-cms" });
        const res = await cmsApi.createPage({
          slug,
          status: nextStatus,
          languageCode: activeLang,
          title: currentTr.title,
          contentHtml: currentTr.contentHtml,
          metaTitle: currentTr.metaTitle,
          metaDescription: currentTr.metaDescription,
          canonicalUrl: currentTr.canonicalUrl,
          robots: currentTr.robots,
          ogTitle: currentTr.ogTitle,
          ogDescription: currentTr.ogDescription,
          ogImage: currentTr.ogImage,
          twitterCard: currentTr.twitterCard,
        });

        const newId = res.data?.id || res.id;

        // Save any other populated language translation tabs
        for (const [code, tr] of Object.entries(translations)) {
          if (code !== activeLang && tr.title.trim() && tr.contentHtml.trim()) {
            await cmsApi.upsertTranslation(newId, { ...tr, languageCode: code });
          }
        }

        toast.success("Page created successfully!", { id: "save-cms" });
        navigate(`/cms/edit/${newId}`);
      } else {
        // Update existing page
        toast.loading("Saving changes...", { id: "save-cms" });
        await cmsApi.updatePage(id!, { slug, status: nextStatus });

        // Save current language translation
        await cmsApi.upsertTranslation(id!, {
          ...currentTr,
          languageCode: activeLang,
        });

        // Save any other populated language translation tabs
        for (const [code, tr] of Object.entries(translations)) {
          if (code !== activeLang && tr.title.trim() && tr.contentHtml.trim()) {
            await cmsApi.upsertTranslation(id!, { ...tr, languageCode: code });
          }
        }

        toast.success("Page saved successfully!", { id: "save-cms" });
        fetchPage();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save CMS page", { id: "save-cms" });
    } finally {
      setIsSaving(false);
    }
  };

  // Add custom new language tab
  const handleAddNewLang = () => {
    const code = newLangCode.trim().toLowerCase();
    if (!code) return;
    if (translations[code]) {
      setActiveLang(code);
      setShowAddLangModal(false);
      return;
    }

    setTranslations((prev) => ({
      ...prev,
      [code]: {
        languageCode: code,
        title: "",
        contentHtml: "",
        metaTitle: "",
        metaDescription: "",
        canonicalUrl: "",
        robots: "index, follow",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        twitterCard: "summary_large_image",
      },
    }));

    setActiveLang(code);
    setNewLangCode("");
    setShowAddLangModal(false);
    toast.success(`Added language tab [${code.toUpperCase()}]`);
  };

  const currentTranslation = translations[activeLang] || {
    languageCode: activeLang,
    title: "",
    contentHtml: "",
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    robots: "index, follow",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
  };

  if (isLoading) {
    return (
      <div className="space-y-4 py-8">
        <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Action Bar Header */}
      <div className="bg-surface-light p-5 rounded-2xl border border-gray-light shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/cms")}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-6 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-black tracking-tight">
              {isEdit ? `Edit Page: /${slug}` : "Create New CMS Page"}
            </h1>
            <p className="text-xs text-slate-400">
              Manage content, translation tabs, rich HTML, and SEO settings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          {isEdit && (
            <button
              type="button"
              onClick={fetchVersions}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shrink-0"
            >
              <History className="w-4 h-4 text-primary" />
              <span>Versions</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shrink-0"
          >
            <Eye className="w-4 h-4 text-primary" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave("PUBLISHED")}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Publish Page</span>
          </button>
        </div>
      </div>

      {/* Main Settings Card (Slug & Status) */}
      <div className="bg-surface-light p-5 rounded-2xl border border-gray-light shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Slug */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Page URL Slug <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
            <span className="ps-3 pe-1 text-xs text-slate-400 font-mono select-none">
              https://example.com/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. privacy-policy"
              className="flex-1 px-2 py-2.5 bg-transparent text-xs font-bold font-mono text-black outline-none"
            />
          </div>
        </div>

        {/* Status Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Publish Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full max-w-full truncate px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-black outline-none cursor-pointer"
          >
            <option value="DRAFT" className="bg-surface-light text-black">DRAFT (Hidden from Public)</option>
            <option value="PUBLISHED" className="bg-surface-light text-black">PUBLISHED (Live)</option>
            <option value="ARCHIVED" className="bg-surface-light text-black">ARCHIVED</option>
          </select>
        </div>
      </div>

      {/* Language Tabs & Content Editor */}
      <div className="bg-surface-light rounded-2xl border border-gray-light shadow-xs overflow-hidden">
        {/* Language Tabs Bar */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60 overflow-x-auto sidebar-scroll">
          {Object.keys(translations).map((langCode) => {
            const langObj = AVAILABLE_LANGUAGES.find((l) => l.code === langCode);
            const isActive = activeLang === langCode;
            return (
              <button
                key={langCode}
                onClick={() => setActiveLang(langCode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-surface-light text-primary shadow-xs border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{langObj ? langObj.name : langCode.toUpperCase()}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-mono">
                  {langCode}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setShowAddLangModal(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer ms-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Language</span>
          </button>
        </div>

        {/* Translation Content Area */}
        <div className="p-6 space-y-6">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Page Title ({activeLang.toUpperCase()}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={currentTranslation.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Privacy Policy"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-black outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              HTML Body Content ({activeLang.toUpperCase()}) <span className="text-rose-500">*</span>
            </label>
            <RichTextEditor
              value={currentTranslation.contentHtml}
              onChange={(html) => {
                setTranslations((prev) => ({
                  ...prev,
                  [activeLang]: {
                    ...prev[activeLang],
                    contentHtml: html,
                  },
                }));
              }}
            />
          </div>

          {/* SEO Metadata Accordion */}
          <div className="border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
            <button
              onClick={() => setShowSeo((prev) => !prev)}
              className="w-full p-4 flex items-center justify-between text-start cursor-pointer hover:bg-slate-100/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-black uppercase tracking-wider">
                  SEO & Social Media Metadata ({activeLang.toUpperCase()})
                </span>
              </div>
              {showSeo ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showSeo && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-700/60 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Meta Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={currentTranslation.metaTitle || ""}
                      onChange={(e) =>
                        setTranslations((prev) => ({
                          ...prev,
                          [activeLang]: { ...prev[activeLang], metaTitle: e.target.value },
                        }))
                      }
                      placeholder="Title for Google search results"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-black outline-none"
                    />
                  </div>

                  {/* Canonical URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Canonical URL
                    </label>
                    <input
                      type="text"
                      value={currentTranslation.canonicalUrl || ""}
                      onChange={(e) =>
                        setTranslations((prev) => ({
                          ...prev,
                          [activeLang]: { ...prev[activeLang], canonicalUrl: e.target.value },
                        }))
                      }
                      placeholder="https://example.com/privacy-policy"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-black outline-none"
                    />
                  </div>
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={currentTranslation.metaDescription || ""}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        [activeLang]: { ...prev[activeLang], metaDescription: e.target.value },
                      }))
                    }
                    placeholder="Short description snippet for search engines..."
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-black outline-none"
                  />
                </div>

                {/* Open Graph Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Open Graph Title
                    </label>
                    <input
                      type="text"
                      value={currentTranslation.ogTitle || ""}
                      onChange={(e) =>
                        setTranslations((prev) => ({
                          ...prev,
                          [activeLang]: { ...prev[activeLang], ogTitle: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-black outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Open Graph Image URL
                    </label>
                    <input
                      type="text"
                      value={currentTranslation.ogImage || ""}
                      onChange={(e) =>
                        setTranslations((prev) => ({
                          ...prev,
                          [activeLang]: { ...prev[activeLang], ogImage: e.target.value },
                        }))
                      }
                      placeholder="https://example.com/og-image.png"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-black outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Robots Directive
                    </label>
                    <select
                      value={currentTranslation.robots || "index, follow"}
                      onChange={(e) =>
                        setTranslations((prev) => ({
                          ...prev,
                          [activeLang]: { ...prev[activeLang], robots: e.target.value },
                        }))
                      }
                      className="w-full max-w-full truncate px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-black outline-none cursor-pointer"
                    >
                      <option value="index, follow" className="bg-surface-light text-black">index, follow (Default)</option>
                      <option value="noindex, follow" className="bg-surface-light text-black">noindex, follow</option>
                      <option value="noindex, nofollow" className="bg-surface-light text-black">noindex, nofollow</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add New Language Modal */}
      {showAddLangModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-100 flex items-center justify-center p-4">
          <div className="bg-surface-light p-6 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-black">
              Add Translation Language
            </h3>
            <p className="text-xs text-slate-400">
              Select a language from the available list to add a translation tab.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Select Language
              </label>
              <select
                value={newLangCode}
                onChange={(e) => setNewLangCode(e.target.value)}
                className="w-full max-w-full truncate px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-black outline-none cursor-pointer"
              >
                <option value="" className="bg-surface-light text-black">
                  -- Select a Language --
                </option>
                {AVAILABLE_LANGUAGES.filter((l) => !translations[l.code]).map((lang) => (
                  <option
                    key={lang.code}
                    value={lang.code}
                    className="bg-surface-light text-black font-medium"
                  >
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddLangModal(false);
                  setNewLangCode("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewLang}
                disabled={!newLangCode}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
              >
                Add Language Tab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          title={
            currentTranslation.title ||
            translations.en?.title ||
            translations.ar?.title ||
            slug ||
            "CMS Page Preview"
          }
          slug={slug || "page-slug"}
          language={activeLang}
          contentHtml={
            currentTranslation.contentHtml ||
            translations.en?.contentHtml ||
            translations.ar?.contentHtml ||
            ""
          }
          metaTitle={currentTranslation.metaTitle}
          metaDescription={currentTranslation.metaDescription}
        />
      )}

      {/* Versions Modal */}
      {showVersions && (
        <VersionHistoryModal
          open={showVersions}
          onClose={() => setShowVersions(false)}
          versions={versions}
          onRestore={handleRestoreVersion}
        />
      )}
    </div>
  );
};
