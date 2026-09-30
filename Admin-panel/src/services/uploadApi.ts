import axiosInstance from "./axiosInstance";

export const uploadFile = async (formData: FormData): Promise<any> => {
  const response = await axiosInstance.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
