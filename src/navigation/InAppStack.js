import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ClientDashboard from '../screens/client/ClientDashboard';
import FindLawyers from '../screens/client/FindLawyers';
import AIChatScreen from '../screens/ai/AIChatScreen';
import LegalDocuments from '../screens/client/LegalDocuments'; // optional
import MyConsultations from '../screens/client/MyConsultations'; // optional
import EditProfile from '../screens/shared/EditProfile';
import SettingsScreen from '../screens/shared/Settings';
import HelpScreen from '../screens/shared/Help';
import AboutScreen from '../screens/shared/About';
import FeedbackScreen from '../screens/shared/Feedback';
import CaseManagement from '../screens/lawyer/CaseManagement'; // optional
import { SCREEN_NAMES } from '../utils/constants';
import LawyerDashboard from '../screens/lawyer/LawyerDashboard';
import AnalyticsScreen from '../screens/shared/AnalyticsScreen'; // optional
import RevenueScreen from '../screens/shared/RevenueScreen'; // optional
import ChatScreen from '../screens/shared/ChatScreen';
const Stack = createStackNavigator();

export default function InAppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={SCREEN_NAMES.CLIENT_DASHBOARD} component={ClientDashboard} />
      <Stack.Screen name={SCREEN_NAMES.FIND_LAWYERS} component={FindLawyers} />
      <Stack.Screen name={SCREEN_NAMES.AI_CHAT} component={AIChatScreen} />
      <Stack.Screen name={SCREEN_NAMES.LEGAL_DOCUMENTS} component={LegalDocuments} />
      <Stack.Screen name={SCREEN_NAMES.MY_CONSULTATIONS} component={MyConsultations} />
      <Stack.Screen name={SCREEN_NAMES.EDIT_PROFILE} component={EditProfile} />
      <Stack.Screen name={SCREEN_NAMES.SETTING} component={SettingsScreen} />
      <Stack.Screen name={SCREEN_NAMES.HELP} component={HelpScreen} />
      <Stack.Screen name={SCREEN_NAMES.ABOUT} component={AboutScreen} />
      <Stack.Screen name={SCREEN_NAMES.FEEDBACK} component={FeedbackScreen} />
      <Stack.Screen name={SCREEN_NAMES.CASE_MANAGEMENT} component={CaseManagement} />
      <Stack.Screen name={SCREEN_NAMES.ANALYTICS} component={AnalyticsScreen} />
      <Stack.Screen name={SCREEN_NAMES.REVENUE} component={RevenueScreen} />
      <Stack.Screen name={SCREEN_NAMES.LAWYER_DASHBOARD} component={LawyerDashboard} />
      <Stack.Screen name={SCREEN_NAMES.CHAT} component={ChatScreen} />
    </Stack.Navigator>
  );
}
