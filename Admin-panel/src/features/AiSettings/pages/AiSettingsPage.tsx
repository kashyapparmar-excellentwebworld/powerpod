import React, { useEffect, useState } from "react";
import {
  Bot,
  Key,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Sliders,
  Cpu,
} from "lucide-react";
import { aiApi, type AiConfigData } from "../../../services/aiApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useThemeCustomizer } from "../../../context/ThemeCustomizerContext";

export const AiSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { primaryColor } = useThemeCustomizer();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [aiEnabled, setAiEnabled] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [hasKeySet, setHasKeySet] = useState(false);

  const [hfToken, setHfToken] = useState("");
  const [showHfToken, setShowHfToken] = useState(false);
  const [hasHfTokenSet, setHasHfTokenSet] = useState(false);
  const [hfModel, setHfModel] = useState("BAAI/bge-base-en-v1.5");

  const [confidenceThreshold, setConfidenceThreshold] = useState(75);

  const [langsmithEnabled, setLangsmithEnabled] = useState(false);
  const [langsmithApiKey, setLangsmithApiKey] = useState("");
  const [showLsKey, setShowLsKey] = useState(false);
  const [hasLangsmithKeySet, setHasLangsmithKeySet] = useState(false);
  const [langsmithProject, setLangsmithProject] = useState("wasla-ai-support");

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getAiConfig();
      if (res.data) {
        const cfg: AiConfigData = res.data;
        setAiEnabled(cfg.aiEnabled);
        setGeminiApiKey(cfg.geminiApiKey || "");
        setHasKeySet(cfg.hasKeySet);
        setHfToken(cfg.hfToken || "");
        setHasHfTokenSet(Boolean(cfg.hasHfTokenSet));
        setHfModel(cfg.hfModel || "BAAI/bge-base-en-v1.5");
        setConfidenceThreshold(Math.round((cfg.confidenceThreshold || 0.75) * 100));
        setLangsmithEnabled(Boolean(cfg.langsmithEnabled));
        setLangsmithApiKey(cfg.langsmithApiKey || "");
        setHasLangsmithKeySet(Boolean(cfg.hasLangsmithKeySet));
        setLangsmithProject(cfg.langsmithProject || "wasla-ai-support");
      }
    } catch (err: any) {
      toast.error("Failed to load AI settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleTestKey = async () => {
    setTesting(true);
    try {
      const res = await aiApi.testGeminiApiKey(geminiApiKey);
      if (res.success) {
        toast.success(res.message || "Gemini API Key connection verified!");
      } else {
        toast.error(res.message || "Failed to connect to Gemini API");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aiEnabled && !hasKeySet && !geminiApiKey) {
      toast.error("Please enter a Google Gemini API Key to enable AI Flow");
      return;
    }

    setSaving(true);
    try {
      const res = await aiApi.updateAiConfig({
        aiEnabled,
        geminiApiKey: geminiApiKey.trim() || undefined,
        hfToken: hfToken.trim() || undefined,
        hfModel: hfModel.trim() || "BAAI/bge-base-en-v1.5",
        confidenceThreshold: confidenceThreshold / 100,
        langsmithEnabled,
        langsmithApiKey: langsmithApiKey.trim() || undefined,
        langsmithProject: langsmithProject.trim() || "wasla-ai-support",
      });

      toast.success(res.message || "AI Settings saved successfully!");
      fetchConfig();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save AI settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-surface-light p-6 rounded-2xl border border-gray-light shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-black tracking-tight">
              {t("ai_settings.title", "AI Engine & Support Ticket Settings")}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {t("ai_settings.subtitle", "Configure Google Gemini 3.6 Flash, Hugging Face Vector Embeddings & RAG Auto-Ticket Assignment Flow")}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-surface-light rounded-2xl border border-gray-light">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: primaryColor }} />
          <p className="text-xs font-semibold text-slate-500 mt-2">Loading AI configuration...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-surface-light p-6 rounded-2xl border border-gray-light space-y-6 shadow-xs">
            {/* Toggle Switch */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1E2235] rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="text-sm font-bold text-black">
                    Enable AI Guidance & Smart Auto-Ticket Assignment
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  When enabled, AI evaluates ticket content and executes RAG grounded support chat & candidate scoring.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAiEnabled(!aiEnabled)}
                style={aiEnabled ? { backgroundColor: primaryColor } : {}}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  aiEnabled ? "" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    aiEnabled ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Gemini API Key Configuration Input */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Google Gemini API Key {aiEnabled && <span className="text-rose-500">*</span>}
              </label>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showKey ? "text" : "password"}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder={hasKeySet ? "••••••••••••••••••••••••" : "Enter your Google Gemini API Key"}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={testing}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: primaryColor }} /> : <ShieldCheck className="w-3.5 h-3.5" style={{ color: primaryColor }} />}
                  <span>Test Connection</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Required for Gemini 3.6 Flash / LLM candidate completion, grounded RAG responses, and ticket classification.
              </p>
            </div>

            {/* Hugging Face Vector Embedding Token Configuration */}
            <div className="space-y-3 pt-3 border-t border-gray-light">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Hugging Face Token (Vector Embeddings)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Cpu className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showHfToken ? "text" : "password"}
                    value={hfToken}
                    onChange={(e) => setHfToken(e.target.value)}
                    placeholder={hasHfTokenSet ? "••••••••••••••••••••••••" : "hf_... (Hugging Face User Access Token)"}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowHfToken((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showHfToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <input
                  type="text"
                  value={hfModel}
                  onChange={(e) => setHfModel(e.target.value)}
                  placeholder="BAAI/bge-base-en-v1.5"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-black focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Optional remote Hugging Face Inference API embedding model. If unconfigured or unreachable, system automatically uses local 768-dim vector engine.
              </p>
            </div>

            {/* RAG Confidence Threshold Slider */}
            <div className="space-y-2 pt-3 border-t border-gray-light">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4" style={{ color: primaryColor }} />
                  <span>RAG Grounding Confidence Threshold</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-mono font-bold" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                  {confidenceThreshold}%
                </span>
              </div>

              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                style={{ accentColor: primaryColor }}
                className="w-full cursor-pointer"
              />

              <p className="text-[11px] text-slate-400">
                Questions scoring below this confidence threshold will prompt users with an automatic ticket creation option.
              </p>
            </div>
          </div>

          {/* LangSmith Tracing & Observability (Optional) */}
          <div className="bg-surface-light p-6 rounded-2xl border border-gray-light space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-light">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black flex items-center gap-2">
                    LangSmith Observability & Tracing <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">Optional</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enable LangChain & LangSmith deep execution tracing for real-time prompt telemetry and RAG latency monitoring
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setLangsmithEnabled(!langsmithEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  langsmithEnabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    langsmithEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {langsmithEnabled && (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    LangSmith API Key (LANGCHAIN_API_KEY)
                  </label>
                  <div className="relative">
                    <input
                      type={showLsKey ? "text" : "password"}
                      value={langsmithApiKey}
                      onChange={(e) => setLangsmithApiKey(e.target.value)}
                      placeholder={hasLangsmithKeySet ? "••••••••••••••••••••" : "lsv2_pt_..."}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-black focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLsKey(!showLsKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showLsKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    LangSmith Project Name (LANGCHAIN_PROJECT)
                  </label>
                  <input
                    type="text"
                    value={langsmithProject}
                    onChange={(e) => setLangsmithProject(e.target.value)}
                    placeholder="wasla-ai-support"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1E2235] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-black focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mode Warning Alert */}
          <div
            style={
              aiEnabled
                ? { backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}30` }
                : {}
            }
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              aiEnabled
                ? ""
                : "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
            }`}
          >
            {aiEnabled ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: primaryColor }} />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <h4 className="font-bold" style={aiEnabled ? { color: primaryColor } : {}}>
                {aiEnabled ? "AI Mode Active" : "Manual Mode Active"}
              </h4>
              <p className="opacity-90 leading-relaxed">
                {aiEnabled
                  ? "Support tickets are automatically evaluated using Gemini LLM and assigned based on candidate scores (45% Workload + 35% Skill + 20% Availability)."
                  : "AI features are currently disabled. Support tickets and specialist assignments will be performed manually."}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              style={{ backgroundColor: primaryColor }}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-md"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save AI Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AiSettingsPage;
