'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PropTypes from 'prop-types';
import { generateDeterministicMockUUID } from '@/utils/mockData';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const supabase = createClient();

  // Hydrate from localStorage only on client mount
  useEffect(() => {
    try {
      const stored = localStorage?.getItem('vf_session');
      if (stored) {
        const { user: storedUser, userProfile: storedProfile } = JSON.parse(stored);
        // Validate UUID format - if it's invalid, clear and skip hydration
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (storedUser?.id && !uuidRegex.test(storedUser.id) && !storedUser?.isMockUser) {
          // Invalid UUID and not flagged as mock user, clear the session
          localStorage.removeItem('vf_session');
        } else {
          setUser(storedUser);
          setUserProfile(storedProfile);
        }
      }
    } catch (err) {
      console.error('Hydration error:', err);
      // Clear corrupted session
      try {
        localStorage.removeItem('vf_session');
      } catch (e) {
        console.error('Failed to clear corrupted session:', e);
      }
    } finally {
      setIsHydrated(true);
      setLoading(false);
    }
  }, []);

  // Mock login with persistence
  // Uses deterministic UUID based on email for consistency across sessions
  const mockLogin = (email, userType) => {
    const userId = generateDeterministicMockUUID(email);
    const mockUser = {
      id: userId,
      email,
      user_metadata: { role: userType },
      isMockUser: true // Flag to identify mock users
    };
    const mockProfile = {
      id: userId,
      email,
      first_name: userType === 'admin' ? 'Admin' : 'Customer',
      role: userType,
      isMockUser: true // Flag to identify mock users
    };
    
    setUser(mockUser);
    setUserProfile(mockProfile);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('vf_session', JSON.stringify({ user: mockUser, userProfile: mockProfile, isMockSession: true }));
      } catch (err) {
        console.error('Session save error:', err);
      }
    }
  };

  const mockLogout = () => {
    setUser(null);
    setUserProfile(null);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('vf_session');
      } catch (err) {
        console.error('Session clear error:', err);
      }
    }
  };

  // Derive userRole from user metadata or profile
  const getUserRole = (authUser, profile) => {
    // Check user metadata first
    if (authUser?.user_metadata?.role) {
      return authUser?.user_metadata?.role;
    }
    
    // Check if email suggests admin
    if (authUser?.email?.includes('admin')) {
      return 'admin';
    }
    
    // Check profile for role information
    if (profile?.role) {
      return profile?.role;
    }
    
    // Default to customer
    return 'customer';
  };

  // Load user profile from database
  const loadUserProfile = async (userId) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('id', userId)
        ?.single();
      
      if (!error && data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Profile load error:', error);
    }
  };

  // Skip Supabase auth checks when using mock auth
  useEffect(() => {
    if (!isHydrated) return;
    
    // If we have a mock user, don't check Supabase
    if (user?.isMockUser) {
      return;
    }

    // Listen for Supabase auth changes only if not using mock auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, [supabase, isHydrated, user?.id]);

  // Derive userRole from user and userProfile
  const userRole = user ? getUserRole(user, userProfile) : null;

  const value = {
    user: user ? {
      ...user,
      name: userProfile?.first_name || user?.email?.split('@')?.[0] || 'User',
      email: user?.email
    } : null,
    userProfile,
    userRole,
    loading,
    isAuthenticated: !!user,
    mockLogin,
    mockLogout,
    signUp: async (email, password, metadata = {}) => {
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      return { data, error };
    },
    signIn: async (email, password) => {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      });
      return { data, error };
    },
    signOut: async () => {
      const { error } = await supabase?.auth?.signOut();
      if (!error) {
        setUser(null);
        setUserProfile(null);
      }
      return { error };
    },
    resetPassword: async (email) => {
      const { data, error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window.location?.origin}/reset-password`
      });
      return { data, error };
    },
    updatePassword: async (newPassword) => {
      const { data, error } = await supabase?.auth?.updateUser({
        password: newPassword
      });
      return { data, error };
    },
    updateProfile: async (updates) => {
      if (!user) return { error: { message: 'No user logged in' } };
      
      try {
        const { data, error } = await supabase
          ?.from('user_profiles')
          ?.update(updates)
          ?.eq('id', user?.id)
          ?.select()
          ?.single();
        
        if (!error && data) {
          setUserProfile(data);
        }
        return { data, error };
      } catch (error) {
        return { error: { message: 'Network error. Please try again.' } };
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes?.node?.isRequired
};