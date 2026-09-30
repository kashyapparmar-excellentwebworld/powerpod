import api from "./axiosInstance";

export interface GuidanceDocumentItem {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  chunkCount: number;
  createdAt: string;
}

export const guidanceApi = {
  uploadDocument: async (data: { title: string; textContent: string; fileName?: string; fileType?: string; fileBase64?: string }) => {
    const res = await api.post("/guidance/upload", data);
    return res.data;
  },

  parseFile: async (data: { fileBase64?: string; fileName?: string; textContent?: string }) => {
    const res = await api.post("/guidance/parse-file", data);
    return res.data;
  },

  getDocuments: async () => {
    const res = await api.get("/guidance/documents");
    return res.data;
  },

  getDocumentDetails: async (id: string) => {
    const res = await api.get(`/guidance/documents/${id}`);
    return res.data;
  },

  deleteDocument: async (id: string) => {
    const res = await api.delete(`/guidance/documents/${id}`);
    return res.data;
  },
};
