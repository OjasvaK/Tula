import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url === "/login";
    if (error.response?.status === 401 && !isLoginRequest) {
      // No sign-in screen: dropping the token and reloading /app lets
      // AuthProvider's auto-login silently re-authenticate.
      localStorage.removeItem("access_token");
      if (window.location.pathname.startsWith("/app")) {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

/** Pull a human-readable message out of an axios error. */
export function errorMessage(err, fallback = "Something went wrong.") {
  return (
    err?.response?.data?.detail ||
    (typeof err?.response?.data === "string" ? err.response.data : null) ||
    err?.message ||
    fallback
  );
}
