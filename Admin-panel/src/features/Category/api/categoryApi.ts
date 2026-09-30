import axiosInstance from "../../../services/axiosInstance";

export const createCategoryAPI = async (payload: any) => {
  const response = await axiosInstance.post("/categories", payload);
  return response.data;
};

export const updateCategoryAPI = async (id: string, payload: any) => {
  const response = await axiosInstance.put(`/categories/${id}`, payload);
  return response.data;
};

export const getCategoriesAPI = async (params?: any) => {
  const response = await axiosInstance.get("/categories", { params });
  return response.data;
};

export const getCategoryByIdAPI = async (id: string) => {
  const response = await axiosInstance.get(`/categories/${id}`);
  return response.data;
};

export const deleteCategoryAPI = async (id: string) => {
  const response = await axiosInstance.delete(`/categories/${id}`);
  return response.data;
};

export const updateCategoryStatusAPI = async (id: string, payload: { isActive: boolean }) => {
  const response = await axiosInstance.put(`/categories/${id}/status`, payload);
  return response.data;
};
