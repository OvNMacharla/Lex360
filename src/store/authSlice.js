import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase'; // Adjust path as needed
import ErrorHandler from '../utils/errorHandler';

// Async thunks for authentication with direct Firebase calls
export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('Attempting login with:', email);
      
      // Direct Firebase auth call
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.uid);
      
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      const user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        ...userData
      };
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      ErrorHandler.logError(error, { context: 'login_with_email' });
      return rejectWithValue(ErrorHandler.handleFirebaseError(error));
    }
  }
);

export const registerWithEmail = createAsyncThunk(
  'auth/registerWithEmail',
  async ({ email, password, userData }, { rejectWithValue }) => {
    try {
      console.log('Attempting registration with:', email);
      
      // Step 1: Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', userCredential.user.uid);

      // Step 2: Update user profile
      await updateProfile(userCredential.user, {
        displayName: userData.displayName,
      });
      console.log('Profile updated successfully');

      // Step 3: Save additional user data to Firestore
      const firestoreUserData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userData.displayName,
        role: userData.role,
        phoneNumber: userData.phoneNumber || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), firestoreUserData);
      console.log('User data saved to Firestore');

      // Step 4: Return user data for Redux state
      const user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        ...firestoreUserData
      };

      console.log('Registration completed successfully');
      return user;
      
    } catch (error) {
      console.error('Registration error:', error);
      ErrorHandler.logError(error, { context: 'register_with_email' });
      return rejectWithValue(ErrorHandler.handleFirebaseError(error));
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      // Note: Google Sign-In requires additional setup for React Native
      // You'll need to implement Google Sign-In separately
      // For now, return an error
      throw new Error('Google Sign-In not implemented yet');
    } catch (error) {
      ErrorHandler.logError(error, { context: 'login_with_google' });
      return rejectWithValue(ErrorHandler.handleFirebaseError(error));
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Attempting logout...');
      await signOut(auth);
      console.log('Logout successful');
      return;
    } catch (error) {
      console.error('Logout error:', error);
      ErrorHandler.logError(error, { context: 'logout' });
      return rejectWithValue(ErrorHandler.handleFirebaseError(error));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      console.log('Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully');
      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Password reset error:', error);
      ErrorHandler.logError(error, { context: 'reset_password' });
      return rejectWithValue(ErrorHandler.handleFirebaseError(error));
    }
  }
);

const initialState = {
  user: null,
  loading: false, // Changed from isLoading to loading to match your component
  isAuthenticated: false,
  error: null,
  resetPasswordStatus: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.resetPasswordStatus = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearResetPasswordStatus: (state) => {
      state.resetPasswordStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login with email
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register with email
      .addCase(registerWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerWithEmail.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(registerWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login with Google
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.resetPasswordStatus = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetPasswordStatus = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser, setLoading, clearError, clearResetPasswordStatus } = authSlice.actions;
export default authSlice.reducer;