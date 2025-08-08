import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  TouchableOpacity, 
  Image, 
  Animated,
  StatusBar
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import LawyerDashboard from '../screens/lawyer/LawyerDashboard';
import ClientDashboard from '../screens/client/ClientDashboard';
import ProfileScreen from '../screens/shared/ProfileScreen';
import AIChat from '../screens/ai/AIChatScreen';

import { SCREEN_NAMES, USER_ROLES } from '../utils/constants';
import { colors } from '../styles/colors';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { user } = useSelector((state) => state.auth);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const DashboardComponent = user?.role === USER_ROLES.LAWYER ? LawyerDashboard : ClientDashboard;

  // Enhanced Tab Icon Component with animations
  const TabBarIcon = ({ focused, iconName, label, size = 22 }) => {
    const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
    const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0.6)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: focused ? 1 : 0.9,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: focused ? 1 : 0.6,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }, [focused]);

    return (
      <View style={styles.tabIconContainer}>
        <Animated.View style={[
          styles.iconWrapper,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
            backgroundColor: focused 
              ? `${colors.primary}20` 
              : 'transparent'
          }
        ]}>
          <MaterialCommunityIcons
            name={iconName}
            size={size}
            color={focused 
              ? colors.primary 
              : (isDarkMode ? '#8E8E93' : '#8A8A8E')
            }
          />
        </Animated.View>
        <Text style={[
          styles.tabLabel,
          {
            color: focused 
              ? colors.primary 
              : (isDarkMode ? '#8E8E93' : '#8A8A8E'),
            fontWeight: focused ? '600' : '500',
            opacity: focused ? 1 : 0.8,
          }
        ]}>
          {label}
        </Text>
        {focused && (
          <View style={[
            styles.activeIndicator,
            { backgroundColor: colors.primary }
          ]} />
        )}
      </View>
    );
  };

  // Enhanced Custom Tab Bar
  const CustomTabBar = ({ state, descriptors, navigation }) => (
    <View style={styles.tabBarWrapper}>
      <LinearGradient
        colors={isDarkMode 
          ? ['rgba(28, 28, 30, 0.95)', 'rgba(44, 44, 46, 0.95)']
          : ['rgba(255, 255, 255, 0.95)', 'rgba(248, 249, 250, 0.95)']
        }
        style={styles.tabBarContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={100}
            tint={isDarkMode ? 'dark' : 'light'}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        
        {/* Floating Tab Indicator */}
        <View style={[
          styles.floatingIndicator,
          {
            left: `${(100 / state.routes.length) * state.index + 10}%`,
            width: `${100 / state.routes.length - 20}%`,
            backgroundColor: `${colors.primary}10`,
            borderColor: `${colors.primary}30`,
          }
        ]} />

        <View style={styles.tabBarContent}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            let iconName;
            let displayLabel;

            if (route.name === SCREEN_NAMES.HOME) {
              iconName = isFocused ? 'view-dashboard' : 'view-dashboard-outline';
              displayLabel = user?.role === USER_ROLES.LAWYER ? 'Practice' : 'Home';
            } else if (route.name === SCREEN_NAMES.AI_CHAT) {
              iconName = isFocused ? 'robot' : 'robot-outline';
              displayLabel = 'AI Chat';
            } else if (route.name === SCREEN_NAMES.PROFILE) {
              iconName = isFocused ? 'account-circle' : 'account-circle-outline';
              displayLabel = 'Profile';
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

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <TabBarIcon 
                  focused={isFocused} 
                  iconName={iconName} 
                  label={displayLabel} 
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
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tab.Screen
          name={SCREEN_NAMES.HOME}
          component={DashboardComponent}
          options={{
            title: user?.role === USER_ROLES.LAWYER ? 'Practice' : 'Home',
          }}
        />
        <Tab.Screen
          name={SCREEN_NAMES.AI_CHAT}
          component={AIChat}
          options={{ title: 'AI Chat' }}
        />
        <Tab.Screen
          name={SCREEN_NAMES.PROFILE}
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  // Top App Bar Styles
  topAppBar: {
    height: Platform.OS === 'ios' ? 100 : 70,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  logoImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },

  logoText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  logoSubtext: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: -2,
  },

  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  // Tab Bar Styles
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },

  tabBarContainer: {
    height: Platform.OS === 'ios' ? 80 : 65,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    position: 'relative',
  },

  floatingIndicator: {
    position: 'absolute',
    top: 8,
    height: 3,
    borderRadius: 2,
    borderWidth: 1,
  },

  tabBarContent: {
    flexDirection: 'row',
    height: '100%',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 50,
  },

  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.1,
    fontWeight: '500',
  },

  activeIndicator: {
    position: 'absolute',
    bottom: -12,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});