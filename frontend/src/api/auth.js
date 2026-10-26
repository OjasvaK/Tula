import { apiClient } from "./client";

// The backend's /login is a FastAPI OAuth2PasswordRequestForm endpoint, so
// it expects application/x-www-form-urlencoded, not JSON.
export async function login(username, password) {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  const response = await apiClient.post("/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data; // { access_token, token_type }
}

/** Decode a JWT payload without verifying it (client-side display only). */
export function decodeToken(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

