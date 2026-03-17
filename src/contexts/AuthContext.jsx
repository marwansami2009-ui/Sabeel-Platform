import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '../appwriteConfig';
import { ID } from 'appwrite';
import { createProfile, getProfile, updateProfile as updateProfileInDb, validateStudentCenterCode } from '../services/appwriteService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions — always fetch FRESH profile from Appwrite (no caching)
    const getInitialSession = async () => {
      try {
        const currentUser = await account.get();
        if (currentUser) {
          // Always fetch fresh profile from DB — never rely on cached state
          const userProfile = await getProfile(currentUser.$id);
          
          if (!userProfile) {
            // No profile at all — orphan session, destroy it
            try { await account.deleteSession('current'); } catch(_) {}
            setUser(null);
            setProfile(null);
          } else {
            // Always set user & profile — let App.jsx ProtectedRoute handle pending/active gating
            setUser(currentUser);
            setProfile(userProfile);
          }
        }
      } catch (error) {
        // Silently handle 401 (no active session) — this is normal on fresh page load
        if (error?.code !== 401) {
          console.error('Error getting session:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();
  }, []);

  // Sign Up with Email
  // IMPORTANT: This function intentionally does NOT touch global state (user, profile, loading)
  // to prevent PublicRoute from detecting a state change and redirecting away from the success screen.
  const signUp = async (phone, password, userData) => {
    try {
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
        firstName: userData.firstName,
        middleName: userData.middleName,
        lastName: userData.lastName,
        phone: cleanPhone,
        birthdate: userData.birthdate,
        gender: userData.gender,
        governorate: userData.governorate,
        center: userData.center,
        school: userData.school || '',
        bio: userData.bio || '',
        father_phone: userData.father_phone || '',
        mother_phone: userData.mother_phone || '',
        grade: userData.grade || '',
        role: 'student',
        status: 'pending',
        accountStatus: 'pending',
        profilePictureUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authData.$id,
        avatar_url: userData.avatar_url || null
      });

      // 3. Immediately destroy any session Appwrite may have auto-created
      try { await account.deleteSession('current'); } catch (_) {}

      if (profileError) throw new Error(profileError);

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
    // NOTE: No setLoading here — loading is managed locally in Login.jsx
  };

  // Sign In with Phone
  const signIn = async (phone, password) => {
    try {
      setLoading(true);
      const cleanPhone = phone.trim().replace(/\s/g, '');
      const dummyEmail = `${cleanPhone}@sabeel.com`;
      
      const newSession = await account.createEmailPasswordSession(dummyEmail, password);
      const currentUser = await account.get();

      // ── Single-Device Policy: kill all OTHER active sessions ──
      try {
        const allSessions = await account.listSessions();
        const killPromises = allSessions.sessions
          .filter(s => s.$id !== newSession.$id)
          .map(s => account.deleteSession(s.$id).catch(() => {}));
        await Promise.all(killPromises);
      } catch (_) { /* non-fatal */ }

      // Always fetch FRESH profile
      const userProfile = await getProfile(currentUser.$id);
      
      if (!userProfile) {
          await account.deleteSession('current');
          return { success: false, error: 'لم يتم العثور على بيانات الحساب، يرجى التواصل مع الدعم.' };
      }

      // Check pending — keep session alive but show the pending message
      if (userProfile.accountStatus === 'pending') {
          setUser(currentUser);
          setProfile(userProfile);
          return { success: false, pending: true, error: 'حسابك قيد المراجعة، سيتم تفعيله قريباً' };
      }

      setUser(currentUser);
      setProfile(userProfile);

      return { 
        success: true, 
        user: currentUser,
        profile: userProfile
      };
    } catch (error) {
      console.error('Sign in error:', error);
      let errMsg = 'حدث خطأ، حاول مرة أخرى';
      const msg = error.message?.toLowerCase() || '';

      if (msg.includes('user') || msg.includes('not found')) {
        errMsg = 'الحساب غير موجود، سجل حساباً جديداً';
      } else if (error.code === 401 || msg.includes('credentials') || msg.includes('password')) {
        errMsg = 'الباسورد غير صحيح، تأكد وحاول ثانية';
      }

      return { success: false, error: errMsg };
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

  // Login with Center Code
  const loginWithCenterCode = async (phone, code) => {
    try {
      setLoading(true);
      const cleanPhone = phone.trim().replace(/\s/g, '');
      const dummyEmail = `${cleanPhone}@sabeel.com`;

      // 1. Validate Code
      const { success: codeValid, data: codeData, error: codeError } = await validateStudentCenterCode(cleanPhone, code);
      if (!codeValid) throw new Error(codeError);

      try {
        // Try sign in first
        await account.createEmailPasswordSession(dummyEmail, code);
      } catch (signInErr) {
        // If sign in fails, create account and try again
        const authData = await account.create(ID.unique(), dummyEmail, code, codeData.student_name || 'طالب كود سنتر');
        
        // Ensure profile exists
        await account.createEmailPasswordSession(dummyEmail, code); // Login after creation
        
        const names = (codeData.student_name || 'طالب كود سنتر').split(' ');
        const firstName = names[0] || 'طالب';
        const middleName = names.length > 2 ? names.slice(1, -1).join(' ') : (names[1] || 'كود');
        const lastName = names.length > 1 ? names[names.length - 1] : 'سنتر';

        const { error: profileError } = await createProfile({
          id: authData.$id,
          email: dummyEmail,
          firstName,
          middleName,
          lastName,
          phone: cleanPhone,
          role: 'student',
          status: 'active', // Important: Make them active immediately
          accountStatus: 'active',
          profilePictureUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authData.$id
        });
      }

      const currentUser = await account.get();
      const userProfile = await getProfile(currentUser.$id);

      setUser(currentUser);
      setProfile(userProfile);

      return { success: true, user: currentUser, profile: userProfile };
    } catch (error) {
      console.error('Center code login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
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
    updateProfile,
    loginWithCenterCode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};