import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '../appwriteConfig';
import { ID } from 'appwrite';
import { createProfile, getProfile, updateProfile as updateProfileInDb } from '../services/appwriteService';

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
        const currentUser = await account.get();
        if (currentUser) {
          setUser(currentUser);
          const userProfile = await getProfile(currentUser.$id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();
  }, []);

  // Sign Up with Email
  const signUp = async (phone, password, userData) => {
    try {
      setLoading(true);
      const cleanPhone = phone.trim().replace(/\s/g, '');
      const dummyEmail = `${cleanPhone}@sabeel.com`;
      const fullName = `${userData.firstName} ${userData.middleName} ${userData.lastName}`.trim();
      
      // 1. Create auth user
      const authData = await account.create(
        ID.unique(),
        dummyEmail,
        password,
        fullName
      );

      // 2. Create profile in database
      const { error: profileError } = await createProfile({
        id: authData.$id,
        email: dummyEmail,
        name: fullName,
        phone: cleanPhone,
        birthdate: userData.birthdate,
        gender: userData.gender,
        governorate: userData.governorate,
        center: userData.center,
        school: userData.school || '',
        bio: userData.bio || '',
        grade: userData.grade || '',
        role: 'student',
        status: 'pending',
        accountStatus: 'pending',
        profilePictureUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authData.$id,
        avatar_url: userData.avatar_url || null
      });

      if (profileError) throw new Error(profileError);

      return { success: true, user: authData };
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
      
      await account.createEmailPasswordSession(dummyEmail, password);
      const currentUser = await account.get();

      const userProfile = await getProfile(currentUser.$id);
      
      setUser(currentUser);
      setProfile(userProfile);

      return { 
        success: true, 
        user: currentUser,
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
      await account.deleteSession('current');
      
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
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );

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

      const { success, error } = await updateProfileInDb(user.$id, updates);

      if (!success) throw new Error(error);

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