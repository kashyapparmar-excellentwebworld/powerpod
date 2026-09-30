import axiosInstance from "../../../services/axiosInstance";

export const getBannersAPI = async (params?: any) => {
  const response = await axiosInstance.get("/banners", { params });
  return response.data;
};

export const getBannerByIdAPI = async (id: string) => {
  const response = await axiosInstance.get(`/banners/${id}`);
  return response.data;
};

export const createBannerAPI = async (payload: any) => {
  const response = await axiosInstance.post("/banners", payload);
  return response.data;
};

export const updateBannerAPI = async (id: string, payload: any) => {
  const response = await axiosInstance.put(`/banners/${id}`, payload);
  return response.data;
};

export const deleteBannerAPI = async (id: string) => {
  const response = await axiosInstance.delete(`/banners/${id}`);
  return response.data;
};

export const updateBannerStatusAPI = async (id: string, payload: { isActive: boolean }) => {
  const response = await axiosInstance.put(`/banners/${id}/status`, payload);
  return response.data;
};
