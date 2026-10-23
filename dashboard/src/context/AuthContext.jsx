import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sg_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sg_token'));
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Verify token on mount to avoid stale sessions
  useEffect(() => {
    let isMounted = true;
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('sg_token');
      if (storedToken) {
        try {
          const { data } = await api.get('/auth/me');
          if (isMounted && data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('sg_user', JSON.stringify(data.user));
          }
        } catch {
          // Token is expired or invalid
          if (isMounted) {
            localStorage.removeItem('sg_token');
            localStorage.removeItem('sg_user');
            setToken(null);
            setUser(null);
          }
        }
      }
      if (isMounted) {
        setAuthChecking(false);
      }
    };

    verifyToken();
    return () => { isMounted = false; };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success && data.token && data.user) {
        localStorage.setItem('sg_token', data.token);
        localStorage.setItem('sg_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sg_token');
    localStorage.removeItem('sg_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authChecking,
        login,
        logout,
        isAuthenticated: !!token && !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
