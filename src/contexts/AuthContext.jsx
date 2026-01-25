'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PropTypes from 'prop-types';

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
        if (storedUser?.id && !uuidRegex.test(storedUser.id)) {
          // Invalid UUID, clear the session
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



  // Derive userRole from user metadata or profile
  const getUserRole = (authUser, profile) => {
    // Check user metadata first
    if (authUser?.user_metadata?.role) {
      return authUser?.user_metadata?.role;
    }
    
    // Check profile for role information
    if (profile?.role) {
      return profile?.role;
    }
    
    // Check if email suggests admin (email contains 'admin')
    if (authUser?.email?.toLowerCase()?.includes('admin')) {
      return 'admin';
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

  // Listen for Supabase auth state changes
  useEffect(() => {
    if (!isHydrated) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only update user if session actually exists
      if (session?.user) {
        setUser(session.user);
        if (session.user.id) {
          loadUserProfile(session.user.id);
        }
      } else {
        // No session, clear user and profile
        setUser(null);
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
      // Clear localStorage first
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('vf_session');
        } catch (err) {
          console.error('Session clear error:', err);
        }
      }
      
      // Then call Supabase signOut
      try {
        const { error } = await supabase.auth.signOut();
        
        // Clear state regardless of error
        setUser(null);
        setUserProfile(null);
        
        return { error };
      } catch (err) {
        console.error('Logout error:', err);
        // Force clear state on error
        setUser(null);
        setUserProfile(null);
        return { error: err };
      }
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