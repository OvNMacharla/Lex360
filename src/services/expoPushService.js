import * as Notifications from 'expo-notifications';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

class ExpoPushService {
  constructor() {
    this.db = db;
  }

  // Send local notification
  async sendLocalNotification(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Send immediately
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
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(this.db, 'notifications'), notificationData);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Create notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user notifications
  async getUserNotifications(userId, limitCount = 20) {
    try {
      const q = query(
        collection(this.db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { success: true, data: notifications };
    } catch (error) {
      console.error('Get notifications error:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(this.db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send push notification to specific users (requires backend)
  async sendPushToUsers(userIds, title, body, data = {}) {
    try {
      // This would typically be done from your backend
      // For Expo Go, you can use Expo's push service directly
      // Here's an example of how to structure the request
      
      const messages = userIds.map(userId => ({
        to: userId, // This should be the Expo push token
        sound: 'default',
        title,
        body,
        data,
      }));

      // You would send this to Expo's push service
      // https://exp.host/--/api/v2/push/send
      console.log('Push messages prepared:', messages);
      
      return { success: true, messages };
    } catch (error) {
      console.error('Send push notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle notification response (when user taps notification)
  handleNotificationResponse = (response) => {
    const data = response.notification.request.content.data;
    
    // Handle different notification types
    switch (data.type) {
      case 'chat':
        // Navigate to chat screen
        console.log('Navigate to chat:', data.chatId);
        break;
      case 'consultation':
        // Navigate to consultation
        console.log('Navigate to consultation:', data.consultationId);
        break;
      case 'case_update':
        // Navigate to case details
        console.log('Navigate to case:', data.caseId);
        break;
      default:
        // Navigate to notifications screen
        console.log('Navigate to notifications');
    }
  };

  // Set up notification listeners
  setupNotificationListeners(navigation) {
    // Handle notifications when app is foregrounded
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received in foreground:', notification);
        // You can show an in-app notification here
      }
    );

    // Handle notification responses (when user taps notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        this.handleNotificationResponse(response);
      }
    );

    // Return cleanup function
    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }
}

export default new ExpoPushService();