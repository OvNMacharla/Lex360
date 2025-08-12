import messaging from 'firebase/messaging';
import { firestore } from '../config/firebase';
import { Alert, Platform } from 'react-native';
import { store } from '../store';

class NotificationService {
  constructor() {
    this.firestore = firestore();
  }

  // Request notification permission
  async requestPermission() {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        
        return { success: enabled };
      } else {
        // Android permissions are handled automatically
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Initialize push notifications
  async initialize() {
    try {
      // Get FCM token
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      
      return { success: true, token };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Save user FCM token
  async saveUserToken(userId, token) {
    try {
      await this.firestore.collection('users').doc(userId).update({
        fcmTokens: firestore.FieldValue.arrayUnion(token),
        lastTokenUpdate: firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Setup background message handler
  setupBackgroundHandler() {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
      
      // You can perform background tasks here
      // Like updating local database, etc.
    });
  }

  // Setup foreground message handler
  setupForegroundHandler(onMessageReceived) {
    return messaging().onMessage(async (remoteMessage) => {
      console.log('A new FCM message arrived!', remoteMessage);
      
      if (onMessageReceived) {
        onMessageReceived(remoteMessage);
      }
    });
  }

  // Create notification in Firestore
  async createNotification(recipientId, notification) {
    try {
      const notificationData = {
        recipientId,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        type: notification.type || 'general',
        read: false,
        createdAt: firestore.FieldValue.serverTimestamp()
      };

      await this.firestore.collection('notifications').add(notificationData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get user notifications with real-time listener
  getUserNotificationsListener(userId, callback) {
    return this.firestore
      .collection('notifications')
      .where('recipientId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot(
        (snapshot) => {
          const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          callback({ success: true, notifications });
        },
        (error) => {
          callback({ success: false, error: error.message });
        }
      );
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await this.firestore.collection('notifications').doc(notificationId).update({
        read: true,
        readAt: firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const batch = this.firestore.batch();
      const snapshot = await this.firestore
        .collection('notifications')
        .where('recipientId', '==', userId)
        .where('read', '==', false)
        .get();

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          readAt: firestore.FieldValue.serverTimestamp()
        });
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new NotificationService();