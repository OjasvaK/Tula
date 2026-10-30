import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { decodeToken, login as loginRequest } from "../api/auth";

const AuthContext = createContext(null);

// There's no sign-in screen in this app — opening /app silently authenticates
// as a standing demo/regulator account instead. Fine for local dev and a
// portfolio demo; swap these (and lock the backend down properly) before any
// real deploy with real regulator accounts. See MEMORY.md's deploy notes.
const DEMO_USERNAME = import.meta.env.VITE_DEMO_USERNAME || "admin";
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || "dev-password-123";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [authError, setAuthError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(() => !localStorage.getItem("access_token"));

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password);
    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    setToken(null);
  }, []);

  const autoLogin = useCallback(async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await login(DEMO_USERNAME, DEMO_PASSWORD);
    } catch {
      setAuthError("Couldn't reach the compliance checker backend. Make sure it's running, then retry.");
    } finally {
      setIsAuthenticating(false);
    }
  }, [login]);

  useEffect(() => {
    if (!token) {
      autoLogin();
    }
    // Only ever run the very first time there's no token — autoLogin itself
    // sets `token` on success, which must not re-trigger this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const username = useMemo(() => decodeToken(token)?.sub || null, [token]);

  const value = useMemo(
    () => ({
      token,
      username,
      isAuthenticated: Boolean(token),
      isAuthenticating,
      authError,
      login,
      logout,
      retry: autoLogin,
    }),
    [token, username, isAuthenticating, authError, login, logout, autoLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
