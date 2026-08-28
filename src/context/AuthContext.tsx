import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthSession } from '../types';
import {
  api,
  getActiveApiUrl,
  setCustomApiUrl as saveCustomApiUrl,
  isUsingSimulation,
  setSimulationMode
} from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isDemoMode: boolean;
  apiUrl: string;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; message: string }>;
  register: (data: { nama: string; nis: string; email: string; password: string; kelas: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateApiUrl: (url: string) => void;
  toggleDemoMode: (enabled: boolean) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'perpus_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiUrl, setApiUrl] = useState<string>(getActiveApiUrl());
  const [isDemoMode, setIsDemoMode] = useState<boolean>(isUsingSimulation());

  // Restore session from localStorage on initial load
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedSession) {
        const parsed: AuthSession = JSON.parse(storedSession);
        if (parsed && parsed.user && parsed.token) {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      }
    } catch (e) {
      console.error('Gagal membaca sesi login:', e);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (identifier: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(identifier, pass);
      if (res.success && res.data) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.data));
        return { success: true, message: res.message };
      } else {
        return { success: false, message: res.message || 'Login gagal' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Terjadi kesalahan sistem' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { nama: string; nis: string; email: string; password: string; kelas: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      return { success: res.success, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Pendaftaran gagal' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateApiUrl = (newUrl: string) => {
    saveCustomApiUrl(newUrl);
    setApiUrl(getActiveApiUrl());
    setIsDemoMode(isUsingSimulation());
  };

  const toggleDemoMode = (enabled: boolean) => {
    setSimulationMode(enabled);
    setIsDemoMode(enabled);
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const usersRes = await api.getUsers(user.role === 'guru' ? user.user_id : '');
      if (usersRes.success && usersRes.data) {
        const found = usersRes.data.find(u => u.user_id === user.user_id);
        if (found) {
          setUser(found);
          const currentSession = localStorage.getItem(AUTH_STORAGE_KEY);
          if (currentSession) {
            const parsed = JSON.parse(currentSession);
            parsed.user = found;
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
          }
        }
      }
    } catch (e) {
      console.error('Refresh user gagal:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isDemoMode,
        apiUrl,
        login,
        register,
        logout,
        updateApiUrl,
        toggleDemoMode,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
