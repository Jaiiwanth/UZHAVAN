'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, localService } from '@/lib/service';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const current = await localService.getCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Load active session from local storage
    localService
      .getCurrentUser()
      .then((current) => {
        if (isMounted) {
          setUser(current);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { user: authedUser, error } = await localService.signInWithEmail(email, password);
    setLoading(false);

    if (error || !authedUser) {
      return { success: false, error: error || 'Failed to authenticate.' };
    }

    setUser(authedUser);
    router.push('/dashboard');
    return { success: true };
  };

  const signup = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    const { user: newUser, error } = await localService.signUpWithEmail(email, password, fullName);
    setLoading(false);

    if (error || !newUser) {
      return { success: false, error: error || 'Failed to register.' };
    }

    setUser(newUser);
    router.push('/dashboard');
    return { success: true };
  };

  const logout = async () => {
    setLoading(true);
    await localService.signOut();
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
