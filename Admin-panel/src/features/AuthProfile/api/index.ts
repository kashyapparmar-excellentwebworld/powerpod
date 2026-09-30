import axiosInstance from "../../../services/axiosInstance";

export interface Role {
  id: string;
  name: string;
  label: string;
}

export interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
  lastLoginAt: string;
  createdAt: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: ProfileData;
}

export const fetchProfile = async (): Promise<ProfileResponse> => {
  const response = await axiosInstance.get<ProfileResponse>("/profile");
  return response.data;
};

export const updateProfile = async (data: any): Promise<ProfileResponse> => {
  const response = await axiosInstance.put<ProfileResponse>("/profile", data);
  return response.data;
};

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (
  data: ChangePasswordPayload,
): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.put("/auth/change-password", data);
  return response.data;
};
