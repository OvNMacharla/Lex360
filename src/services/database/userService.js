import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAt,
  endAt
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';

class UserService {
  // Get user profile
  async getUserProfile(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
      }
      return { success: false, error: 'User not found' };
    } catch (error) {
      console.error('Get user profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user profile
  async updateUserProfile(userId, updateData) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Upload profile image
  async uploadProfileImage(userId, imageUri) {
    try {
      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Upload to Firebase Storage
      const imageRef = ref(storage, `profile_images/${userId}_${Date.now()}`);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      
      // Update user profile
      await this.updateUserProfile(userId, { photoURL: downloadURL });
      
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('Upload image error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get lawyers
  async getLawyers(filters = {}) {
    try {
      let q = query(collection(db, 'users'), where('role', '==', 'lawyer'));
      
      if (filters.specialization) {
        q = query(q, where('specializations', 'array-contains', filters.specialization));
      }

      const querySnapshot = await getDocs(q);
      const lawyers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: lawyers };
    } catch (error) {
      console.error('Get lawyers error:', error);
      return { success: false, error: error.message };
    }
  }

  // Search users
  async searchUsers(searchTerm, userType = null) {
    try {
      let q = collection(db, 'users');
      
      if (userType) {
        q = query(q, where('role', '==', userType));
      }
      
      q = query(
        q,
        orderBy('displayName'),
        startAt(searchTerm),
        endAt(searchTerm + '\uf8ff'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: users };
    } catch (error) {
      console.error('Search users error:', error);
      return { success: false, error: error.message };
    }
  }

  // Save Expo push token
  async saveExpoPushToken(userId, token) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        expoPushToken: token,
        lastTokenUpdate: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Save push token error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new UserService();