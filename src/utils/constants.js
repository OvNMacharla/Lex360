export const USER_ROLES = {
  LAWYER: 'lawyer',
  CLIENT: 'client',
  ADMIN: 'admin'
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
  
  // Client Screens
  CLIENT_DASHBOARD: 'ClientDashboard',
  LEGAL_DOCUMENTS: 'LegalDocuments',
  FIND_LAWYERS: 'FindLawyers',
  MY_CONSULTATIONS: 'MyConsultations',
  
  
  // Shared Screens
  AI_CHAT: 'AIChat',
  EDIT_PROFILE: 'EditProfile',
  HELP: 'HelpScreen',
  SETTING: 'SettingsScreen',
  ABOUT: 'AboutScreen',
  FEEDBACK: 'FeedbackScreen',
};

export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api' 
  : 'https://api.lex360.com/api';