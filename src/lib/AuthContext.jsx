import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { id: firebaseUser.uid, ...userDoc.data(), firebaseUid: firebaseUser.uid };
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // New user - prompt profile completion
            setUser({ id: firebaseUser.uid, firebaseUid: firebaseUser.uid, account_status: 'pending' });
            setIsAuthenticated(false);
            setAuthError({ type: 'profile_pending', message: 'Complete profile' });
          }
        } catch (err) {
          console.error('User profile fetch error:', err);
          setAuthError({ type: 'profile_error' });
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
      }
      setIsLoadingAuth(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const completeProfile = async (profileData) => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const userRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userRef, {
        ...profileData,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
account_status: /^[A-Za-z]{2}\\d{5}$/.test(profileData.id_number) ? 'approved' : 'pending',
        role: 'reviewee',
        created_at: serverTimestamp()
      }, { merge: true });
      // Refresh
      window.location.reload();
    }
  };

  const navigateToLogin = () => {
    // Firebase handles redirect
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      authError,
      logout,
      completeProfile,
      navigateToLogin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
