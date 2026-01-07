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
  const supabase = createClient();

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

  useEffect(() => {
    // Check active sessions and sets the user
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session?.user?.id);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription }
    } = supabase?.auth?.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session?.user?.id);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [supabase]);

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