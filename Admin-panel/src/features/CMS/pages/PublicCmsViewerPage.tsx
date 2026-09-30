import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Globe, Loader2, Calendar, FileText } from "lucide-react";

interface PublicCmsData {
  id?: string;
  slug: string;
  language?: string;
  languageCode?: string;
  title: string;
  contentHtml: string;
  metaTitle?: string;
  metaDescription?: string;
  updatedAt?: string;
}

export const PublicCmsViewerPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const langParam = searchParams.get("lang") || "en";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<PublicCmsData | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

    fetch(`${backendUrl}/cms/${slug}?lang=${langParam}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Page not found (HTTP ${res.status})`);
        }
        return res.json();
      })
      .then((resData) => {
        const payload = resData?.data || resData;
        if (payload && (payload.contentHtml !== undefined || payload.title || payload.slug)) {
          setPageData(payload);
        } else {
          setError(resData?.message || "Failed to load page content");
        }
      })
      .catch((err) => {
        setError(err.message || "Error fetching CMS page");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, langParam]);

  const toggleLanguage = (newLang: string) => {
    setSearchParams({ lang: newLang });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 text-primary rounded-xl border border-primary/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Wasla CMS
              </span>
              <h1 className="text-sm font-black text-white truncate max-w-[200px] sm:max-w-md">
                {pageData?.title || slug}
              </h1>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-400 ms-1.5" />
            <button
              onClick={() => toggleLanguage("en")}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${
                langParam === "en" ? "bg-primary text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => toggleLanguage("ar")}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${
                langParam === "ar" ? "bg-primary text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              العربية (AR)
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Loading page content...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-rose-500/10 border border-rose-500/30 rounded-3xl text-center space-y-4 max-w-md mx-auto my-12">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              !
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Content Unavailable</h2>
              <p className="text-xs text-rose-300 mt-1">{error}</p>
            </div>
          </div>
        ) : pageData ? (
          <article className="space-y-8 animate-in fade-in duration-300" dir={langParam === "ar" ? "rtl" : "ltr"}>
            {/* Title & Metadata */}
            <div className="border-b border-slate-800 pb-6 space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {pageData.title}
              </h1>
              {pageData.updatedAt && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Last Updated: {new Date(pageData.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Rendered HTML */}
            <div
              className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-sm sm:text-base prose-headings:font-bold prose-headings:text-white prose-a:text-primary hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: pageData.contentHtml || "<p className='text-slate-400'>No content available.</p>" }}
            />
          </article>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Wasla App. All rights reserved.</p>
      </footer>
    </div>
  );
};
