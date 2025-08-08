import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  TouchableOpacity, 
  Animated,
  StatusBar,
  Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// Import screens (you'll need to create these)
import FeedScreen from '../screens/shared/FeedScreen';
import ConnectionsScreen from '../screens/shared/ConnectionsScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
// import JobsScreen from '../screens/shared/JobsScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';

import { SCREEN_NAMES, USER_ROLES } from '../utils/constants';

const { width } = Dimensions.get('window');

// Premium color palette
const colors = {
  primary: '#0F0F23',
  primaryLight: '#1A1A3A',
  secondary: '#D4AF37',
  tertiary: '#8B5CF6',
  accent: '#06FFA5',
  linkedin: '#0A66C2',
  background: '#FAFBFF',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  gradient: {
    primary: ['#0F0F23', '#1A1A3A'],
    linkedin: ['#0A66C2', '#004182'],
    gold: ['#D4AF37', '#FFD700'],
    purple: ['#8B5CF6', '#A855F7'],
    green: ['#10B981', '#34D399'],
  }
};

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { user } = useSelector((state) => state.auth);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  // Enhanced Tab Icon Component with premium animations
  const TabBarIcon = ({ focused, iconName, label, size = 22, badgeCount = 0 }) => {
    const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
    const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0.6)).current;
    const bounceAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: focused ? 1.1 : 0.9,
          useNativeDriver: true,
          tension: 200,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: focused ? 1 : 0.6,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();

      if (focused) {
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          })
        ]).start();
      }
    }, [focused]);

    return (
      <View style={styles.tabIconContainer}>
        <Animated.View style={[
          styles.iconWrapper,
          {
            transform: [{ scale: scaleAnim }, { scale: bounceAnim }],
            opacity: opacityAnim,
            backgroundColor: focused 
              ? `${colors.linkedin}20` 
              : 'transparent'
          }
        ]}>
          <MaterialCommunityIcons
            name={iconName}
            size={size}
            color={focused 
              ? colors.linkedin 
              : (isDarkMode ? '#8E8E93' : '#8A8A8E')
            }
          />
          {badgeCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {badgeCount > 99 ? '99+' : badgeCount}
              </Text>
            </View>
          )}
        </Animated.View>
        
        <Text style={[
          styles.tabLabel,
          {
            color: focused 
              ? colors.linkedin 
              : (isDarkMode ? '#8E8E93' : '#8A8A8E'),
            fontWeight: focused ? '700' : '500',
            opacity: focused ? 1 : 0.8,
          }
        ]}>
          {label}
        </Text>
        
        {focused && (
          <Animated.View style={[
            styles.activeIndicator,
            { backgroundColor: colors.linkedin }
          ]} />
        )}
      </View>
    );
  };

  // Premium Custom Tab Bar with LinkedIn-style design
  const CustomTabBar = ({ state, descriptors, navigation }) => (
    <View style={styles.tabBarWrapper}>
      <LinearGradient
        colors={isDarkMode 
          ? ['rgba(28, 28, 30, 0.98)', 'rgba(44, 44, 46, 0.98)']
          : ['rgba(255, 255, 255, 0.98)', 'rgba(248, 249, 250, 0.98)']
        }
        style={styles.tabBarContainer}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={100}
            tint={isDarkMode ? 'dark' : 'light'}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        
        {/* Animated floating indicator */}
        <Animated.View style={[
          styles.floatingIndicator,
          {
            left: `${(100 / state.routes.length) * state.index + 8}%`,
            width: `${100 / state.routes.length - 16}%`,
            backgroundColor: `${colors.linkedin}15`,
            borderColor: `${colors.linkedin}40`,
          }
        ]} />

        <View style={styles.tabBarContent}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            let iconName, displayLabel, badgeCount = 0;

            switch (route.name) {
              case SCREEN_NAMES.FEED:
                iconName = isFocused ? 'home' : 'home-outline';
                displayLabel = 'Feed';
                break;
              case SCREEN_NAMES.CONNECTIONS:
                iconName = isFocused ? 'account-group' : 'account-group-outline';
                displayLabel = 'Network';
                badgeCount = 3; // New connection requests
                break;
              // case SCREEN_NAMES.JOBS:
              //   iconName = isFocused ? 'briefcase' : 'briefcase-outline';
              //   displayLabel = user?.role === USER_ROLES.LAWYER ? 'Cases' : 'Jobs';
              //   break;
              case SCREEN_NAMES.CHAT:
                iconName = isFocused ? 'message' : 'message-outline';
                displayLabel = 'Messages';
                badgeCount = 5; // Unread messages
                break;
              case SCREEN_NAMES.NOTIFICATIONS:
                iconName = isFocused ? 'bell' : 'bell-outline';
                displayLabel = 'Alerts';
                badgeCount = 12; // Unread notifications
                break;
              case SCREEN_NAMES.PROFILE:
                iconName = isFocused ? 'account-circle' : 'account-circle-outline';
                displayLabel = 'Profile';
                break;
              default:
                iconName = 'help-circle-outline';
                displayLabel = 'Unknown';
            }

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabItem}
                activeOpacity={0.8}
              >
                <TabBarIcon 
                  focused={isFocused} 
                  iconName={iconName} 
                  label={displayLabel}
                  badgeCount={badgeCount}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
        initialRouteName={SCREEN_NAMES.FEED}
      >
        {/* Feed/Home Screen */}
        <Tab.Screen
          name={SCREEN_NAMES.FEED}
          component={FeedScreen}
          options={{
            title: 'Feed',
            tabBarLabel: 'Feed',
          }}
        />

        {/* Network/Connections Screen */}
        <Tab.Screen
          name={SCREEN_NAMES.CONNECTIONS}
          component={ConnectionsScreen}
          options={{
            title: 'Network',
            tabBarLabel: 'Network',
          }}
        />

        {/* Jobs/Cases Screen */}
        {/* <Tab.Screen
          name={SCREEN_NAMES.JOBS}
          component={JobsScreen}
          options={{
            title: user?.role === USER_ROLES.LAWYER ? 'Cases' : 'Jobs',
            tabBarLabel: user?.role === USER_ROLES.LAWYER ? 'Cases' : 'Jobs',
          }}
        /> */}

        {/* Messages/Chat Screen */}
        <Tab.Screen
          name={SCREEN_NAMES.CHAT}
          component={ChatScreen}
          options={{
            title: 'Messages',
            tabBarLabel: 'Messages',
          }}
        />

        {/* Notifications Screen */}
        <Tab.Screen
          name={SCREEN_NAMES.NOTIFICATIONS}
          component={NotificationsScreen}
          options={{
            title: 'Notifications',
            tabBarLabel: 'Alerts',
          }}
        />

        {/* Profile Screen */}
        <Tab.Screen
          name={SCREEN_NAMES.PROFILE}
          component={ProfileScreen}
          options={{
            title: 'Profile',
            tabBarLabel: 'Profile',
          }}
        />
      </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  // Tab Bar Wrapper
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },

  // Premium Tab Bar Container
  tabBarContainer: {
    height: Platform.OS === 'ios' ? 85 : 70,
    borderTopWidth: 1,
    borderTopColor: 'rgba(10, 102, 194, 0.1)',
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    position: 'relative',
  },

  // Floating indicator for active tab
  floatingIndicator: {
    position: 'absolute',
    top: 6,
    height: 3,
    borderRadius: 2,
    borderWidth: 1,
  },

  // Tab Bar Content Container
  tabBarContent: {
    flexDirection: 'row',
    height: '100%',
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },

  // Individual Tab Item
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },

  // Tab Icon Container
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 55,
    width: '100%',
  },

  // Icon Wrapper with background
  iconWrapper: {
    width: 48,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
  },

  // Notification Badge
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  // Badge Text
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Tab Label
  tabLabel: {
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.2,
    fontWeight: '600',
    marginTop: 2,
  },

  // Active Tab Indicator
  activeIndicator: {
    position: 'absolute',
    bottom: -15,
    width: 4,
    height: 4,
    borderRadius: 2,
    elevation: 2,
    shadowColor: colors.linkedin,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
});

// Screen names constants (add to your constants file)
export const ADDITIONAL_SCREEN_NAMES = {
  FEED: 'Feed',
  CONNECTIONS: 'Connections',
  JOBS: 'Jobs',
  CHAT: 'Chat',
  NOTIFICATIONS: 'Notifications',
  PROFILE: 'Profile',
};