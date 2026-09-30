import api from "./axiosInstance";

export interface AiConfigData {
  aiEnabled: boolean;
  geminiApiKey: string;
  hasKeySet: boolean;
  hfToken?: string;
  hasHfTokenSet?: boolean;
  hfModel?: string;
  confidenceThreshold: number;
  langsmithEnabled?: boolean;
  langsmithApiKey?: string;
  hasLangsmithKeySet?: boolean;
  langsmithProject?: string;
}

export const aiApi = {
  getAiConfig: async () => {
    const res = await api.get("/ai-settings");
    return res.data;
  },

  updateAiConfig: async (data: {
    aiEnabled: boolean;
    geminiApiKey?: string;
    hfToken?: string;
    hfModel?: string;
    confidenceThreshold?: number;
    langsmithEnabled?: boolean;
    langsmithApiKey?: string;
    langsmithProject?: string;
  }) => {
    const res = await api.put("/ai-settings", data);
    return res.data;
  },

  testGeminiApiKey: async (geminiApiKey?: string) => {
    const res = await api.post("/ai-settings/test-key", { geminiApiKey });
    return res.data;
  },
};
