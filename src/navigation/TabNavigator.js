import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import LawyerDashboard from '../screens/lawyer/LawyerDashboard';
import ClientDashboard from '../screens/client/ClientDashboard';
import ProfileScreen from '../screens/shared/ProfileScreen';
import AIChat from '../screens/ai/AIChatScreen';
import { SCREEN_NAMES, USER_ROLES } from '../utils/constants';
import { colors } from '../styles/colors';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { user } = useSelector((state) => state.auth);

  const DashboardComponent = user?.role === USER_ROLES.LAWYER ? LawyerDashboard : ClientDashboard;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === SCREEN_NAMES.HOME) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === SCREEN_NAMES.AI_CHAT) {
            iconName = focused ? 'robot' : 'robot-outline';
          } else if (route.name === SCREEN_NAMES.PROFILE) {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name={SCREEN_NAMES.HOME} 
        component={DashboardComponent}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name={SCREEN_NAMES.AI_CHAT} 
        component={AIChat}
        options={{ title: 'AI Assistant' }}
      />
      <Tab.Screen 
        name={SCREEN_NAMES.PROFILE} 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}