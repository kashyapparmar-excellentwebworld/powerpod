import axios from "axios";
import { store } from "../redux/store";
import { logout, setTokens } from "../redux/slices/authSlice";
import { showToast } from "../hooks/useToast";

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

const axiosInstance = axios.create({
  // Use VITE_API_BASE_URL or fallback to a relative path / default URL
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1/admin",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ────────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the latest auth token directly from the Redux store
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach language preference so the backend can translate errors dynamically
    const lang = localStorage.getItem("i18nextLng") || "en";
    if (config.headers) {
      config.headers["Accept-Language"] = lang;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ───────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => {
    // Return the response object smoothly if it's successful
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized globally
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // If the failing request was the refresh token itself, don't loop
      if (originalRequest.url?.includes("/auth/refresh-token")) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue the request until the token is refreshed
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const state = store.getState();
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        store.dispatch(logout());
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Create an isolated Axios request to prevent looping through the interceptor
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1/admin"}/auth/refresh-token`,
          { refreshToken },
        );

        const newAccessToken = data?.data?.accessToken;
        const newRefreshToken = data?.data?.refreshToken;

        if (newAccessToken) {
          // Store the new tokens in Redux (which also updates localStorage/sessionStorage)
          store.dispatch(
            setTokens({
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            }),
          );

          originalRequest.headers.Authorization = "Bearer " + newAccessToken;

          // Resume all queued requests
          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Retry the original request
          return axiosInstance(originalRequest);
        } else {
          throw new Error("No access token in refresh response");
        }
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        store.dispatch(logout());
        showToast("Session expired. Please log in again.", "error");
        return Promise.reject(err);
      }
    }

    // Handle standard server and network errors
    if (error.response) {
      if (error.response.status === 403) {
        const forbiddenMsg =
          error.response.data?.message ||
          "Access Denied: You do not have sufficient permissions to perform this action.";
        showToast(forbiddenMsg, "error");
      } else if (error.response.status >= 500) {
        showToast("Server error. Please try again later.", "error");
      }
    } else if (error.request) {
      showToast(
        "Network error. Please check your internet connection.",
        "error",
      );
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
