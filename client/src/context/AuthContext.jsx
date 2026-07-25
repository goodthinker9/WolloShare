import { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { saveToken, getToken, removeToken, saveUser, getUser, removeUser } from '../utils/storage';
import api from '../services/api';

/**
 * AuthContext provides the authentication surface for the entire app:
 *
 *  - user     – the decoded user object (or null)
 *  - token    – the raw JWT string (or null)
 *  - loading  – true while the initial auth state is being recovered
 *  - login()  – sends credentials to the backend, persists the response on success
 *  - logout() – clears credentials and resets state
 */

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]    = useState(() => getUser());
  const [token, setToken]  = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  // ── Recover persisted session on mount ──────────────────────────
  useEffect(() => {
    const storedToken = getToken();
    const storedUser  = getUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      // Clean up partial / stale data
      removeToken();
      removeUser();
    }
    setLoading(false);
  }, []);

  // ── Login (calls backend API) ──────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });

    // Backend wraps the response in { success, message, data: { token, user } }
    const responseData = data.data;
    const receivedToken = responseData.token;
    const receivedUser  = responseData.user;

    saveToken(receivedToken);
    saveUser(receivedUser);

    setToken(receivedToken);
    setUser(receivedUser);

    return receivedUser;
  }, []);

  // ── Logout (clears everything) ─────────────────────────────────
  const logout = useCallback(() => {
    removeToken();
    removeUser();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

