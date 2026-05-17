import { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const AuthContext = createContext();

const clearAuthStorage = () => {
  const keys = ['token', 'user', 'authToken', 'accessToken', 'currentUser', 'taskflow-user', 'taskflow-token', 'auth-storage'];
  keys.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
  });
};

const getInitialState = () => {
  let user = null;
  let token = null;
  try {
    user = JSON.parse(localStorage.getItem('user')) || null;
    token = localStorage.getItem('token') || null;
    if (!user || !user._id || !token) {
      user = null;
      token = null;
    }
  } catch (e) {
    clearAuthStorage();
  }
  return {
    user,
    token,
    loading: true,
    error: null,
  };
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, getInitialState());
  const navigate = useNavigate();

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        clearAuthStorage();
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      try {
        const res = await API.get('/auth/me');
        const userData = res.data;
        if (!userData || !userData._id) {
          throw new Error('Corrupted user object');
        }
        localStorage.setItem('user', JSON.stringify(userData));
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: userData, token },
        });
      } catch {
        clearAuthStorage();
        dispatch({ type: 'AUTH_ERROR', payload: null });
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          navigate('/login', { replace: true });
        }
      }
    };
    loadUser();
  }, [navigate]);

  const signup = async (formData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await API.post('/auth/signup', formData);
      const { token, ...user } = res.data;
      clearAuthStorage();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, message };
    }
  };

  const login = async (formData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await API.post('/auth/login', formData);
      const { token, ...user } = res.data;
      clearAuthStorage();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, message };
    }
  };

  const logout = () => {
    clearAuthStorage();
    dispatch({ type: 'LOGOUT' });
    navigate('/login', { replace: true });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signup,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
