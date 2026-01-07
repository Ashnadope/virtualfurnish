'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // Derive userRole from user metadata or email
  const getUserRole = (authUser, profile) => {
    // Check user metadata first
    if (authUser?.user_metadata?.role) {
      return authUser?.user_metadata?.role;
    }
    
    // Check if email suggests admin (e.g., contains 'admin' or specific domain)
    if (authUser?.email?.includes('admin')) {
      return 'admin';
    }
    
    // Check profile for role information
    if (profile?.role) {
      return profile?.role;
    }
    
    // Default to customer
    return 'customer';
  }

  const profileOperations = {
    async load(userId) {
      if (!userId) return
      setProfileLoading(true)
      try {
        const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single()
        if (!error) setUserProfile(data)
      } catch (error) {
        console.error('Profile load error:', error)
      } finally {
        setProfileLoading(false)
      }
    },
    clear() {
      setUserProfile(null)
      setProfileLoading(false)
    },
  }

  const authStateHandlers = {
    onChange: (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) profileOperations?.load(session?.user?.id)
      else profileOperations?.clear()
    },
  }

  useEffect(() => {
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      authStateHandlers?.onChange(null, session)
    })

    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      authStateHandlers?.onChange
    )

    return () => subscription?.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase?.auth?.signOut()
      if (!error) {
        setUser(null)
        profileOperations?.clear()
      }
      return { error }
    } catch {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'No user logged in' } }
    try {
      const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single()
      if (!error) setUserProfile(data)
      return { data, error }
    } catch {
      return { error: { message: 'Network error. Please try again.' } }
    }
  }

  // Derive userRole from user and userProfile
  const userRole = getUserRole(user, userProfile);

  const value = {
    user: user ? {
      ...user,
      name: userProfile?.first_name || user?.email?.split('@')?.[0] || 'User',
      email: user?.email
    } : null,
    userProfile,
    userRole,
    loading,
    profileLoading,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}