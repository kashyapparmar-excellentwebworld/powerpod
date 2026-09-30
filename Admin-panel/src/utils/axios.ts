import axios from "axios";
import { store } from "../redux/store";
import { setTokens, logout } from "../redux/slices/authSlice";
import i18n from "../i18n";
import { toast } from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

/* ================= REQUEST ================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.auth.accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    config.headers.lang = i18n.language || "en";
    config.headers.Accept = "application/json";

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE ================= */
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    const originalRequest = response.config;
    if (
      response.data &&
      response.data.status === false &&
      response.data.message &&
      typeof response.data.message === "string" &&
      response.data.message.toLowerCase().includes("account has been deactivated")
    ) {
      store.dispatch(logout());
      if (
        !originalRequest.url?.includes("/login") &&
        !originalRequest.url?.includes("/forgot-password")
      ) {
        toast.error(response.data.message, {
          id: response.data.message,
          position: "bottom-right",
          duration: 4000,
          style: {
            borderRadius: "15px",
            fontFamily: "Cairo, sans-serif",
            fontWeight: 500,
          },
        });
      }
      return Promise.reject(new Error(response.data.message));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errorMsg = error.response?.data?.message;

    if (
      errorMsg &&
      typeof errorMsg === "string" &&
      errorMsg.toLowerCase().includes("account has been deactivated")
    ) {
      store.dispatch(logout());
      if (
        !originalRequest.url?.includes("/login") &&
        !originalRequest.url?.includes("/forgot-password")
      ) {
        toast.error(errorMsg, {
          id: errorMsg,
          position: "bottom-right",
          duration: 4000,
          style: {
            borderRadius: "15px",
            fontFamily: "Cairo, sans-serif",
            fontWeight: 500,
          },
        });
      }
      return Promise.reject(error);
    }

    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/login") &&
      !originalRequest.url?.includes("/refresh-token")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 🔥 Get refresh token (Redux + fallback)
        const state = store.getState();
        let refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
          const localAuth = localStorage.getItem("auth");
          const sessionAuth = sessionStorage.getItem("auth");

          const parsed = localAuth
            ? JSON.parse(localAuth)
            : sessionAuth
            ? JSON.parse(sessionAuth)
            : null;

          refreshToken = parsed?.refreshToken;
        }

        if (!refreshToken) {
          store.dispatch(logout());
          return Promise.reject(error);
        }

        // 🔥 CORRECT PAYLOAD
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/auth/refresh-token`,
          {
            refreshToken: refreshToken,
          }
        );

        const newAccessToken =
          data?.accessToken ||
          data?.data?.accessToken ||
          data?.access_token ||
          data?.data?.access_token;

        const newRefreshToken =
          data?.refreshToken ||
          data?.data?.refreshToken ||
          data?.refresh_token ||
          data?.data?.refresh_token ||
          refreshToken;

        if (!newAccessToken) {
          throw new Error("No access token received");
        }

        // ✅ Save tokens
        store.dispatch(
          setTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          })
        );

        // 🔥 Update global header
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        // 🔥 Retry all queued requests
        processQueue(null, newAccessToken);

        // 🔁 Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        store.dispatch(logout());
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;