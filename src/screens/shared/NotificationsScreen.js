// First install required dependencies:
// npm install expo-notifications @react-native-async-storage/async-storage

// src/services/notificationService.js
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  async init() {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Get push token
    this.expoPushToken = await this.getExpoPushToken();
    
    // Store token for API calls
    if (this.expoPushToken) {
      await AsyncStorage.setItem('expoPushToken', this.expoPushToken);
    }

    // Set up listeners
    this.setupListeners();
  }

  async getExpoPushToken() {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  setupListeners() {
    // Listen for incoming notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(
      this.handleNotificationReceived
    );

    // Listen for notification responses (when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse
    );
  }

  handleNotificationReceived = (notification) => {
    console.log('Notification received:', notification);
    // Handle incoming notification
    // You can update app state, show in-app notification, etc.
  };

  handleNotificationResponse = (response) => {
    console.log('Notification response:', response);
    const { notification } = response;
    const data = notification.request.content.data;
    
    // Navigate based on notification data
    if (data.type === 'consultation') {
      // Navigate to consultation screen
    } else if (data.type === 'message') {
      // Navigate to chat screen
    }
  };

  async scheduleLocalNotification(title, body, data = {}, trigger = null) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: trigger || null, // null means immediate
      });
      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async cancelNotification(notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export const notificationService = new NotificationService();

// src/screens/shared/NotificationsScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { 
  Card, 
  Text, 
  Text, 
  Avatar, 
  Button,
  List,
  Badge,
  Surface,
  IconButton
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import { colors } from '../../styles/colors';
import { EmptyState, LoadingSpinner } from '../../components/ui/LoadingStates';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read

  // Mock notifications data
  const mockNotifications = [
    {
      id: '1',
      type: 'consultation',
      title: 'Consultation Reminder',
      message: 'You have a consultation with Adv. Sharma in 30 minutes',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: false,
      avatar: 'calendar',
      priority: 'high'
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'Adv. Patel replied to your query about property law',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      avatar: 'message',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'document',
      title: 'Document Reviewed',
      message: 'Your rental agreement has been reviewed and approved',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
      avatar: 'file-check',
      priority: 'low'
    },
    {
      id: '4',
      type: 'payment',
      title: 'Payment Successful',
      message: 'Consultation fee of ₹2,000 has been processed',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      avatar: 'credit-card',
      priority: 'medium'
    },
    {
      id: '5',
      type: 'system',
      title: 'Profile Verification',
      message: 'Your lawyer profile has been verified successfully',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      avatar: 'check-circle',
      priority: 'low'
    }
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'read':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.info;
      default: return colors.textSecondary;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderNotification = ({ item }) => (
    <Card 
      style={[
        styles.notificationCard,
        !item.read && styles.unreadCard
      ]} 
      elevation={!item.read ? 3 : 1}
      onPress={() => markAsRead(item.id)}
    >
      <Card.Content>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationLeft}>
            <Avatar.Icon 
              size={40} 
              icon={item.avatar}
              style={[styles.notificationAvatar, { backgroundColor: getPriorityColor(item.priority) + '20' }]}
            />
            <View style={styles.notificationContent}>
              <View style={styles.titleRow}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                {!item.read && <Badge style={styles.unreadBadge} />}
              </View>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {item.message}
              </Text>
              <Text style={styles.timestamp}>
                {getTimeAgo(item.timestamp)}
              </Text>
            </View>
          </View>
          <View style={styles.notificationActions}>
            <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
            <IconButton
              icon="delete-outline"
              size={18}
              onPress={() => deleteNotification(item.id)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

if (loading) {
    return <LoadingSpinner text="Loading notifications..." />;
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <Button
            mode="text"
            onPress={markAllAsRead}
            compact
          >
            Mark all as read
          </Button>
        )}
      </View>

      <View style={styles.filterBar}>
        <Button
          mode={filter === 'all' ? 'contained' : 'text'}
          onPress={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          mode={filter === 'unread' ? 'contained' : 'text'}
          onPress={() => setFilter('unread')}
        >
          Unread
        </Button>
        <Button
          mode={filter === 'read' ? 'contained' : 'text'}
          onPress={() => setFilter('read')}
        >
          Read
        </Button>
      </View>

      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon="bell-off-outline"
          message="No notifications to show"
        />
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  list: {
    paddingBottom: 20,
  },
  notificationCard: {
    marginBottom: 12,
    borderRadius: 10,
  },
  unreadCard: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  notificationAvatar: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  unreadBadge: {
    marginLeft: 6,
    backgroundColor: colors.primary,
  },
  notificationMessage: {
    color: colors.textSecondary,
    marginVertical: 2,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  notificationActions: {
    alignItems: 'flex-end',
  },
  priorityIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
});