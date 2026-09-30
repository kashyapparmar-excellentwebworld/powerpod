import axiosInstance from "./axiosInstance";

export interface CmsTranslation {
  id?: string;
  languageCode: string;
  title: string;
  contentHtml: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  publishedVersion?: number;
  updatedAt?: string;
}

export interface CmsVersion {
  id: string;
  pageId: string;
  languageCode: string;
  version: number;
  title: string;
  contentHtml: string;
  metaTitle?: string;
  metaDescription?: string;
  createdBy?: string;
  createdAt: string;
}

export interface CmsPage {
  id: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  translations: CmsTranslation[];
  versions?: CmsVersion[];
}

export interface CmsPageQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  language?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const cmsApi = {
  getPages: async (params?: CmsPageQuery) => {
    const res = await axiosInstance.get("/cms", { params });
    return res.data;
  },

  getPageById: async (id: string) => {
    const res = await axiosInstance.get(`/cms/${id}`);
    return res.data;
  },

  createPage: async (data: any) => {
    const res = await axiosInstance.post("/cms", data);
    return res.data;
  },

  updatePage: async (id: string, data: any) => {
    const res = await axiosInstance.put(`/cms/${id}`, data);
    return res.data;
  },

  deletePage: async (id: string) => {
    const res = await axiosInstance.delete(`/cms/${id}`);
    return res.data;
  },

  publishPage: async (id: string, status: "PUBLISHED" | "DRAFT" | "ARCHIVED" = "PUBLISHED") => {
    const res = await axiosInstance.post(`/cms/${id}/publish`, { status });
    return res.data;
  },

  duplicatePage: async (id: string) => {
    const res = await axiosInstance.post(`/cms/${id}/duplicate`);
    return res.data;
  },

  upsertTranslation: async (id: string, translationData: CmsTranslation) => {
    const res = await axiosInstance.post(`/cms/${id}/translations`, translationData);
    return res.data;
  },

  deleteTranslation: async (id: string, languageCode: string) => {
    const res = await axiosInstance.delete(`/cms/${id}/translations/${languageCode}`);
    return res.data;
  },

  getVersions: async (id: string, language?: string) => {
    const res = await axiosInstance.get(`/cms/${id}/versions`, { params: { language } });
    return res.data;
  },

  restoreVersion: async (id: string, versionId: string) => {
    const res = await axiosInstance.post(`/cms/${id}/versions/${versionId}/restore`);
    return res.data;
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await axiosInstance.post("/cms/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
