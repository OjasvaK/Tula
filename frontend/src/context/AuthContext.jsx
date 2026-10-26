import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { decodeToken, login as loginRequest } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password);
    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    setToken(null);
  }, []);

  const username = useMemo(() => decodeToken(token)?.sub || null, [token]);

  const value = useMemo(
    () => ({ token, username, isAuthenticated: Boolean(token), login, logout }),
    [token, username, login, logout]
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
