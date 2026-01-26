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

  // Set initial loading state
  useEffect(() => {
    setLoading(false);
  }, []);

  // Derive userRole from user metadata or profile
  const getUserRole = (authUser, profile) => {
    // Check user metadata first (most reliable)
    if (authUser?.user_metadata?.role) {
      return authUser.user_metadata.role;
    }
    
    // Fallback to profile table
    if (profile?.role) {
      return profile.role;
    }
    
    // Default to customer if no role is found
    return 'customer';
  };

  // Load user profile from database
  const loadUserProfile = async (userId) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // This is not a critical error, but good to log
        console.warn('Could not fetch user profile:', error.message);
        setUserProfile(null); // Ensure profile is cleared if fetch fails
      } else if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Profile load error:', error);
    }
  };

  // Listen for Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      const sessionUser = session?.user || null;
      setUser(sessionUser);

      if (sessionUser) {
        await loadUserProfile(sessionUser.id);
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      return { data, error };
    },
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        
        // Clear state regardless of error
        setUser(null);
        setUserProfile(null);
        
        if (error) {
          console.error('Sign out error:', error);
        }
        
        return { error };
      } catch (err) {
        console.error('Critical sign out error:', err);
        // Force clear state on error
        setUser(null);
        setUserProfile(null);
        return { error: err };
      }
    },
    resetPassword: async (email) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      return { data, error };
    },
    updatePassword: async (newPassword) => {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      return { data, error };
    },
    updateProfile: async (updates) => {
      if (!user) return { error: { message: 'No user logged in' } };
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();
        
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