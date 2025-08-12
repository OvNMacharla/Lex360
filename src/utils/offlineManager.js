import { firestore } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineManager {
  constructor() {
    this.firestore = firestore();
    this.enableOfflineSupport();
  }

  // Enable Firestore offline support
  enableOfflineSupport() {
    this.firestore.settings({
      persistence: true,
      cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED
    });
  }

  // Cache critical data
  async cacheUserData(userId) {
    try {
      // Cache user profile
      const userDoc = await this.firestore.collection('users').doc(userId).get();
      if (userDoc.exists) {
        await AsyncStorage.setItem(`user_${userId}`, JSON.stringify(userDoc.data()));
      }

      // Cache user cases
      const casesSnapshot = await this.firestore
        .collection('cases')
        .where('clientId', '==', userId)
        .get();
      
      const cases = casesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      await AsyncStorage.setItem(`cases_${userId}`, JSON.stringify(cases));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get cached data when offline
  async getCachedUserData(userId) {
    try {
      const userData = await AsyncStorage.getItem(`user_${userId}`);
      const casesData = await AsyncStorage.getItem(`cases_${userId}`);

      return {
        success: true,
        user: userData ? JSON.parse(userData) : null,
        cases: casesData ? JSON.parse(casesData) : []
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new OfflineManager();