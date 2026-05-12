import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  registerStudent: (data: { fullName: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  loginStudent: (data: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        api.setToken(token);
        const response = await api.getCurrentUser();
        if (response.data) {
          setUser(response.data);
        } else {
          await api.clearToken();
          setUser(null);
        }
      } else {
        // No token stored, user not logged in yet
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const registerStudent = async ({ fullName, email, password }: { fullName: string; email: string; password: string }) => {
    try {
      if (!email.toLowerCase().endsWith('@snsu.edu.ph')) {
        return { success: false, error: 'Please use your SNSU student email (@snsu.edu.ph)' };
      }

      const response = await api.register({ fullName, email, password });
      if (response.data) {
        await api.setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: response.error || 'Registration failed' };
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const loginStudent = async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await api.login(email, password);
      if (response.data) {
        await api.setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: response.error || 'Invalid email or password' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await api.clearToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, registerStudent, loginStudent, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
