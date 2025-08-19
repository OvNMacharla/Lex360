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
import LawFirmDashboard from '../screens/firm/LawfirmDashboard';
import LawyerManagement from '../screens/firm/LawyerManagement';
import ClientManagement from '../screens/firm/ClientManagement';
import PracticeAreas from '../screens/firm/PracticeAreas';
import CaseOversight from '../screens/firm/CaseOverSight';
import UtilizationRate from '../screens/firm/UtilizationRate';
import Reports from '../screens/firm/Reports';
import FirmSettings from '../screens/firm/FirmSetting';

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
      <Stack.Screen name={SCREEN_NAMES.FIRM_DASHBOARD} component={LawFirmDashboard}/>
      <Stack.Screen 
        name="LawyerManagement" 
        component={LawyerManagement}
      />
      <Stack.Screen 
        name="ClientManagement" 
        component={ClientManagement}
      />
      <Stack.Screen 
        name="PracticeAreas" 
        component={PracticeAreas}
      />
      <Stack.Screen 
        name="CaseOversight" 
        component={CaseOversight}
      />
      <Stack.Screen 
        name="UtilizationRate" 
        component={UtilizationRate}
      />
      <Stack.Screen 
        name="Reports" 
        component={Reports}
      />
      <Stack.Screen 
        name="FirmSettings" 
        component={FirmSettings}
      />
    </Stack.Navigator>
  );
}
