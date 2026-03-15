import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { createProfile, getProfile } from '../services/supabaseService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          const userProfile = await getProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session);
      
      if (session?.user) {
        setUser(session.user);
        const userProfile = await getProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign Up with Email
  const signUp = async (phone, password, userData) => {
    try {
      setLoading(true);
      const cleanPhone = phone.trim().replace(/\s/g, '');
      const dummyEmail = `${cleanPhone}@sabeel.com`;
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dummyEmail,
        password,
        options: {
          data: {
            name: userData.name,
            phone: cleanPhone
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create profile in database
        const { error: profileError } = await createProfile({
          id: authData.user.id,
          email: dummyEmail,
          name: userData.name,
          phone: cleanPhone,
          grade: userData.grade,
          role: 'student',
          status: 'pending',
          avatar_url: userData.avatar_url || null
        });

        if (profileError) throw profileError;

        // 3. Fetch the created profile
        const newProfile = await getProfile(authData.user.id);
        setProfile(newProfile);
      }

      return { success: true, user: authData.user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign In with Phone
  const signIn = async (phone, password) => {
    try {
      setLoading(true);
      const cleanPhone = phone.trim().replace(/\s/g, '');
      const dummyEmail = `${cleanPhone}@sabeel.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password
      });

      if (error) throw error;

      // Profile will be set by onAuthStateChange
      // Fetch profile to check status immediately
      const userProfile = await getProfile(data.user.id);
      
      return { 
        success: true, 
        user: data.user,
        profile: userProfile
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };


  // Sign Out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update Profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile
      setProfile(prev => ({ ...prev, ...updates }));
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};