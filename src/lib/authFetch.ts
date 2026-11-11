import { API_BASE } from "./constants";

/**
 * Authenticated fetch that attaches the stored JWT token.
 */
export function authFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
}
