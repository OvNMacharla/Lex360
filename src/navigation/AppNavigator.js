// src/navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { SCREEN_NAMES } from '../utils/constants';
import TabNavigator from './TabNavigator';
import InAppStack from './InAppStack';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="InApp" component={InAppStack} />
        </>
      ) : (
        <>
          <Stack.Screen name={SCREEN_NAMES.LOGIN} component={LoginScreen} />
          <Stack.Screen name={SCREEN_NAMES.REGISTER} component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
