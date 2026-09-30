import axiosInstance from "../../../services/axiosInstance";
import { type LoginValues, type ForgotPasswordValues, type ResetPasswordValues } from "../types";

export interface AuthResponse {
  data: {
    admin: any;
    user?: any;
    role?: any;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

export const loginAPI = async (credentials: LoginValues): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>("/auth/login", credentials);
  return response.data;
};

export const forgotPasswordAPI = async (data: ForgotPasswordValues) => {
  const response = await axiosInstance.post("/auth/forgot-password", data);
  return response.data;
};

export const verifyResetTokenAPI = async (token: string) => {
  const response = await axiosInstance.post("/auth/verify-reset-token", { token });
  return response.data;
};

export const resetPasswordAPI = async (data: ResetPasswordValues & { token: string }) => {
  const response = await axiosInstance.post("/auth/reset-password", data);
  return response.data;
};

export const logoutAPI = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};
