'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

// Импортируем тип User из api.ts
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  role: 'applicant' | 'employer';
  avatar?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  isVerified: boolean;
  wallet: {
    balance: number;
    currency: string;
  };
  stats?: {
    totalJobs: number;
    averageRating: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    companyName?: string;
    role: 'applicant' | 'employer';
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }
        
        const token = localStorage.getItem('jobpop_token');
        if (token) {
          // For now, skip API call to avoid errors with mock server
          // In production, this would call api.getCurrentUser()
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jobpop_token');
        }
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      if (response.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    companyName?: string;
    role: 'applicant' | 'employer';
  }) => {
    try {
      const response = await api.register(userData);
      if (response.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user state even if API call fails
      setUser(null);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await api.updateProfile(userData);
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
