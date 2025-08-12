import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

class AuthService {
  // Register with email and password
  async registerWithEmail(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName
        });
      }
      
      // Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: userData.displayName || '',
        role: userData.role || 'client',
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  // Login with email and password
  async loginWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Get user profile from Firestore
  async getUserProfile(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
      }
      return { success: false, error: 'User profile not found' };
    } catch (error) {
      console.error('Get user profile error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  // Helper method to get user-friendly error messages
  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }
}

export default new AuthService();