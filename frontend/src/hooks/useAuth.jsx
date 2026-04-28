import { useMemo } from "react";

/**
 * Decodes a JWT token payload without verifying signature.
 * Returns { id, username, email, iat, exp } or null if invalid/missing.
 */
function decodeToken(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    // Check if expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Hook that returns the current user from localStorage JWT.
 * Returns { user, token, isAuthenticated, logout }
 */
export function useAuth() {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("devsnippet_token")
    : null;

  const user = useMemo(() => decodeToken(token), [token]);

  const logout = () => {
    localStorage.removeItem("devsnippet_token");
    window.location.href = "/login";
  };

  return {
    user,
    token,
    isAuthenticated: !!user,
    logout,
  };
}
