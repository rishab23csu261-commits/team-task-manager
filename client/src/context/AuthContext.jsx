import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export const AuthContext = createContext(null);

const clearAllAuthStorage = () => {
  ['token', 'user', 'authToken', 'accessToken', 'currentUser',
   'taskflow-user', 'taskflow-token', 'auth-storage'].forEach((k) => {
    try { localStorage.removeItem(k); } catch (_) {}
    try { sessionStorage.removeItem(k); } catch (_) {}
  });
  try { sessionStorage.clear(); } catch (_) {}
};

const readStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const raw   = localStorage.getItem('user');
    const user  = raw ? JSON.parse(raw) : null;
    if (!token || !user || !user._id) {
      clearAllAuthStorage();
      return { token: null, user: null };
    }
    return { token, user };
  } catch (_) {
    clearAllAuthStorage();
    return { token: null, user: null };
  }
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const initial = readStorage();

  const [user,    setUser]    = useState(initial.user);
  const [token,   setToken]   = useState(initial.token);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        clearAllAuthStorage();
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await API.get('/auth/me');
        if (!data?._id) throw new Error('Bad user object');
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setToken(storedToken);
      } catch (err) {
        // Only clear session on explicit 401/403 — not on network timeouts
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          clearAllAuthStorage();
          setUser(null);
          setToken(null);
          const isPublic =
            window.location.pathname === '/login' ||
            window.location.pathname === '/signup';
          if (!isPublic) navigate('/login', { replace: true });
        }
        // Network error: keep token — user stays logged in
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (formData) => {
    setError(null);
    try {
      const { data } = await API.post('/auth/login', formData);
      const { token: newToken, ...userData } = data;
      clearAllAuthStorage();
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please check your details.';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const signup = useCallback(async (formData) => {
    setError(null);
    try {
      const { data } = await API.post('/auth/signup', formData);
      const { token: newToken, ...userData } = data;
      clearAllAuthStorage();
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Signup failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    clearAllAuthStorage();
    setToken(null);
    setUser(null);
    setError(null);
    setTimeout(() => navigate('/login', { replace: true }), 0);
  }, [navigate]);

  const clearError = useCallback(() => setError(null), []);

  // Allow pages (e.g. Profile) to push updated user data into context + localStorage
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, signup, logout, clearError, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
