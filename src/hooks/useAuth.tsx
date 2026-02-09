'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Types
export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  providerToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'github') => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isGitHubConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to map Supabase user to our User type
function mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
    image: supabaseUser.user_metadata?.avatar_url,
  };
}

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(mapSupabaseUser(supabaseUser));
        // Store provider token if available (for GitHub API access)
        if (session?.provider_token) {
          setProviderToken(session.provider_token);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(mapSupabaseUser(session?.user ?? null));
      setLoading(false);

      // Store provider token if available
      if (session?.provider_token) {
        setProviderToken(session.provider_token);
      } else if (event === 'SIGNED_OUT') {
        setProviderToken(null);
      }

      if (event === 'SIGNED_IN') {
        router.refresh();
      } else if (event === 'SIGNED_OUT') {
        router.push('/');
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setUser(mapSupabaseUser(data.user));
      router.push('/editor');
      router.refresh();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithProvider = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      const options: { redirectTo: string; scopes?: string } = {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      };

      // Request repo scope for GitHub to access user's repositories
      if (provider === 'github') {
        options.scopes = 'repo read:user';
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
        },
      });

      if (error) {
        throw error;
      }

      // If email confirmation is required, notify user
      if (data.user && !data.session) {
        // Email confirmation required
        throw new Error('Please check your email to confirm your account.');
      }

      setUser(mapSupabaseUser(data.user));
      router.push('/editor');
      router.refresh();
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        providerToken,
        login,
        loginWithProvider,
        signup,
        logout,
        isAuthenticated: !!user,
        isGitHubConnected: !!providerToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
