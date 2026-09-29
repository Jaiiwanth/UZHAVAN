'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, supabaseService } from '@/lib/supabase/service';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
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
      const current = await supabaseService.getCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Initial check
    supabaseService.getCurrentUser().then((current) => {
      if (isMounted) {
        setUser(current);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setUser(null);
        setLoading(false);
      }
    });

    // Supabase auth subscription for real session persistence
    const supabase = getSupabaseBrowserClient();
    let authSubscription: { unsubscribe: () => void } | null = null;

    if (supabase && isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            const current = await supabaseService.getCurrentUser();
            if (isMounted) setUser(current);
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) setUser(null);
        }
      });
      authSubscription = data.subscription;
    }

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { user: authedUser, error } = await supabaseService.signInWithEmail(email, password);
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
    const { user: newUser, error } = await supabaseService.signUpWithEmail(email, password, fullName);
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
    await supabaseService.signOut();
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
