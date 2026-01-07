
'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
                  