import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const AuthContext = createContext(null);

// Purge every possible auth storage key
const clearAllAuthStorage = () => {
  const keys = [
    'token', 'user', 'authToken', 'accessToken',
    'currentUser', 'taskflow-user', 'taskflow-token', 'auth-storage',
  ];
  keys.forEach((k) => {
    try { localStorage.removeItem(k); } catch (_) {}
    try { sessionStorage.removeItem(k); } catch (_) {}
  });
  try { sessionStorage.clear(); } catch (_) {}
};

// Safely read stored token and user, discard if malformed
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

  // On mount, verify token with backend
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
        if (!data || !data._id) throw new Error('Bad user object');
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setToken(storedToken);
      } catch {
        clearAllAuthStorage();
        setUser(null);
        setToken(null);
        // Redirect only if not already on a public page
        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/signup'
        ) {
          navigate('/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await API.post('/auth/login', formData);
      const { token: newToken, ...userData } = data;
      clearAllAuthStorage();
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await API.post('/auth/signup', formData);
      const { token: newToken, ...userData } = data;
      clearAllAuthStorage();
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------------------------------------------------
  // LOGOUT — the key fix:
  // 1. Wipe storage FIRST so PrivateRoute immediately sees no token.
  // 2. Reset state synchronously so React re-renders PrivateRoute → /login.
  // 3. Defer navigate() one tick so any open dropdown portals can unmount
  //    cleanly before we swap the route tree.
  // -----------------------------------------------------------------------
  const logout = useCallback(() => {
    clearAllAuthStorage();
    setToken(null);
    setUser(null);
    setError(null);
    // Tiny timeout lets the dropdown portal close gracefully before navigation
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 0);
  }, [navigate]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, signup, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
