export const USER_ROLES = {
  LAWYER: 'lawyer',
  CLIENT: 'client',
  ADMIN: 'admin',
  FIRM: 'firm'
};

export const SCREEN_NAMES = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  
  // Main Tabs
  HOME: 'Home',
  SEARCH: 'Search',
  CHAT: 'Chat',
  PROFILE: 'Profile',
  
  // Lawyer Screens
  LAWYER_DASHBOARD: 'LawyerDashboard',
  CASE_MANAGEMENT: 'CaseManagement',
  FIRM_DASHBOARD: 'LawFirmDashboard',
  
  // Client Screens
  CLIENT_DASHBOARD: 'ClientDashboard',
  LEGAL_DOCUMENTS: 'LegalDocuments',
  FIND_LAWYERS: 'FindLawyers',
  MY_CONSULTATIONS: 'MyConsultations',

  //Firm Screens
  LAWYER_MANAGEMENT: 'LawyerManagement',
  CLIENT_MANAGEMENT: 'ClientManagement', 
  PRACTICE_AREAS: 'PracticeAreas',
  CASE_OVERSIGHT: 'CaseOversight',
  UTILIZATION_RATE: 'UtilizationRate',
  REPORTS: 'Reports',
  FIRM_SETTINGS: 'FirmSettings',
  CLIENT_PORTAL:'ClientDetails',
  
  // Shared Screens
  AI_CHAT: 'AIChat',
  EDIT_PROFILE: 'EditProfile',
  HELP: 'HelpScreen',
  SETTING: 'SettingsScreen',
  ABOUT: 'AboutScreen',
  FEEDBACK: 'FeedbackScreen',
  ANALYTICS: 'AnalyticsScreen',
  REVENUE: 'RevenueScreen',
  NOTIFICATIONS: 'Notifications',
  CONNECTIONS: 'Connections',
  JOBS: 'Jobs',
  CHAT: 'ChatScreen',
  FEED: 'Feed',
  PROFILE: 'ProfileScreen',
};

export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api' 
  : 'https://api.lex360.com/api';