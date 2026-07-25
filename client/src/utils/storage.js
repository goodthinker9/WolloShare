/**
 * Utility helpers for reading / writing authentication data
 * to/from localStorage.
 */

const TOKEN_KEY = 'wolloshare_token';
const USER_KEY  = 'wolloshare_user';

/** ── Token ─────────────────────────────────────────────────── */

export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/** ── User ──────────────────────────────────────────────────── */

export const saveUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

/** ── Convenience ──────────────────────────────────────────── */

export const clearAuth = () => {
  removeToken();
  removeUser();
};

