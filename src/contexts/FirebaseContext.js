import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { setUser, setLoading, clearUser } from '../store/authSlice';
import { clearUserData } from '../store/userSlice';
import authService from '../services/auth/authService';

const FirebaseContext = createContext({});

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      dispatch(setLoading(true));
      
      try {
        if (user) {
          console.log('User authenticated:', user.uid);
          
          // Get user profile
          const profileResult = await authService.getUserProfile(user.uid);
          
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
          };

          if (profileResult.success) {
            userData.profile = profileResult.data;
          }

          dispatch(setUser(userData));
        } else {
          console.log('User not authenticated');
          dispatch(clearUser());
          dispatch(clearUserData());
        }
      } catch (error) {
        console.error('Auth state error:', error);
        dispatch(clearUser());
      } finally {
        dispatch(setLoading(false));
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return (
    <FirebaseContext.Provider value={{}}>
      {children}
    </FirebaseContext.Provider>
  );
};